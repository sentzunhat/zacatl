/**
 * Example: SQLite Repository Implementation
 *
 * Demonstrates how to implement IRepository<T> for SQLite with strong typing.
 * Use this pattern for any persistent data source: PostgreSQL, MySQL, Redis, etc.
 *
 * Installation: npm install better-sqlite3 @types/better-sqlite3
 *
 * @example
 * ```typescript
 * import Database from "better-sqlite3";
 *
 * interface User { id: string; name: string; email: string; }
 *
 * class UserRepository extends SQLiteRepository<User> {
 *   constructor(db: Database.Database) {
 *     super(db, 'users');
 *   }
 * }
 *
 * // Initialize and register through Service
 * const db = new Database('./data.db');
 * const service = new Service({
 *   architecture: {
 *     infrastructure: { repositories: [UserRepository] }
 *   }
 * });
 * ```
 */
import type Database from "better-sqlite3";
import { IRepository } from "../../service/architecture/infrastructure/repository";
import { CustomError } from "../../error";

/**
 * Generic SQLite repository implementation
 * Extend this class and pass your database instance and table name
 */
export abstract class SQLiteRepository<
  T extends Record<string, unknown>,
> implements IRepository<T> {
  protected readonly db: Database.Database;
  protected readonly tableName: string;

  /**
   * @param db - Better-sqlite3 database instance
   * @param tableName - Table to query against
   */
  constructor(db: Database.Database, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  async findById(id: string): Promise<T | null> {
    try {
      const stmt = this.db.prepare(
        `SELECT * FROM ${this.tableName} WHERE id = ?`,
      );
      const result = stmt.get(id) as T | undefined;
      return result || null;
    } catch (error: unknown) {
      throw new CustomError({
        message: `Failed to find record by ID: ${id}`,
        code: 500,
        reason: "database query error",
        error: error as Error,
        metadata: { id, table: this.tableName },
      });
    }
  }

  async findMany(filter?: Record<string, unknown>): Promise<T[]> {
    try {
      if (!filter || Object.keys(filter).length === 0) {
        const stmt = this.db.prepare(`SELECT * FROM ${this.tableName}`);
        return stmt.all() as T[];
      }

      const keys = Object.keys(filter);
      const conditions = keys.map((k) => `${k} = ?`).join(" AND ");
      const values = keys.map((k) => filter[k]);

      const stmt = this.db.prepare(
        `SELECT * FROM ${this.tableName} WHERE ${conditions}`,
      );
      return stmt.all(...values) as T[];
    } catch (error: unknown) {
      throw new CustomError({
        message: `Failed to find records`,
        code: 500,
        reason: "database query error",
        error: error as Error,
        metadata: { table: this.tableName, filter },
      });
    }
  }

  async create(data: Partial<T>): Promise<T> {
    try {
      const keys = Object.keys(data);
      const placeholders = keys.map(() => "?").join(",");
      const values = keys.map((k) => data[k as keyof typeof data]);

      const stmt = this.db.prepare(
        `INSERT INTO ${this.tableName} (${keys.join(",")}) VALUES (${placeholders})`,
      );
      stmt.run(...values);

      // Return the created record (simplified—assumes id is auto-generated)
      return data as T;
    } catch (error: unknown) {
      throw new CustomError({
        message: `Failed to create record`,
        code: 500,
        reason: "database insertion error",
        error: error as Error,
        metadata: { table: this.tableName, data },
      });
    }
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    try {
      const keys = Object.keys(data);
      const sets = keys.map((k) => `${k} = ?`).join(",");
      const values = [...keys.map((k) => data[k as keyof typeof data]), id];

      const stmt = this.db.prepare(
        `UPDATE ${this.tableName} SET ${sets} WHERE id = ?`,
      );
      stmt.run(...values);

      return this.findById(id);
    } catch (error: unknown) {
      throw new CustomError({
        message: `Failed to update record: ${id}`,
        code: 500,
        reason: "database update error",
        error: error as Error,
        metadata: { id, table: this.tableName },
      });
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const stmt = this.db.prepare(
        `DELETE FROM ${this.tableName} WHERE id = ?`,
      );
      const result = stmt.run(id);
      return (result.changes || 0) > 0;
    } catch (error: unknown) {
      throw new CustomError({
        message: `Failed to delete record: ${id}`,
        code: 500,
        reason: "database deletion error",
        error: error as Error,
        metadata: { id, table: this.tableName },
      });
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const record = await this.findById(id);
      return record !== null;
    } catch {
      return false;
    }
  }
}
