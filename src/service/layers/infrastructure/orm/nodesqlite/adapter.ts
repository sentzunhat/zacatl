import type { InjectionToken } from '@zacatl/third-party/dependency-injection/tsyringe';

import { resolveDependency } from '../../../../../dependency-injection';
import { InternalServerError } from '../../../../../error';
import { uuidv4 } from '../../../../../third-party';
import type {
  NodeSqliteRepositoryConfig,
  NodeSqliteRepositoryModel,
  ORMPort,
} from '../../repositories/types';
import { NodeSqliteToken } from '../tokens';

/**
 * Node.js SQLite ORM Adapter (node:sqlite)
 *
 * Provides CRUD and query operations for SQLite tables using the built-in
 * node:sqlite module available in Node.js 24+.
 *
 * Uses prepared statements for type safety and performance.
 * Defensive mode is enabled by default to prevent database corruption.
 */
export class NodeSqliteAdapter<I extends object, O extends object>
  implements ORMPort<NodeSqliteRepositoryModel, I, O, Partial<O>>
{
  public readonly model: NodeSqliteRepositoryModel;
  private readonly config: NodeSqliteRepositoryConfig;

  constructor(config: NodeSqliteRepositoryConfig) {
    this.config = config;
    this.model = this.resolveModel();

    void this.initialize().catch(console.error);
  }

  private resolveModel(): NodeSqliteRepositoryModel {
    const token = NodeSqliteToken as InjectionToken<NodeSqliteRepositoryModel>;
    const resolved = resolveDependency<NodeSqliteRepositoryModel>(token);
    const candidate = resolved as unknown as Record<string, unknown>;

    if (
      resolved == null ||
      typeof candidate['prepare'] !== 'function' ||
      typeof candidate['exec'] !== 'function'
    ) {
      throw new InternalServerError({
        message: 'node:sqlite database instance is not valid or not registered in DI container',
        reason:
          'NodeSqliteToken must resolve to a DatabaseSync instance with prepare() and exec(). ' +
          'Ensure database registration occurs before repository construction.',
        component: this.constructor.name,
        operation: 'constructor',
      });
    }

    return resolved;
  }

  private async initialize(): Promise<void> {
    this.ensureTableExists();
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
    const database = this.model;
    const name = this.getTableName();
    try {
      const checkTable = database.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      );
      const exists = checkTable.get(name);

      if (exists == null) {
        // Create table with standard fields if it doesn't exist.
        // Defensive mode is enabled by default in Node 24+ — SQL language features
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

  async findById(id: string): Promise<O | null> {
    try {
      const stmt = this.model.prepare(
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

  async findMany(filter: Partial<O> = {}): Promise<O[]> {
    try {
      const stmt = this.model.prepare(
        `SELECT id, data, createdAt, updatedAt FROM ${this.getTableName()}`,
      );
      const rows = stmt.all() as Array<{
        id: string;
        data: string;
        createdAt: string | Date;
        updatedAt: string | Date;
      }>;

      const results = rows.map((row) => this.toLean(row)).filter((row): row is O => row != null);
      const filterEntries = Object.entries(filter) as [keyof O, unknown][];

      if (filterEntries.length === 0) {
        return results;
      }

      return results.filter((item) =>
        filterEntries.every(([key, value]) => {
          const actual = (item as Record<string, unknown>)[key as string];
          return actual === value;
        }),
      );
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

      const stmt = this.model.prepare(
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

      const stmt = this.model.prepare(
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

      const stmt = this.model.prepare(`DELETE FROM ${this.getTableName()} WHERE id = ?`);
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
      const stmt = this.model.prepare(`SELECT 1 FROM ${this.getTableName()} WHERE id = ? LIMIT 1`);
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
        ...(plain as O),
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
