import type { Optional } from "@zacatl/optionals";
import type { Mongoose } from "mongoose";
import type { Sequelize } from "sequelize";

export enum DatabaseVendor {
  MONGOOSE = "MONGOOSE",
  SEQUELIZE = "SEQUELIZE",
}

export type DatabaseInstance = Mongoose | Sequelize;

export type OnDatabaseConnectedFunction = Optional<
  (dbInstance: DatabaseInstance) => Promise<void> | void
>;

export type DatabaseConfig = {
  vendor: DatabaseVendor;
  instance: DatabaseInstance;
  connectionString: string;
  /**
   * Optional callback to be invoked after a successful DB connection.
   * Use this to perform extra initialization or plug additional modules.
   */
  onDatabaseConnected?: OnDatabaseConnectedFunction;
};

/**
 * DatabaseServerPort - Hexagonal Architecture port for database connections
 * Abstracts database implementations (Mongoose, Sequelize)
 */
export interface DatabaseServerPort {
  connect(serviceName: string, config: DatabaseConfig): Promise<void>;
  disconnect?(): Promise<void>;
}
