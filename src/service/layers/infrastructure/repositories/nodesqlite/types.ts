import type { DatabaseSync } from 'node:sqlite';

import type { ConnectionRef } from '../../../../platforms/server/database/port';
import type { ORMType } from '../../orm/types';

export type {
  LeanDocument,
  NodeSqliteLean,
  NodeSqliteLeanDocument,
  WithNodeSqliteMeta,
} from '../../orm/nodesqlite/types';

export interface NodeSqliteRepositoryConfig {
  readonly type?: ORMType.NodeSqlite;
  /** Model name for this repository (used as the SQLite table name). */
  readonly name: string;
  /** Which database connection to use; omit for single-database default. */
  readonly connection?: ConnectionRef;
}

/**
 * Node.js SQLite Repository Configuration with required type discriminant.
 * Used in the `BaseRepositoryConfig` union for narrowing. Consumers should
 * use `NodeSqliteRepositoryConfig` for constructor parameters.
 */
export type NodeSqliteBaseRepositoryConfig = NodeSqliteRepositoryConfig & {
  readonly type: ORMType.NodeSqlite;
};

/** Node.js SQLite model type - the DatabaseSync instance */
export type NodeSqliteRepositoryModel = DatabaseSync;
