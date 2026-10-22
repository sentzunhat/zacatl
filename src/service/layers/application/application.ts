import { InternalServerError } from '@zacatl/error';
import { resolveDependencies } from '@zacatl/third-party/dependency-injection';
import { ensureRegisteredSingleton } from '@zacatl/third-party/dependency-injection/container';
import {
  inject,
  injectable,
  type DependencyContainer,
} from '@zacatl/third-party/dependency-injection/tsyringe';

import { ApplicationConfigToken, ApplicationContainerToken } from './tokens';
import type { ApplicationConfig } from './types';

@injectable()
export class Application {
  protected config: ApplicationConfig;
  private readonly container: DependencyContainer | undefined;

  constructor(
    @inject(ApplicationConfigToken) config: ApplicationConfig,
    @inject(ApplicationContainerToken) container?: DependencyContainer,
  ) {
    this.config = config;
    this.container = container;

    this.register();
  }

  private register(): void {
    if (this.config.entryPoints.rest != null) {
      this.registerRestEntryPoints();
    }
  }

  private registerRestEntryPoints(): void {
    const restEntryPoints = this.config.entryPoints.rest;

    if (restEntryPoints == null) {
      return;
    }

    const { hooks: restHooks, routes: restRoutes } = restEntryPoints;

    // Register handlers as singletons. @injectable() handlers are not
    // self-registered, so the framework registers them here; @singleton()
    // handlers already registered on module load are left untouched.
    if (restHooks != null && restHooks.length > 0) {
      for (const hook of restHooks) {
        ensureRegisteredSingleton(hook, this.container);
      }
    }

    if (restRoutes != null && restRoutes.length > 0) {
      for (const route of restRoutes) {
        ensureRegisteredSingleton(route, this.container);
      }
    }

    // Verify all handlers can be resolved
    const hooks = restHooks != null ? resolveDependencies(restHooks, this.container) : [];
    const routes = restRoutes != null ? resolveDependencies(restRoutes, this.container) : [];

    if (
      hooks.length !== (restHooks != null ? restHooks.length : 0) ||
      routes.length !== (restRoutes != null ? restRoutes.length : 0)
    ) {
      throw new InternalServerError({
        message: 'Failed to register all REST entry point dependencies',
        reason: 'Not all REST hooks and routes could be resolved from DI container',
        component: 'ApplicationLayer',
        operation: 'register',
        metadata: {
          expectedHooks: restHooks != null ? restHooks.length : 0,
          resolvedHooks: hooks.length,
          expectedRoutes: restRoutes != null ? restRoutes.length : 0,
          resolvedRoutes: routes.length,
        },
      });
    }
  }
}
