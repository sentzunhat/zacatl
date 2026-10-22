import { ensureRegisteredSingleton } from '@zacatl/third-party/dependency-injection/container';
import {
  inject,
  injectable,
  type DependencyContainer,
} from '@zacatl/third-party/dependency-injection/tsyringe';

import { DomainConfigToken, DomainContainerToken } from './tokens';
import type { DomainConfig } from './types';

@injectable()
export class Domain {
  protected config: DomainConfig;
  private readonly container: DependencyContainer | undefined;

  constructor(
    @inject(DomainConfigToken) config: DomainConfig,
    @inject(DomainContainerToken) container?: DependencyContainer,
  ) {
    this.config = config;
    this.container = container;

    this.register();
  }

  private register(): void {
    this.registerProviders();

    this.registerServices();
  }

  private registerProviders(): void {
    if (this.config.providers && this.config.providers.length > 0) {
      for (const provider of this.config.providers) {
        ensureRegisteredSingleton(provider, this.container);
      }
    }
  }

  private registerServices(): void {
    if (this.config.services && this.config.services.length > 0) {
      for (const service of this.config.services) {
        ensureRegisteredSingleton(service, this.container);
      }
    }
  }
}
