import type { DatabaseSync } from 'node:sqlite';

import type { Mongoose } from 'mongoose';
import type { Sequelize } from 'sequelize';

import type { Optional } from '../../../../utils/optionals';
import type { MongooseRepositoryIndexOptions } from '../../../layers/infrastructure/orm/mongoose/index-policy';

export enum DatabaseVendor {
  MONGOOSE = 'MONGOOSE',
  SEQUELIZE = 'SEQUELIZE',
  SQLITE = 'SQLITE',
}

export type DatabaseInstance = Mongoose | Sequelize | DatabaseSync;

export type OnDatabaseConnectedFunction = Optional<
  (dbInstance: DatabaseInstance) => Promise<void> | void
>;

export interface DatabaseConnection {
  /**
   * Connection URI, SQLite file path, or `':memory:'`.
   * Replaces the pre-0.0.57 `connectionString` configuration shape.
   */
  url: string;
  /**
   * Stable DI token name for multi-database setups.
   * Omit to use the vendor default token.
   */
  name?: string;
}

export interface ConnectionRef {
  name: string;
}

export interface DatabaseConfig {
  vendor: DatabaseVendor;
  connection: DatabaseConnection;
  /**
   * The ORM/database instance (Mongoose or Sequelize).
   * Not required for `SQLITE` — the adapter opens the file internally
   * using `connection.url` as the file path (or `':memory:'`).
   */
  instance?: DatabaseInstance;
  /**
   * Mongoose index lifecycle policy for this database connection.
   *
   * Defaults are environment-aware: local/development/test create missing
   * declared indexes, while staging/production do not mutate indexes during
   * normal boot.
   */
  indexes?: MongooseRepositoryIndexOptions;
  /**
   * Optional callback to be invoked after a successful DB connection.
   * Use this to perform extra initialization or plug additional modules.
   */
  onDatabaseConnected?: OnDatabaseConnectedFunction;
}

/**
 * DatabaseServerPort - Hexagonal Architecture port for database connections
 * Abstracts database implementations (Mongoose, Sequelize)
 */
export interface DatabaseServerPort {
  connect(serviceName: string, config: DatabaseConfig): Promise<void>;
  disconnect?(): Promise<void>;
}
