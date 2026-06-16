import { NodeSqliteAdapter } from './adapter';
import type {
  NodeSqliteRepositoryConfig,
  NodeSqliteRepositoryModel,
  ORMPort,
} from '../../repositories/types';

/**
 * Creates a Node.js SQLite adapter.
 *
 * The adapter resolves the shared DatabaseSync instance from the DI container
 * via {@link NodeSqliteToken}, mirroring the other ORM adapters.
 *
 * @param config Node.js SQLite repository configuration
 * @returns ORMPort implementation for node:sqlite
 */
export const createNodeSqliteAdapter = <I extends object, O extends object>(
  config: NodeSqliteRepositoryConfig,
): ORMPort<NodeSqliteRepositoryModel, I, O, Partial<O>> => {
  return new NodeSqliteAdapter<I, O>(config);
};
