import { InternalServerError } from "@zacatl/error";
import { configureI18nNode } from "@zacatl/localization";
import { container } from "@zacatl/third-party";
import { Mongoose } from "@zacatl/third-party/mongoose";
import { Sequelize } from "@zacatl/third-party/sequelize";

import { Layers } from "./layers";
import { Platforms } from "./platforms/platforms";
import { DatabaseVendor } from "./platforms/server/database/port";
import { ServiceType } from "./types";
import type { ConfigService } from "./types";

export type { ConfigService };

export class Service {
  private readonly config: ConfigService;

  private platforms: Platforms | undefined;

  constructor(config: ConfigService) {
    configureI18nNode(config.localization);

    this.validateConfig(config);

    this.config = config;

    const { layers, platforms, run } = config;

    // Pre-register database instances BEFORE instantiating layers
    // This ensures repositories can resolve database instances in their constructors
    if (platforms?.server?.databases) {
      for (const dbConfig of platforms.server.databases) {
        if (dbConfig.vendor === DatabaseVendor.MONGOOSE) {
          container.register(Mongoose, {
            useValue: dbConfig.instance,
          });
        } else if (dbConfig.vendor === DatabaseVendor.SEQUELIZE) {
          container.register(Sequelize, {
            useValue: dbConfig.instance,
          });
        }
      }
    }

    if (layers) {
      new Layers(layers);
    }

    if (platforms) {
      this.platforms = new Platforms(platforms);
    }

    if (run && run.auto) {
      this.start().catch((err) => {
        throw new InternalServerError({
          message: "Failed to start service automatically",
          reason: "Service auto-start encountered an error during initialization",
          component: "Service",
          operation: "constructor",
          error: err instanceof Error ? err : undefined,
        });
      });
    }
  }

  private validateConfig(config: ConfigService): void {
    const { type, layers, platforms } = config;

    const configType = type ?? undefined;

    if (!configType) {
      throw new InternalServerError({
        message: "Service configuration must specify a 'type' field",
        reason: "Missing service type",
        component: "Service",
        operation: "constructor",
      });
    }

    switch (configType) {
      case ServiceType.SERVER:
        if (!platforms?.server) {
          throw new InternalServerError({
            message: "ServiceType.SERVER requires 'platforms.server' configuration",
            reason: "Server platform configuration is missing",
            component: "Service",
            operation: "validateConfig",
            metadata: { serviceType: configType },
          });
        }
        if (!layers?.application || !layers.application.entryPoints?.rest) {
          throw new InternalServerError({
            message:
              "ServiceType.SERVER requires 'layers.application.entryPoints.rest' configuration",
            reason: "REST entry points configuration is missing",
            component: "Service",
            operation: "validateConfig",
            metadata: { serviceType: configType },
          });
        }
        break;

      case ServiceType.CLI:
        if (!platforms?.cli) {
          throw new InternalServerError({
            message: "ServiceType.CLI requires 'platforms.cli' configuration",
            reason: "CLI platform configuration is missing",
            component: "Service",
            operation: "validateConfig",
            metadata: { serviceType: configType },
          });
        }
        if (!layers?.application || !layers.application.entryPoints?.cli) {
          throw new InternalServerError({
            message: "ServiceType.CLI requires 'layers.application.entryPoints.cli' configuration",
            reason: "CLI entry points configuration is missing",
            component: "Service",
            operation: "validateConfig",
            metadata: { serviceType: configType },
          });
        }
        break;

      case ServiceType.DESKTOP:
        if (!platforms?.desktop) {
          throw new InternalServerError({
            message: "ServiceType.DESKTOP requires 'platforms.desktop' configuration",
            reason: "Desktop platform configuration is missing",
            component: "Service",
            operation: "validateConfig",
            metadata: { serviceType: configType },
          });
        }
        if (!layers?.application || !layers.application.entryPoints?.ipc) {
          throw new InternalServerError({
            message:
              "ServiceType.DESKTOP requires 'layers.application.entryPoints.ipc' configuration",
            reason: "IPC entry points configuration is missing",
            component: "Service",
            operation: "validateConfig",
            metadata: { serviceType: configType },
          });
        }
        break;
    }
  }

  public async start(options?: { port?: number }): Promise<void> {
    if (this.config.layers?.application?.entryPoints) {
      await this.platforms?.registerEntrypoints(this.config.layers?.application?.entryPoints);

      await this.platforms?.start(options);
    }
  }
}

export { ServiceType };
