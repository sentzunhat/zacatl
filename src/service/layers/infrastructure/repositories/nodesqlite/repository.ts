import type { NodeSqliteRepositoryConfig, NodeSqliteRepositoryModel } from './types';
import { createNodeSqliteAdapter } from '../../orm/nodesqlite/adapter-loader';
import { BaseRepository as BaseRepositoryImpl } from '../base-repository';

/**
 * Node.js SQLite Repository - delegates to NodeSqliteAdapter
 *
 * Provides all repository operations for node:sqlite ORM.
 * Extends the shared generic BaseRepository with node:sqlite-specific type parameters.
 *
 * @example
 * ```typescript
 * import { BaseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/nodesqlite/repository';
 *
 * interface UserDb { username: string; email: string }
 * interface UserInput { username: string; email: string }
 * interface UserOutput { id: string; username: string; email: string; createdAt: Date; updatedAt: Date }
 *
 * export class UserRepository extends BaseRepository<UserInput, UserOutput> {
 *   constructor() {
 *     super({ name: 'users' });
 *   }
 * }
 * ```
 */
export abstract class BaseRepository<I extends object, O extends object>
  extends BaseRepositoryImpl<NodeSqliteRepositoryModel, I, O, Partial<O>>
{
  constructor(config: NodeSqliteRepositoryConfig) {
    super(createNodeSqliteAdapter<I, O>(config));
  }
}
