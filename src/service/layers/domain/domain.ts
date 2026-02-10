import { container } from "@zacatl/third-party/tsyringe";

import type { ConfigDomain } from "./types";

export class Domain {
  protected config: ConfigDomain;

  constructor(config: ConfigDomain) {
    this.config = config;

    this.register();
  }

  private register(): void {
    this.registerProviders();

    this.registerServices();
  }

  private registerProviders(): void {
    if (this.config.providers && this.config.providers.length > 0) {
      // Providers registered - tsyringe auto-injects from @injectable metadata
      for (const provider of this.config.providers) {
        container.registerSingleton(provider, provider);
      }
    }
  }

  private registerServices(): void {
    if (this.config.services && this.config.services.length > 0) {
      // Services registered - tsyringe auto-injects repositories from @injectable metadata
      for (const service of this.config.services) {
        container.registerSingleton(service, service);
      }
    }
  }
}
