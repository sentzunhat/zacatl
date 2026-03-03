import { InternalServerError } from '../../../../../error';
import { uuidv4 } from '../../../../../third-party';
import type {
  NodeSqliteRepositoryConfig,
  NodeSqliteRepositoryModel,
  ORMPort,
} from '../../repositories/types';

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
  implements ORMPort<NodeSqliteRepositoryModel, I, O>
{
  private readonly config: NodeSqliteRepositoryConfig;

  constructor(config: NodeSqliteRepositoryConfig) {
    this.config = config;
    this.ensureTableExists();
  }

  public get model(): NodeSqliteRepositoryModel {
    return this.config.database;
  }

  private ensureTableExists(): void {
    const { database, tableName } = this.config;
    try {
      // Check if table exists, create if not
      const checkTable = database.prepare(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
      );
      const exists = checkTable.get(tableName);

      if (exists == null) {
        // Create table with standard fields if it doesn't exist
        // Defensive mode is enabled by default in Node 24+ — SQL language features
        // that can corrupt the database file are blocked
        database.exec(`
          CREATE TABLE IF NOT EXISTS ${tableName} (
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
        component: 'NodeSqliteAdapter',
        operation: 'ensureTableExists',
      });
    }
  }

  public toLean(input: unknown): O | null {
    if (input == null) return null;

    try {
      if (typeof input === 'string') {
        const parsed = JSON.parse(input);
        return parsed as O;
      }
      if (typeof input === 'object') {
        return input as O;
      }
      return null;
    } catch {
      return null;
    }
  }

  async findById(id: string): Promise<O | null> {
    try {
      const { database, tableName } = this.config;
      const stmt = database.prepare(`SELECT data FROM ${tableName} WHERE id = ?`);
      const row = stmt.get(id) as { data: string } | undefined;

      if (!row) return null;

      return this.toLean(row.data);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new InternalServerError({
        message: `Failed to find record by id: ${error.message}`,
        reason: 'node:sqlite query failed',
        component: 'NodeSqliteAdapter',
        operation: 'findById',
        metadata: { id },
      });
    }
  }

  async findMany(_filter?: Record<string, unknown>): Promise<O[]> {
    try {
      const { database, tableName } = this.config;
      const stmt = database.prepare(`SELECT data FROM ${tableName}`);
      const rows = stmt.all() as { data: string }[];

      return rows.map((row) => this.toLean(row.data) as O);
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new InternalServerError({
        message: `Failed to find records: ${error.message}`,
        reason: 'node:sqlite query failed',
        component: 'NodeSqliteAdapter',
        operation: 'findMany',
      });
    }
  }

  async create(entity: I): Promise<O> {
    try {
      const { database, tableName } = this.config;
      const id = uuidv4();
      const now = new Date();

      const stmt = database.prepare(
        `INSERT INTO ${tableName} (id, data, createdAt, updatedAt) VALUES (?, ?, ?, ?)`,
      );
      stmt.run(id, JSON.stringify(entity), now.toISOString(), now.toISOString());

      return {
        ...entity,
        id,
        createdAt: now,
        updatedAt: now,
      } as unknown as O;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new InternalServerError({
        message: `Failed to create record: ${error.message}`,
        reason: 'node:sqlite insert failed',
        component: 'NodeSqliteAdapter',
        operation: 'create',
      });
    }
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    try {
      const { database, tableName } = this.config;
      const existing = await this.findById(id);

      if (!existing) return null;

      const now = new Date();
      const updated = { ...existing, ...update };

      const stmt = database.prepare(`UPDATE ${tableName} SET data = ?, updatedAt = ? WHERE id = ?`);
      stmt.run(JSON.stringify(updated), now.toISOString(), id);

      return {
        ...updated,
        updatedAt: now,
      } as unknown as O;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new InternalServerError({
        message: `Failed to update record: ${error.message}`,
        reason: 'node:sqlite update failed',
        component: 'NodeSqliteAdapter',
        operation: 'update',
        metadata: { id },
      });
    }
  }

  async delete(id: string): Promise<O | null> {
    try {
      const { database, tableName } = this.config;
      const existing = await this.findById(id);

      if (!existing) return null;

      const stmt = database.prepare(`DELETE FROM ${tableName} WHERE id = ?`);
      stmt.run(id);

      return existing;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new InternalServerError({
        message: `Failed to delete record: ${error.message}`,
        reason: 'node:sqlite delete failed',
        component: 'NodeSqliteAdapter',
        operation: 'delete',
        metadata: { id },
      });
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const { database, tableName } = this.config;
      const stmt = database.prepare(`SELECT 1 FROM ${tableName} WHERE id = ? LIMIT 1`);
      return (stmt.get(id) as { '1': number } | undefined) != null;
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      throw new InternalServerError({
        message: `Failed to check if record exists: ${error.message}`,
        reason: 'node:sqlite query failed',
        component: 'NodeSqliteAdapter',
        operation: 'exists',
        metadata: { id },
      });
    }
  }
}
