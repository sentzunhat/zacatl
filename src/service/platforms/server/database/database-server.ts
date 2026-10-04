import { CustomError } from '@zacatl/error';
import { inject, injectable } from '@zacatl/third-party/dependency-injection/tsyringe';
import type { DependencyContainer } from '@zacatl/third-party/dependency-injection/tsyringe';

import { createDatabaseAdapter } from './adapters/factory';
import type { DatabaseConfig, DatabaseServerPort } from './port';
import { getContainer } from '../../../../dependency-injection/container';
import { DatabaseConfigsToken, DatabaseContainerToken, DatabaseServiceNameToken } from '../tokens';

/**
 * DatabaseServer - Encapsulates database connection logic
 * Handles multiple database connections and configuration
 * Supports: Mongoose (MongoDB), Sequelize (SQL databases)
 */
@injectable()
export class DatabaseServer {
  private readonly serviceName: string;
  private readonly databases: DatabaseConfig[];
  private readonly container: DependencyContainer;
  private readonly adapters: Map<string, DatabaseServerPort> = new Map();

  constructor(
    @inject(DatabaseServiceNameToken) serviceName: string,
    @inject(DatabaseConfigsToken) databases: DatabaseConfig[],
    @inject(DatabaseContainerToken) container?: DependencyContainer,
  ) {
    this.serviceName = serviceName;
    this.databases = databases;
    this.container = container ?? getContainer();
  }

  /**
   * Configure all databases for the service
   */
  public async configure(): Promise<void> {
    if (this.databases.length === 0) {
      return;
    }

    for (const database of this.databases) {
      if (database.connection?.url == null || database.connection.url.length === 0) {
        throw new CustomError({
          message: 'database connection URL is not provided',
          code: 500,
          reason: 'database connection URL not provided',
        });
      }

      try {
        const adapter = createDatabaseAdapter(database.vendor);
        await adapter.connect(this.serviceName, database, this.container);

        // Store adapter keyed by connection name (or vendor for single-database setups).
        // This allows multiple same-vendor databases to be tracked independently.
        const adapterKey = database.connection.name ?? database.vendor;
        this.adapters.set(adapterKey, adapter);
      } catch (error: unknown) {
        throw new CustomError({
          message: `failed to configure database for service "${this.serviceName}"`,
          code: 500,
          reason: 'database configuration failed',
          error: error as Error,
          metadata: {
            database: {
              vendor: database.vendor,
              connectionUrl: database.connection.url,
              connectionName: database.connection.name,
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
    const disconnectPromises = Array.from(this.adapters.values()).map((adapter) =>
      adapter.disconnect?.(),
    );
    await Promise.all(disconnectPromises);
  }
}
