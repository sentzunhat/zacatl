import { DatabaseSync } from 'node:sqlite';

import { CustomError } from '@zacatl/error';

import type { DatabaseConfig, DatabaseServerPort } from './port';

/**
 * SQLite adapter using the Node.js built-in `node:sqlite` module.
 *
 * Defensive mode is enabled by default in Node 24+, which blocks SQL
 * language features that can corrupt the database file.
 *
 * The `connectionString` is used as the SQLite file path.
 * Use `':memory:'` for an in-memory database.
 *
 * @example
 * ```typescript
 * import { DatabaseVendor, ServerVendor } from '@sentzunhat/zacatl';
 *
 * const service = new Service({
 *   platform: {
 *     databases: [{
 *       vendor: DatabaseVendor.SQLITE,
 *       connectionString: 'app.db',
 *     }],
 *   },
 * });
 * ```
 */
export class SqliteAdapter implements DatabaseServerPort {
  private db: DatabaseSync | undefined;

  async connect(_serviceName: string, config: DatabaseConfig): Promise<void> {
    const { connectionString } = config;

    if (connectionString == null || connectionString.length === 0) {
      throw new CustomError({
        message: 'SQLite connection string (file path) is required',
        code: 500,
        reason: 'connectionString must be a valid file path or :memory:',
      });
    }

    try {
      // DatabaseSync opens the connection synchronously.
      // defensive: true is the default in Node 24 — explicitly set for clarity.
      this.db = new DatabaseSync(connectionString, { defensive: true });
    } catch (error: unknown) {
      throw new CustomError({
        message: `Failed to open SQLite database at "${connectionString}"`,
        code: 500,
        reason: 'SQLite open failed',
        error: error as Error,
      });
    }
  }

  async disconnect(): Promise<void> {
    if (this.db !== undefined) {
      this.db.close();
      this.db = undefined;
    }
  }

  /**
   * Returns the underlying `DatabaseSync` instance.
   * Use this to prepare statements and run queries directly.
   */
  getDatabase(): DatabaseSync | undefined {
    return this.db;
  }
}
