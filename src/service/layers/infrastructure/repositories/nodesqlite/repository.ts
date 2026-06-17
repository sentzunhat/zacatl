import type { NodeSqliteRepositoryConfig, NodeSqliteRepositoryModel } from './types';
import { createNodeSqliteAdapter } from '../../orm';
import type { RepositoryPort, ORMPort } from '../types';

/**
 * Standalone Node.js SQLite Repository - delegates to NodeSqliteAdapter
 *
 * Provides all repository operations for node:sqlite ORM without runtime adapter switching.
 * Internally uses the same NodeSqliteAdapter as BaseRepository for code reuse.
 *
 * @example
 * ```typescript
 * import { AbstractNodeSqliteRepository } from '@sentzunhat/zacatl/infrastructure';
 * import { ORMType } from '@sentzunhat/zacatl/infrastructure';
 *
 * interface UserDb { username: string; email: string }
 * interface UserInput { username: string; email: string }
 * interface UserOutput { id: string; username: string; email: string; createdAt: Date; updatedAt: Date }
 *
 * export class UserRepository extends AbstractNodeSqliteRepository<UserInput, UserOutput> {
 *   constructor() {
 *     super({ type: ORMType.NodeSqlite, name: 'users' });
 *   }
 * }
 * ```
 */
export abstract class AbstractNodeSqliteRepository<I extends object, O extends object>
  implements RepositoryPort<NodeSqliteRepositoryModel, I, O, Partial<O>>
{
  public get model(): NodeSqliteRepositoryModel {
    return this.adapter.model;
  }

  private readonly adapter: ORMPort<NodeSqliteRepositoryModel, I, O, Partial<O>>;

  constructor(config: NodeSqliteRepositoryConfig) {
    this.adapter = createNodeSqliteAdapter<I, O>(config);
  }

  public toLean(input: unknown): O | null {
    return this.adapter.toLean(input);
  }

  async findById(id: string): Promise<O | null> {
    return this.adapter.findById(id);
  }

  async findMany(filter: Partial<O> = {}): Promise<O[]> {
    return this.adapter.findMany(filter);
  }

  async create(entity: I): Promise<O> {
    return this.adapter.create(entity);
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    return this.adapter.update(id, update);
  }

  async delete(id: string): Promise<O | null> {
    return this.adapter.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.adapter.exists(id);
  }
}
