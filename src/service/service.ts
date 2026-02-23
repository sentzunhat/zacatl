import { getContainer } from '@zacatl/dependency-injection';
import { InternalServerError } from '@zacatl/error';
import { configureI18nNode } from '@zacatl/localization';
// Avoid importing heavy DB runtimes at module load. We register concrete
// instance constructors at runtime so consumers that never use Sequelize
// won't cause bundlers to traverse its deps.

import { Layers } from './layers';
import { Platforms } from './platforms/platforms';
import { DatabaseVendor } from './platforms/server/database/port';
import { ServiceType } from './types';
import type { ConfigService } from './types';

export type { ConfigService };

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
  private readonly config: ConfigService;

  private readonly platforms: Platforms | undefined;

  /**
   * Construct a Service instance.
   *
   * @param config - The `ConfigService` instance that provides layers,
   *   platforms and runtime options required to initialize the service.
   */
  constructor(config: ConfigService) {
    configureI18nNode(config.localization);

    this.validateConfig(config);

    this.config = config;

    const { layers, platforms, run } = config;

    // Pre-register database instances BEFORE instantiating layers
    // This ensures repositories can resolve database instances in their constructors
    if (platforms?.server?.databases != null) {
      for (const dbConfig of platforms.server.databases) {
        if (dbConfig.vendor === DatabaseVendor.MONGOOSE) {
          // Register using the concrete instance constructor as the runtime
          // token to avoid importing the Mongoose class at bundle time.
          getContainer().register(
            dbConfig.instance.constructor as unknown as new (...args: unknown[]) => unknown,
            {
              useValue: dbConfig.instance,
            },
          );
        } else if (dbConfig.vendor === DatabaseVendor.SEQUELIZE) {
          // Register using the concrete instance constructor as the runtime
          // token to avoid importing the Sequelize class at bundle time.
          getContainer().register(
            dbConfig.instance.constructor as unknown as new (...args: unknown[]) => unknown,
            {
              useValue: dbConfig.instance,
            },
          );
        }
      }
    }

    if (layers != null) {
      new Layers(layers);
    }

    if (platforms != null) {
      this.platforms = new Platforms(platforms);
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

  private validateConfig(config: ConfigService): void {
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
   * @param options - Optional start options. For example `{ port?: number }`.
   * @returns A promise that resolves when platform startup completes.
   */
  public async start(options?: { port?: number }): Promise<void> {
    if (this.config.layers?.application?.entryPoints) {
      await this.platforms?.registerEntrypoints(this.config.layers?.application?.entryPoints);

      await this.platforms?.start(options);
    }
  }
}

export { ServiceType };
