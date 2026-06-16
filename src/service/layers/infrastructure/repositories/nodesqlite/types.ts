import type { DatabaseSync } from 'node:sqlite';

import type { ORMType } from '../mongoose/types';

export type {
  LeanDocument,
  NodeSqliteLean,
  NodeSqliteLeanDocument,
  WithNodeSqliteMeta,
} from '../../orm/nodesqlite/types';

/**
 * Node.js SQLite Repository Configuration
 *
 * Repositories resolve the shared DatabaseSync instance from the DI container
 * through NodeSqliteToken, mirroring the Mongoose and Sequelize repository flow.
 */
export interface NodeSqliteBaseRepositoryConfig {
  type: ORMType.NodeSqlite;
  /** Model name for this repository */
  name: string;
}

export interface NodeSqliteRepositoryConfig {
  readonly type?: ORMType.NodeSqlite;
  readonly name: string;
}

/** Node.js SQLite model type - the DatabaseSync instance */
export type NodeSqliteRepositoryModel = DatabaseSync;
