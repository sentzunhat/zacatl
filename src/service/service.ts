import { InternalServerError } from "@zacatl/error";
import { configureI18nNode } from "@zacatl/localization";

import { Layers } from "./layers";
import { Platforms } from "./platforms/platforms";
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

    if (layers) {
      new Layers(layers);
    }

    if (platforms) {
      this.platforms = new Platforms(platforms);
    }

    if (run && run.auto) {
      this.start().catch(() => {
        throw new Error("Failed to start service automatically");
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
            message:
              "ServiceType.SERVER requires 'platforms.server' configuration",
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
            message:
              "ServiceType.CLI requires 'layers.application.entryPoints.cli' configuration",
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
            message:
              "ServiceType.DESKTOP requires 'platforms.desktop' configuration",
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
      await this.platforms?.registerEntrypoints(
        this.config.layers?.application?.entryPoints,
      );

      await this.platforms?.start(options);
    }
  }
}

export { ServiceType };
