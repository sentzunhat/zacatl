import type { StatementSync } from 'node:sqlite';

import type { InjectionToken } from '@zacatl/third-party/dependency-injection/tsyringe';

import { getContainer, resolveDependency } from '../../../../../dependency-injection';
import { InternalServerError } from '../../../../../error';
import { uuidv4 } from '../../../../../third-party';
import type {
  NodeSqliteRepositoryConfig,
  NodeSqliteRepositoryModel,
  ORMPort,
  QueryOptions,
} from '../../repositories/types';
import { DEFAULT_QUERY_LIMIT } from '../../repositories/types';
import { createDatabaseToken } from '../tokens/factory';

/**
 * Node.js SQLite ORM Adapter (node:sqlite)
 *
 * Provides CRUD and query operations for SQLite tables using the built-in
 * node:sqlite module available in Node.js 26+.
 *
 * Uses prepared statements for type safety and performance.
 * Defensive mode is enabled by default to prevent database corruption.
 */
export class NodeSqliteAdapter<I extends object, O extends object>
  implements ORMPort<NodeSqliteRepositoryModel, I, O, Partial<O>>
{
  // Resolved lazily on first use so that Service construction succeeds
  // even when the node:sqlite DatabaseSync is registered later in start().
  private _model: NodeSqliteRepositoryModel | undefined;
  private _tableReady = false;
  private readonly config: NodeSqliteRepositoryConfig;
  // Prepared statement cache — avoids re-parsing SQL on every CRUD call.
  // Bounded LRU: findMany emits a distinct SQL string per filter-key shape,
  // so an unbounded cache would grow with dynamic per-request filters.
  private static readonly STMT_CACHE_MAX = 128;
  private readonly _stmtCache = new Map<string, StatementSync>();

  constructor(config: NodeSqliteRepositoryConfig) {
    this.config = config;
  }

  // Satisfies ORMPort<NodeSqliteRepositoryModel, ...> — resolves and
  // ensures the table exists on first access, then caches the handle.
  get model(): NodeSqliteRepositoryModel {
    if (this._model === undefined) {
      this._model = this.resolveModel();
    }

    if (!this._tableReady) {
      this.ensureTableExists();
      this._tableReady = true;
    }

    return this._model;
  }

  async ready(): Promise<void> {
    void this.model;
  }

  private resolveModel(): NodeSqliteRepositoryModel {
    const connectionName = this.config.connection?.name ?? 'SQLITE';
    const token = createDatabaseToken('SQLITE', connectionName) as InjectionToken<NodeSqliteRepositoryModel>;

    const resolved = getContainer().isRegistered(token)
      ? resolveDependency<NodeSqliteRepositoryModel>(token)
      : undefined;
    const candidate = resolved as unknown as Record<string, unknown> | undefined;

    if (
      resolved == null ||
      typeof candidate?.['prepare'] !== 'function' ||
      typeof candidate?.['exec'] !== 'function'
    ) {
      throw new InternalServerError({
        message: 'node:sqlite database instance is not valid or not registered in DI container',
        reason:
          'Database token must resolve to a DatabaseSync instance with prepare() and exec(). ' +
          'Ensure Service.start() is called before issuing queries so the database ' +
          'connection is open and the token is registered.',
        component: this.constructor.name,
        operation: 'resolveModel',
        metadata: { connectionName },
      });
    }

    return resolved;
  }

  private getTableName(): string {
    const { name } = this.config;

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      throw new InternalServerError({
        message: `Invalid node:sqlite table name: ${name}`,
        reason: 'Table name must be a safe SQLite identifier',
        component: this.constructor.name,
        operation: 'getTableName',
        metadata: { name },
      });
    }

    return name;
  }

  private ensureTableExists(): void {
    // Use the backing field, not the getter, to avoid recursive resolution.
    const database = this._model!;
    const name = this.getTableName();
    try {
      const checkTable = database.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      );
      const exists = checkTable.get(name);

      if (exists == null) {
        // Create table with standard fields if it doesn't exist.
        // Defensive mode is enabled by default in Node 26+ — SQL language features
        // that can corrupt the database file are blocked.
        database.exec(`
          CREATE TABLE IF NOT EXISTS ${name} (
            id TEXT PRIMARY KEY,
            data TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);
      }
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new InternalServerError({
        message: `Failed to ensure node:sqlite table exists: ${error.message}`,
        reason: 'Table initialization failed',
        component: this.constructor.name,
        operation: 'ensureTableExists',
      });
    }
  }

  private prepare(sql: string): StatementSync {
    let stmt = this._stmtCache.get(sql);
    if (stmt !== undefined) {
      // Refresh recency so hot statements survive eviction.
      this._stmtCache.delete(sql);
      this._stmtCache.set(sql, stmt);
      return stmt;
    }
    stmt = this.model.prepare(sql);
    if (this._stmtCache.size >= NodeSqliteAdapter.STMT_CACHE_MAX) {
      const oldest = this._stmtCache.keys().next().value;
      if (oldest !== undefined) this._stmtCache.delete(oldest);
    }
    this._stmtCache.set(sql, stmt);
    return stmt;
  }

  private toSqlFilterValue(value: unknown): string | number | null | undefined {
    if (typeof value === 'string') return value;
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'boolean') return value ? 1 : 0;
    if (value === null) return null;
    return undefined;
  }

  async findById(id: string): Promise<O | null> {
    try {
      const stmt = this.prepare(
        `SELECT id, data, createdAt, updatedAt FROM ${this.getTableName()} WHERE id = ?`,
      );
      const row = stmt.get(id) as
        | { id: string; data: string; createdAt: string | Date; updatedAt: string | Date }
        | undefined;

      if (!row) return null;

      return this.toLean(row);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new InternalServerError({
        message: `Failed to find record by id: ${error.message}`,
        reason: 'node:sqlite query failed',
        component: this.constructor.name,
        operation: 'findById',
        metadata: { id },
      });
    }
  }

  async findMany(filter: Partial<O> = {}, options?: QueryOptions): Promise<O[]> {
    try {
      const limit = Math.max(0, Math.min(options?.limit ?? DEFAULT_QUERY_LIMIT, 1000));
      const offset = Math.max(0, options?.offset ?? 0);
      const filterEntries = Object.entries(filter) as [keyof O, unknown][];
      const predicates: string[] = [];
      const values: Array<string | number | null> = [];

      for (const [key, value] of filterEntries) {
        const sqlValue = this.toSqlFilterValue(value);

        // JSON-backed entities can only be queried by JSON scalar values.
        // Unsupported values (objects, dates, undefined) cannot match after
        // serialization, so avoid issuing a broad query for them.
        if (sqlValue === undefined) return [];

        if (key === 'id') {
          predicates.push('id IS ?');
          values.push(sqlValue);
          continue;
        }

        // The JSON path is bound rather than interpolated, so arbitrary property
        // names cannot alter the query. `IS` also preserves null comparisons.
        predicates.push('json_extract(data, ?) IS ?');
        values.push(`$.${JSON.stringify(String(key))}`, sqlValue);
      }

      const where = predicates.length > 0 ? ` WHERE ${predicates.join(' AND ')}` : '';

      const stmt = this.prepare(
        `SELECT id, data, createdAt, updatedAt FROM ${this.getTableName()}${where} LIMIT ? OFFSET ?`,
      );
      const rows = stmt.all(...values, limit, offset) as Array<{
        id: string;
        data: string;
        createdAt: string | Date;
        updatedAt: string | Date;
      }>;

      return rows.map((row) => this.toLean(row)).filter((row): row is O => row != null);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new InternalServerError({
        message: `Failed to find records: ${error.message}`,
        reason: 'node:sqlite query failed',
        component: this.constructor.name,
        operation: 'findMany',
      });
    }
  }

  async create(entity: I): Promise<O> {
    try {
      const id = uuidv4();
      const now = new Date();

      const stmt = this.prepare(
        `INSERT INTO ${this.getTableName()} (id, data, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
      );
      stmt.run(id, JSON.stringify(entity), now.toISOString(), now.toISOString());

      return this.toLean({
        id,
        data: entity,
        createdAt: now,
        updatedAt: now,
      }) as O;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new InternalServerError({
        message: `Failed to create record: ${error.message}`,
        reason: 'node:sqlite insert failed',
        component: this.constructor.name,
        operation: 'create',
      });
    }
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    try {
      const existing = await this.findById(id);

      if (!existing) return null;

      const now = new Date();
      const existingPayload = { ...(existing as Record<string, unknown>) };
      delete existingPayload['id'];
      delete existingPayload['createdAt'];
      delete existingPayload['updatedAt'];
      const updatedData = { ...existingPayload, ...update };

      const stmt = this.prepare(
        `UPDATE ${this.getTableName()} SET data = ?, updatedAt = ? WHERE id = ?`,
      );
      stmt.run(JSON.stringify(updatedData), now.toISOString(), id);

      return this.toLean({
        id,
        data: updatedData,
        createdAt: (existing as Record<string, unknown>)['createdAt'] ?? now,
        updatedAt: now,
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new InternalServerError({
        message: `Failed to update record: ${error.message}`,
        reason: 'node:sqlite update failed',
        component: this.constructor.name,
        operation: 'update',
        metadata: { id },
      });
    }
  }

  async delete(id: string): Promise<O | null> {
    try {
      const existing = await this.findById(id);

      if (!existing) return null;

      const stmt = this.prepare(`DELETE FROM ${this.getTableName()} WHERE id = ?`);
      stmt.run(id);

      return existing;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new InternalServerError({
        message: `Failed to delete record: ${error.message}`,
        reason: 'node:sqlite delete failed',
        component: this.constructor.name,
        operation: 'delete',
        metadata: { id },
      });
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const stmt = this.prepare(`SELECT 1 FROM ${this.getTableName()} WHERE id = ? LIMIT 1`);
      return (stmt.get(id) as { '1': number } | undefined) != null;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new InternalServerError({
        message: `Failed to check if record exists: ${error.message}`,
        reason: 'node:sqlite query failed',
        component: this.constructor.name,
        operation: 'exists',
        metadata: { id },
      });
    }
  }

  public toLean(input: unknown): O | null {
    if (input == null) {
      return null;
    }

    try {
      let plain: Record<string, unknown>;

      if (typeof input === 'string') {
        plain = JSON.parse(input) as Record<string, unknown>;
      } else if (typeof input === 'object') {
        const row = input as Record<string, unknown>;

        if ('data' in row) {
          const data = row['data'];
          const parsed =
            typeof data === 'string'
              ? (JSON.parse(data) as Record<string, unknown>)
              : typeof data === 'object' && data != null
              ? (data as Record<string, unknown>)
              : {};

          plain = {
            ...parsed,
            id: row['id'] ?? parsed['id'] ?? parsed['_id'],
            createdAt: row['createdAt'] ?? parsed['createdAt'],
            updatedAt: row['updatedAt'] ?? parsed['updatedAt'],
          };
        } else {
          plain = row;
        }
      } else {
        return null;
      }

      const idValue = plain['id'] ?? plain['_id'];
      const createdAtValue = plain['createdAt'];
      const updatedAtValue = plain['updatedAt'];

      return {
        ...plain,
        id: idValue != null ? String(idValue) : '',
        createdAt:
          createdAtValue instanceof Date
            ? createdAtValue
            : createdAtValue != null
            ? new Date(createdAtValue as string | number | Date)
            : new Date(),
        updatedAt:
          updatedAtValue instanceof Date
            ? updatedAtValue
            : updatedAtValue != null
            ? new Date(updatedAtValue as string | number | Date)
            : new Date(),
      } as O;
    } catch {
      return null;
    }
  }
}
