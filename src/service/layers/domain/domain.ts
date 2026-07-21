import type { DomainConfig } from './types';
import { ensureRegisteredSingleton } from '../../../dependency-injection/container';

export class Domain {
  protected config: DomainConfig;

  constructor(config: DomainConfig) {
    this.config = config;

    this.register();
  }

  private register(): void {
    this.registerProviders();

    this.registerServices();
  }

  private registerProviders(): void {
    if (this.config.providers && this.config.providers.length > 0) {
      for (const provider of this.config.providers) {
        ensureRegisteredSingleton(provider);
      }
    }
  }

  private registerServices(): void {
    if (this.config.services && this.config.services.length > 0) {
      for (const service of this.config.services) {
        ensureRegisteredSingleton(service);
      }
    }
  }
}
