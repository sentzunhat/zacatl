import type { NodeSqliteRepositoryConfig, NodeSqliteRepositoryModel } from './types';
import { createNodeSqliteAdapter } from '../../orm/nodesqlite';
import type { RepositoryPort, ORMPort } from '../types';

/**
 * Standalone Node.js SQLite Repository
 *
 * Provides all repository operations for node:sqlite ORM without runtime adapter switching.
 * Internally uses the same NodeSqliteAdapter as other repositories for code reuse.
 *
 * Extends this class to create your own SQLite repositories:
 *
 * @example
 * ```typescript
 * import { AbstractNodeSqliteRepository } from '@sentzunhat/zacatl/infrastructure';
 * import type { DatabaseSync } from 'node:sqlite';
 *
 * interface UserDb { username: string; email: string }
 * interface UserInput { username: string; email: string }
 * interface UserOutput { id: string; username: string; email: string; createdAt: Date; updatedAt: Date }
 *
 * export class UserRepository extends AbstractNodeSqliteRepository<UserInput, UserOutput> {
 *   constructor(database: DatabaseSync) {
 *     super({ type: 'nodesqlite', database, tableName: 'users' });
 *   }
 * }
 * ```
 */
export abstract class AbstractNodeSqliteRepository<I extends object, O extends object>
  implements RepositoryPort<NodeSqliteRepositoryModel, I, O>
{
  private readonly adapter: ORMPort<NodeSqliteRepositoryModel, I, O>;

  constructor(config: NodeSqliteRepositoryConfig) {
    this.adapter = createNodeSqliteAdapter<I, O>(config);
  }

  /** Node.js SQLite database instance - delegated to adapter */
  public get model(): NodeSqliteRepositoryModel {
    return this.adapter.model;
  }

  /**
   * Convert node:sqlite row to lean output with normalized id, createdAt, updatedAt
   */
  public toLean(input: unknown): O | null {
    return this.adapter.toLean(input);
  }

  /**
   * Find record by id and return lean output
   */
  async findById(id: string): Promise<O | null> {
    return this.adapter.findById(id);
  }

  /**
   * Find records matching filter and return lean output
   */
  async findMany(filter?: Record<string, unknown>): Promise<O[]> {
    return this.adapter.findMany(filter);
  }

  /**
   * Create new record from input and return lean output
   */
  async create(entity: I): Promise<O> {
    return this.adapter.create(entity);
  }

  /**
   * Update existing record and return lean output
   */
  async update(id: string, update: Partial<I>): Promise<O | null> {
    return this.adapter.update(id, update);
  }

  /**
   * Delete record and return deleted lean output
   */
  async delete(id: string): Promise<O | null> {
    return this.adapter.delete(id);
  }

  /**
   * Check if record with given id exists
   */
  async exists(id: string): Promise<boolean> {
    return this.adapter.exists(id);
  }
}
