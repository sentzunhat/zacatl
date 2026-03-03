import type { DatabaseSync } from 'node:sqlite';

/**
 * Node.js SQLite Repository Configuration
 *
 * Simple configuration for SQLite-based repositories using the built-in
 * node:sqlite module in Node.js 24+.
 *
 * Requires a reference to the DatabaseSync instance and table name.
 */
export interface NodeSqliteBaseRepositoryConfig {
  type: 'nodesqlite';
  /** Reference to the DatabaseSync instance from node:sqlite */
  database: DatabaseSync;
  /** Table name for this repository */
  tableName: string;
}

export type NodeSqliteRepositoryConfig = NodeSqliteBaseRepositoryConfig;

/** Node.js SQLite model type - the DatabaseSync instance */
export type NodeSqliteRepositoryModel = DatabaseSync;

/**
 * Node.js SQLite output document with normalized id, createdAt, updatedAt fields
 */
export interface NodeSqliteLeanDocument {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/** Lean output type for Node.js SQLite repositories */
export type NodeSqliteLean = NodeSqliteLeanDocument;

/**
 * Helper type to ensure ID and timestamp fields exist in output
 */
export type WithNodeSqliteMeta<T extends object> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};
