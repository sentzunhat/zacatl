import { Application } from './application/application';
import { Domain } from './domain/domain';
import { Infrastructure } from './infrastructure/infrastructure';
import type { LayersConfig } from './types';

export class Layers {
  private readonly infrastructure: Infrastructure | undefined;

  constructor(config: LayersConfig) {
    // CRITICAL: Register dependencies in order so each layer can resolve previous layers
    // 1. Infrastructure (repositories) - no dependencies
    if (config.infrastructure) {
      this.infrastructure = new Infrastructure(config.infrastructure);
    }

    // 2. Domain (services) - depends on repositories
    if (config.domain) {
      new Domain(config.domain);
    }

    // 3. Application (handlers) - depends on services
    if (config.application) {
      new Application(config.application);
    }
  }

  public async start(): Promise<void> {
    await this.infrastructure?.start();
  }
}
