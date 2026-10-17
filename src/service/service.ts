import { InternalServerError } from '@zacatl/error';
import { configureI18nNode } from '@zacatl/localization';
import { logger as defaultLogger, LoggerToken } from '@zacatl/logs';

import { createChildContainer, registerValue } from '../dependency-injection/container';
import { registerMongooseIndexOptions } from './layers/infrastructure/orm/mongoose/index-policy';
import { Layers } from './layers/layers';
import { Platforms } from './platforms/platforms';
import { registerOrmInstance } from './platforms/server/database/orm-instance';
import { DatabaseVendor } from './platforms/server/database/port';
import { ServiceType } from './types';
import type { ServiceConfig } from './types';

export type { ServiceConfig };

/**
 * Main Service orchestrator.
 *
 * Responsible for initializing localization, pre-registering database
 * instances, instantiating layers and platforms, and optionally
 * auto-starting the configured platforms.
 *
 * @public
 */
export class Service {
  private readonly config: ServiceConfig;

  private readonly layers: Layers | undefined;
  private readonly platforms: Platforms | undefined;

  /**
   * Construct a Service instance.
   *
   * @param config - The `ServiceConfig` instance that provides layers,
   *   platforms and runtime options required to initialize the service.
   */
  constructor(config: ServiceConfig) {
    configureI18nNode(config.localization);

    this.validateConfig(config);

    this.config = config;

    const { layers, platforms, run } = config;

    // Pre-register database instances BEFORE instantiating layers so that
    // repositories can resolve them in their constructors via the DI container.
    if (platforms?.server?.databases != null) {
      for (const dbConfig of platforms.server.databases) {
        registerOrmInstance(dbConfig.vendor, dbConfig.connection, dbConfig.instance);
        if (dbConfig.vendor === DatabaseVendor.MONGOOSE) {
          registerMongooseIndexOptions(dbConfig.connection.name, dbConfig.indexes);
        }
      }
    }

    // One container per Service, shared by its layers and platforms. The logger
    // is registered here once (like the database instances above), so
    // repositories, domain services, handlers and the Express adapter all use
    // ServiceConfig.logger (default: the Zacatl logger). Fastify keeps its own
    // request logger (`loggerInstance`), which apps point at the same adapter.
    const serviceContainer = createChildContainer();
    registerValue(LoggerToken, config.logger ?? defaultLogger, serviceContainer);

    if (layers != null) {
      this.layers = new Layers(layers, serviceContainer);
    }

    if (platforms != null) {
      this.platforms = new Platforms(
        platforms,
        this.layers?.getApplicationContainer() ?? serviceContainer,
      );
    }

    if (run?.auto === true) {
      this.start().catch((err) => {
        throw new InternalServerError({
          message: 'Failed to start service automatically',
          reason: 'Service auto-start encountered an error during initialization',
          component: 'Service',
          operation: 'constructor',
          error: err instanceof Error ? err : undefined,
        });
      });
    }
  }

  private validateConfig(config: ServiceConfig): void {
    const { type, layers, platforms } = config;

    const configType = type ?? undefined;

    if (configType == null) {
      throw new InternalServerError({
        message: "Service configuration must specify a 'type' field",
        reason: 'Missing service type',
        component: 'Service',
        operation: 'constructor',
      });
    }

    switch (configType) {
      case ServiceType.SERVER:
        if (platforms?.server == null) {
          throw new InternalServerError({
            message: "ServiceType.SERVER requires 'platforms.server' configuration",
            reason: 'Server platform configuration is missing',
            component: 'Service',
            operation: 'validateConfig',
            metadata: { serviceType: configType },
          });
        }
        if (layers?.application == null || layers.application.entryPoints?.rest == null) {
          throw new InternalServerError({
            message:
              "ServiceType.SERVER requires 'layers.application.entryPoints.rest' configuration",
            reason: 'REST entry points configuration is missing',
            component: 'Service',
            operation: 'validateConfig',
            metadata: { serviceType: configType },
          });
        }
        break;

      case ServiceType.CLI:
        if (platforms?.cli == null) {
          throw new InternalServerError({
            message: "ServiceType.CLI requires 'platforms.cli' configuration",
            reason: 'CLI platform configuration is missing',
            component: 'Service',
            operation: 'validateConfig',
            metadata: { serviceType: configType },
          });
        }
        if (layers?.application == null || layers.application.entryPoints?.cli == null) {
          throw new InternalServerError({
            message: "ServiceType.CLI requires 'layers.application.entryPoints.cli' configuration",
            reason: 'CLI entry points configuration is missing',
            component: 'Service',
            operation: 'validateConfig',
            metadata: { serviceType: configType },
          });
        }
        break;

      case ServiceType.DESKTOP:
        if (platforms?.desktop == null) {
          throw new InternalServerError({
            message: "ServiceType.DESKTOP requires 'platforms.desktop' configuration",
            reason: 'Desktop platform configuration is missing',
            component: 'Service',
            operation: 'validateConfig',
            metadata: { serviceType: configType },
          });
        }
        if (layers?.application == null || layers.application.entryPoints?.ipc == null) {
          throw new InternalServerError({
            message:
              "ServiceType.DESKTOP requires 'layers.application.entryPoints.ipc' configuration",
            reason: 'IPC entry points configuration is missing',
            component: 'Service',
            operation: 'validateConfig',
            metadata: { serviceType: configType },
          });
        }
        break;
    }
  }

  /**
   * Start the service platforms and register entrypoints when present.
   *
   * @param options - Optional start options. For example `{ port?: number, host?: string }`.
   * @returns A promise that resolves when platform startup completes.
   */
  /**
   * Stop the service: close HTTP server and disconnect all databases.
   *
   * Call this in process signal handlers (SIGTERM, SIGINT) to shut down cleanly.
   */
  public async stop(): Promise<void> {
    await this.platforms?.stop();
  }

  public async start(options?: { port?: number; host?: string }): Promise<void> {
    try {
      if (this.config.layers?.application?.entryPoints) {
        await this.platforms?.registerEntrypoints(this.config.layers?.application?.entryPoints);
      }

      if (this.config.type === ServiceType.SERVER) {
        // Connect databases and run callbacks before repository readiness;
        // only then open HTTP so requests cannot race repository.ready().
        await this.platforms?.prepare();
        await this.layers?.start();
        await this.platforms?.start(options);
      } else {
        // Preserve the existing CLI/desktop platform start contract.
        await this.platforms?.start(options);
        await this.layers?.start();
      }
    } catch (error) {
      try {
        await this.platforms?.stop();
      } catch {
        // Preserve the startup failure while making a best effort to release
        // database connections and any partially initialized server.
      }
      throw error;
    }
  }
}

export { ServiceType };
export { Layers } from './layers/layers';
export { Platforms } from './platforms/platforms';
export type { PlatformsConfig } from './platforms/types';
export type {
  DatabaseConnection,
  ConnectionRef,
  DatabaseConfig,
} from './platforms/server/database/port';
export { DatabaseVendor } from './platforms/server/database/port';
export {
  MongooseIndexManager,
  type MongooseIndexDiff,
  type MongooseIndexModelSelector,
  type MongooseIndexOperationResult,
  type MongooseIndexSyncOptions,
} from './layers/infrastructure/orm/mongoose/index-manager';
export {
  getDefaultMongooseIndexBootMode,
  type MongooseIndexBootMode,
  type MongooseRepositoryIndexOptions,
} from './layers/infrastructure/orm/mongoose/index-policy';
export type { QueryOptions } from './layers/infrastructure/repositories/types';
export { DEFAULT_QUERY_LIMIT } from './layers/infrastructure/repositories/types';
export * from './types';
