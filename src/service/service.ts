import { InternalServerError } from '@zacatl/error';
import { logger as defaultLogger, LoggerToken } from '@zacatl/logs';
import { getContainer, registerValue } from '@zacatl/third-party/dependency-injection';
import { configureI18nNode } from '@zacatl/third-party/localization';

import { ApplicationContainerToken } from './layers/application/tokens';
import { DomainContainerToken } from './layers/domain/tokens';
import { MongooseIndexManager } from './layers/infrastructure/orm/mongoose/index-manager';
import { InfrastructureContainerToken } from './layers/infrastructure/tokens';
import { PlatformsConfigToken } from './platforms/tokens';
import { createChildContainer } from '../third-party/dependency-injection/container';
import type { DependencyContainer } from '../third-party/dependency-injection/tsyringe';
import {
  MongooseIndexRegistry,
  MongooseIndexRegistryToken,
} from './layers/infrastructure/orm/mongoose/index-policy';
import { Layers } from './layers/layers';
import { LayerContainerScopesToken, LayersConfigToken } from './layers/tokens';
import { Platforms } from './platforms/platforms';
import { registerOrmInstance } from './platforms/server/database/orm-instance';
import { DatabaseVendor } from './platforms/server/database/port';
import { ServiceContainerToken } from './tokens/service';
import { ServiceType } from './types';
import type { ServiceConfig, ServiceStartOptions } from './types';

export type { ServiceConfig, ServiceStartOptions };

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
  private readonly mongooseIndexRegistry = new MongooseIndexRegistry();

  private registerServiceValues(container: DependencyContainer, config: ServiceConfig): void {
    registerValue(LoggerToken, config.logger ?? defaultLogger, container);
  }

  private registerContainers(parent: DependencyContainer): {
    service: DependencyContainer;
    infrastructure: DependencyContainer;
    domain: DependencyContainer;
    application: DependencyContainer;
  } {
    const service = createChildContainer(parent);
    const infrastructure = createChildContainer(service);
    const domain = createChildContainer(infrastructure);
    const application = createChildContainer(domain);

    // Register each scope where it becomes available. Descendants inherit the
    // tokens; ancestors cannot reach into later scopes.
    registerValue(ServiceContainerToken, service, service);
    registerValue(InfrastructureContainerToken, infrastructure, infrastructure);
    registerValue(DomainContainerToken, domain, domain);
    registerValue(ApplicationContainerToken, application, application);

    return { service, infrastructure, domain, application };
  }

  private registerCompositionValues(
    container: DependencyContainer,
    config: ServiceConfig,
    scopes: {
      service: DependencyContainer;
      infrastructure: DependencyContainer;
      domain: DependencyContainer;
      application: DependencyContainer;
    },
  ): void {
    if (config.layers != null) {
      registerValue(LayersConfigToken, config.layers, container);
      registerValue(
        LayerContainerScopesToken,
        {
          infrastructure: scopes.infrastructure,
          domain: scopes.domain,
          application: scopes.application,
        },
        container,
      );
    }

    if (config.platforms != null) {
      registerValue(PlatformsConfigToken, config.platforms, container);
      registerValue(ApplicationContainerToken, scopes.application, container);
    }
  }

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

    const scopes = this.registerContainers(getContainer());
    const compositionContainer = createChildContainer(scopes.service);
    registerValue(MongooseIndexRegistryToken, this.mongooseIndexRegistry, scopes.infrastructure);

    // Pre-register database instances BEFORE instantiating layers so that
    // repositories can resolve them in their constructors via the DI container.
    if (platforms?.server?.databases != null) {
      for (const dbConfig of platforms.server.databases) {
        registerOrmInstance(
          dbConfig.vendor,
          dbConfig.connection,
          dbConfig.instance,
          scopes.infrastructure,
        );
        if (dbConfig.vendor === DatabaseVendor.MONGOOSE) {
          this.mongooseIndexRegistry.registerOptions(dbConfig.connection.name, dbConfig.indexes);
        }
      }
    }

    // The logger is registered once in this Service scope, so repositories,
    // domain services, handlers and the Express adapter all use
    // ServiceConfig.logger (default: the Zacatl logger). Fastify keeps its own
    // request logger (`loggerInstance`), which apps point at the same adapter.
    const serviceContainer = scopes.service;

    this.registerServiceValues(serviceContainer, config);
    this.registerCompositionValues(compositionContainer, config, scopes);

    if (layers != null) {
      this.layers = compositionContainer.resolve(Layers);
    }

    if (platforms != null) {
      this.platforms = compositionContainer.resolve(Platforms);
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
   * @param options - Optional start options. For example `{ host?: string, port?: number }`.
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

  /** Inspect indexes registered by this Service without mixing other Services. */
  public getMongooseIndexManager(connectionName?: string): MongooseIndexManager {
    return new MongooseIndexManager({
      ...(connectionName != null ? { connectionName } : {}),
      registry: this.mongooseIndexRegistry,
    });
  }

  public async start(options?: ServiceStartOptions): Promise<void> {
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
