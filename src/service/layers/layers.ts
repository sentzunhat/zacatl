import { createChildContainer } from '@zacatl/dependency-injection/container';
import type { DependencyContainer } from '@zacatl/third-party/dependency-injection/tsyringe';

import { Application } from './application/application';
import { Domain } from './domain/domain';
import { Infrastructure } from './infrastructure/infrastructure';
import type { LayersConfig } from './types';

export class Layers {
  private readonly infrastructure: Infrastructure | undefined;

  constructor(config: LayersConfig, parentContainer?: DependencyContainer) {
    // CRITICAL: Register dependencies in order so each layer can resolve previous layers
    const infraContainer = createChildContainer(parentContainer);
    const domainContainer = createChildContainer(infraContainer);
    const appContainer = createChildContainer(domainContainer);

    // 1. Infrastructure (repositories) - no dependencies
    if (config.infrastructure) {
      this.infrastructure = new Infrastructure(config.infrastructure, infraContainer);
    }

    // 2. Domain (services) - depends on repositories
    if (config.domain) {
      new Domain(config.domain, domainContainer);
    }

    // 3. Application (handlers) - depends on services
    if (config.application) {
      new Application(config.application, appContainer);
    }
  }

  public async start(): Promise<void> {
    await this.infrastructure?.start();
  }
}
