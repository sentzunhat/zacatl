import type { Mongoose } from 'mongoose';
import type { Sequelize } from 'sequelize';

import type { Optional } from '../../../../utils/optionals';

export enum DatabaseVendor {
  MONGOOSE = 'MONGOOSE',
  SEQUELIZE = 'SEQUELIZE',
  SQLITE = 'SQLITE',
}

export type DatabaseInstance = Mongoose | Sequelize;

export type OnDatabaseConnectedFunction = Optional<
  (dbInstance: DatabaseInstance) => Promise<void> | void
>;

export interface DatabaseConfig {
  vendor: DatabaseVendor;
  /**
   * The ORM/database instance (Mongoose or Sequelize).
   * Not required for `SQLITE` — the adapter opens the file internally
   * using `connectionString` as the file path (or `':memory:'`).
   */
  instance?: DatabaseInstance;
  connectionString: string;
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
