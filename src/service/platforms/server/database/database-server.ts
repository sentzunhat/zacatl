import { CustomError } from '@zacatl/error';
import { getContainer } from '@zacatl/third-party/dependency-injection';
import { inject, injectable } from '@zacatl/third-party/dependency-injection/tsyringe';
import type { DependencyContainer } from '@zacatl/third-party/dependency-injection/tsyringe';

import { createDatabaseAdapter } from './adapters/factory';
import { normalizeConnectionName } from './connection-name';
import type { DatabaseConfig, DatabaseServerPort } from './port';
import { DatabaseConfigsToken, DatabaseContainerToken, DatabaseServiceNameToken } from '../tokens';

const getAdapterKey = (vendor: string, connectionName?: string): string => {
  const normalizedName = normalizeConnectionName(vendor, connectionName);
  return normalizedName === vendor ? vendor : `${vendor}:${normalizedName}`;
};

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
  private configuration: Promise<void> | null = null;
  private disconnection: Promise<void> | null = null;

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
    if (this.configuration != null) {
      return this.configuration;
    }

    const configuration = this.configureDatabases();
    this.configuration = configuration;
    try {
      await configuration;
    } finally {
      if (this.configuration === configuration) {
        this.configuration = null;
      }
    }
    return configuration;
  }

  private async configureDatabases(): Promise<void> {
    if (this.databases.length === 0) {
      return;
    }

    let currentDatabase: DatabaseConfig | undefined;
    try {
      for (const database of this.databases) {
        currentDatabase = database;
        if (database.connection?.url == null || database.connection.url.length === 0) {
          throw new CustomError({
            message: 'database connection URL is not provided',
            code: 500,
            reason: 'database connection URL not provided',
          });
        }

        const adapterKey = getAdapterKey(database.vendor, database.connection.name);
        if (this.adapters.has(adapterKey)) {
          throw new CustomError({
            message: `duplicate database connection key "${adapterKey}"`,
            code: 500,
            reason: 'duplicate database connection key',
          });
        }

        const adapter = createDatabaseAdapter(database.vendor);
        // Track ownership before connect: adapters may have opened a resource
        // before a post-connect callback or later setup step rejects.
        this.adapters.set(adapterKey, adapter);
        await adapter.connect(this.serviceName, database, this.container);
      }
    } catch (error: unknown) {
      try {
        await this.disconnectAdapters();
      } catch {
        // Preserve the setup failure; cleanup is best effort for all adapters.
      }
      throw new CustomError({
        message: `failed to configure database for service "${this.serviceName}"`,
        code: 500,
        reason: 'database configuration failed',
        error: error as Error,
        metadata: currentDatabase != null
          ? {
            database: {
              vendor: currentDatabase.vendor,
              connectionUrl: currentDatabase.connection?.url,
              connectionName: currentDatabase.connection?.name,
            },
          }
          : undefined,
      });
    }
  }

  /**
   * Get a database adapter by vendor and optional connection name.
   * Omit the name to retrieve the vendor's default connection.
   */
  public getAdapter(vendor: string, connectionName?: string): DatabaseServerPort | undefined {
    return this.adapters.get(getAdapterKey(vendor, connectionName));
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
    // A connect may have established the resource even though its adapter's
    // connect() promise has not completed yet. Wait until setup settles before
    // calling disconnect, so adapters cannot perform a premature no-op close.
    await this.configuration?.catch(() => undefined);
    await this.disconnectAdapters();
  }

  private disconnectAdapters(): Promise<void> {
    if (this.disconnection != null) {
      return this.disconnection;
    }

    const disconnection = this.performDisconnect();
    const trackedDisconnection = disconnection.finally(() => {
      if (this.disconnection === trackedDisconnection) {
        this.disconnection = null;
      }
    });
    this.disconnection = trackedDisconnection;
    return trackedDisconnection;
  }

  private async performDisconnect(): Promise<void> {
    const adapters = Array.from(this.adapters.entries());
    const results = await Promise.allSettled(adapters.map(async ([key, adapter]) => {
      await adapter.disconnect?.();
      if (this.adapters.get(key) === adapter) {
        this.adapters.delete(key);
      }
    }));
    const failed = results.find((result) => result.status === 'rejected');
    if (failed?.status === 'rejected') {
      throw failed.reason;
    }
  }
}
