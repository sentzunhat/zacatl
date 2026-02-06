import { CustomError } from "@zacatl/error";
import { container } from "@zacatl/third-party";
import type { Mongoose } from "mongoose";
import type { Sequelize } from "sequelize";

import {
  type DatabaseServerPort,
  type DatabaseConfig,
  DatabaseVendor,
} from "../types/database-server-port";

/**
 * MongooseAdapter - Implements DatabaseServerPort for Mongoose
 * Handles MongoDB connections and setup
 */
export class MongooseAdapter implements DatabaseServerPort {
  async connect(serviceName: string, config: DatabaseConfig): Promise<void> {
    const { instance, connectionString, onDatabaseConnected } = config;

    const getMongoDbName = (uri: string): string | undefined => {
      const match = uri.match(/^mongodb(?:\+srv)?:\/\/[^/]+\/([^?]+)(\?|$)/);
      return match?.[1] ? decodeURIComponent(match[1]) : undefined;
    };

    const mongoose = instance as Mongoose;

    if (!mongoose || !mongoose.connect) {
      throw new CustomError({
        message: "database instance is not provided",
        code: 500,
        reason: "database instance not provided",
      });
    }

    const dbName = getMongoDbName(connectionString) ?? serviceName;

    await mongoose.connect(connectionString, {
      dbName,
      autoIndex: true,
      autoCreate: true,
    });

    if (onDatabaseConnected) {
      await onDatabaseConnected(mongoose);
    }

    container.register<Mongoose>(mongoose.constructor.name, {
      useValue: mongoose,
    });
  }

  async disconnect(): Promise<void> {
    // Implement disconnect if needed
  }
}

/**
 * SequelizeAdapter - Implements DatabaseServerPort for Sequelize
 * Handles SQL database connections (PostgreSQL, MySQL, etc.)
 */
export class SequelizeAdapter implements DatabaseServerPort {
  async connect(_serviceName: string, config: DatabaseConfig): Promise<void> {
    const { instance, onDatabaseConnected } = config;
    const sequelize = instance as Sequelize;

    if (!sequelize || !sequelize.authenticate) {
      throw new CustomError({
        message: "database instance is not provided or invalid",
        code: 500,
        reason: "database instance not provided",
      });
    }

    await sequelize.authenticate();

    if (onDatabaseConnected) {
      await onDatabaseConnected(instance);
    }

    container.register<Sequelize>(sequelize.constructor.name, {
      useValue: sequelize,
    });
  }

  async disconnect(): Promise<void> {
    // Implement disconnect if needed
  }
}

/**
 * Create appropriate database adapter based on vendor
 */
export function createDatabaseAdapter(
  vendor: DatabaseVendor,
): DatabaseServerPort {
  switch (vendor) {
    case DatabaseVendor.MONGOOSE:
      return new MongooseAdapter();
    case DatabaseVendor.SEQUELIZE:
      return new SequelizeAdapter();
    default:
      throw new CustomError({
        message: `Unsupported database vendor: ${vendor}`,
        code: 500,
        reason: "database vendor not supported",
      });
  }
}
