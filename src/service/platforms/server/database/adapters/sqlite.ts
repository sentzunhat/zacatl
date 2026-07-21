import type { DatabaseSync } from 'node:sqlite';

import { CustomError } from '@zacatl/error';

import { registerOrmInstance } from '../orm-instance';
import { DatabaseVendor } from '../port';
import type { DatabaseConfig, DatabaseServerPort } from '../port';

// Type alias for the dynamically imported node:sqlite module
interface SqliteModule {
  DatabaseSync: typeof DatabaseSync;
}

/**
 * SQLite adapter using the Node.js built-in `node:sqlite` module.
 *
 * Defensive mode is enabled by default in Node 26+, which blocks SQL
 * language features that can corrupt the database file.
 *
 * The `connection.url` is used as the SQLite file path.
 * Use `':memory:'` for an in-memory database.
 *
 * The `node:sqlite` module is dynamically imported only when a connection
 * is initiated, avoiding experimental warnings for projects that don't use SQLite.
 *
 * @example
 * ```typescript
 * import { DatabaseVendor } from '@sentzunhat/zacatl';
 *
 * const service = new Service({
 *   platforms: {
 *     server: {
 *       databases: [{
 *         vendor: DatabaseVendor.SQLITE,
 *         connection: { url: 'app.db' },
 *       }],
 *     },
 *   },
 * });
 * ```
 */
export class SqliteAdapter implements DatabaseServerPort {
  private db: DatabaseSync | undefined;
  private static _moduleCached: Promise<SqliteModule> | null = null;

  private static async loadModule(): Promise<SqliteModule> {
    if (!this._moduleCached) {
      this._moduleCached = import('node:sqlite');
    }
    return this._moduleCached;
  }

  async connect(_serviceName: string, config: DatabaseConfig): Promise<void> {
    const { connection, instance, onDatabaseConnected } = config;

    if (connection?.url == null || connection.url.length === 0) {
      throw new CustomError({
        message: 'SQLite connection URL (file path) is required',
        code: 500,
        reason: 'connection.url must be a valid file path or :memory:',
      });
    }

    try {
      if (instance != null && SqliteAdapter.isDatabaseSync(instance)) {
        this.db = instance;
      } else {
        // Dynamically import node:sqlite only when needed (on first connect call).
        // This defers the experimental warning until the adapter is actually used.
        const mod = await SqliteAdapter.loadModule();
        // Defensive: true is the default in Node 26 — explicitly set for clarity.
        this.db = new mod.DatabaseSync(connection.url, { defensive: true });
      }

      registerOrmInstance(DatabaseVendor.SQLITE, connection, this.db);

      if (onDatabaseConnected != null) {
        await onDatabaseConnected(this.db);
      }
    } catch (error: unknown) {
      throw new CustomError({
        message: `Failed to open SQLite database at "${connection.url}"`,
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

  private static isDatabaseSync(value: unknown): value is DatabaseSync {
    return (
      typeof value === 'object' &&
      value !== null &&
      'prepare' in value &&
      typeof (value as { prepare?: unknown }).prepare === 'function'
    );
  }
}
