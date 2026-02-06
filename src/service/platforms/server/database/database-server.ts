import { CustomError } from "@zacatl/error";

import { createDatabaseAdapter } from "../adapters/database-adapters";
import type { DatabaseConfig } from "../types/database-server-port";
import type { DatabaseServerPort } from "../types/database-server-port";

/**
 * DatabaseServer - Encapsulates database connection logic
 * Handles multiple database connections and configuration
 * Supports: Mongoose (MongoDB), Sequelize (SQL databases)
 */
export class DatabaseServer {
  private serviceName: string;
  private databases: DatabaseConfig[];
  private adapters: Map<string, DatabaseServerPort> = new Map();

  constructor(serviceName: string, databases: DatabaseConfig[]) {
    this.serviceName = serviceName;
    this.databases = databases;
  }

  /**
   * Configure all databases for the service
   */
  public async configure(): Promise<void> {
    if (!this.databases || this.databases.length === 0) {
      return;
    }

    for (const database of this.databases) {
      if (!database.connectionString) {
        throw new CustomError({
          message: "database connection string is not provided",
          code: 500,
          reason: "database connection string not provided",
        });
      }

      try {
        const adapter = createDatabaseAdapter(database.vendor);
        await adapter.connect(this.serviceName, database);

        // Store adapter for potential future use (disconnect, etc.)
        this.adapters.set(database.vendor, adapter);
      } catch (error: unknown) {
        throw new CustomError({
          message: `failed to configure database for service "${this.serviceName}"`,
          code: 500,
          reason: "database configuration failed",
          error: error as Error,
          metadata: {
            database: {
              vendor: database.vendor,
              connectionString: database.connectionString,
            },
          },
        });
      }
    }
  }

  /**
   * Get database adapter for specific vendor
   */
  public getAdapter(vendor: string): DatabaseServerPort | undefined {
    return this.adapters.get(vendor);
  }

  /**
   * Get all configured database adapters
   */
  public getAdapters(): Map<string, DatabaseServerPort> {
    return this.adapters;
  }

  /**
   * Disconnect all databases
   */
  public async disconnect(): Promise<void> {
    const disconnectPromises = Array.from(this.adapters.values()).map(
      (adapter) => adapter.disconnect?.(),
    );
    await Promise.all(disconnectPromises);
  }
}
