import { Application } from './application';
import { Domain } from './domain';
import { Infrastructure } from './infrastructure';
import type { ConfigLayers } from './types';

export class Layers {
  constructor(config: ConfigLayers) {
    const { application, domain, infrastructure } = config;

    // CRITICAL: Register dependencies in order so each layer can resolve previous layers
    // 1. Infrastructure (repositories) - no dependencies
    if (infrastructure) {
      new Infrastructure(infrastructure);
    }

    // 2. Domain (services) - depends on repositories
    if (domain) {
      new Domain(domain);
    }

    // 3. Application (handlers) - depends on services
    if (application) {
      new Application(application);
    }
  }
}
