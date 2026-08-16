import { resolveDependencies } from '@zacatl/dependency-injection';
import { InternalServerError } from '@zacatl/error';
import type { DependencyContainer } from '@zacatl/third-party/dependency-injection/tsyringe';

import type { InfrastructureConfig, InfrastructureUnknownRepository } from './types';
import { ensureRegisteredSingleton } from '../../../dependency-injection/container';

export type { InfrastructureConfig };

/**
 * Infrastructure layer bootstrapper
 *
 * Responsible for registering infrastructure-level components (repositories)
 * in the DI container and performing basic lifecycle hooks.
 */
export class Infrastructure {
  protected config: InfrastructureConfig;
  private readonly repositories: InfrastructureUnknownRepository[] = [];
  private readonly container: DependencyContainer | undefined;

  constructor(config: InfrastructureConfig, container?: DependencyContainer) {
    this.config = config;
    this.container = container;

    this.register();
  }

  private register(): void {
    if (this.config.repositories && this.config.repositories.length > 0) {
      this.registerRepositories();
    }
  }

  private registerRepositories(): void {
    if (!this.config.repositories) {
      return;
    }

    for (const repository of this.config.repositories) {
      ensureRegisteredSingleton(repository, this.container);
    }

    const resolvedRepositories = resolveDependencies<InfrastructureUnknownRepository>(
      this.config.repositories,
      this.container,
    );

    if (resolvedRepositories.length !== this.config.repositories.length) {
      throw new InternalServerError({
        message: 'Failed to register all infrastructure repository dependencies',
        reason: 'Not all repositories could be resolved from DI container',
        component: 'InfrastructureLayer',
        operation: 'register',
        metadata: {
          expected: this.config.repositories.length,
          resolved: resolvedRepositories.length,
        },
      });
    }

    this.repositories.splice(0, this.repositories.length, ...resolvedRepositories);
  }

  /**
   * Start the infrastructure layer. No-op by default; provided for consumers
   * that require explicit lifecycle start hooks.
   */
  public async start(): Promise<void> {
    for (const repository of this.repositories) {
      await repository.ready();
    }
  }
}
