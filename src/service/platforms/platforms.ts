import { InternalServerError } from '@zacatl/error';
import { getContainer, registerValue } from '@zacatl/third-party/dependency-injection';
import {
  createChildContainer,
  ensureRegisteredSingleton,
} from '@zacatl/third-party/dependency-injection/container';
import {
  inject,
  injectable,
  type DependencyContainer,
} from '@zacatl/third-party/dependency-injection/tsyringe';

import { ApplicationContainerToken } from '../layers/application/tokens';
import { ServiceContainerToken } from '../tokens/service';
import type { ServiceStartOptions } from '../types';
import { CLI } from './cli/cli';
import { Desktop } from './desktop/desktop';
import { Server } from './server/server';
import { ServerConfigToken } from './server/tokens';
import { PlatformsConfigToken } from './tokens';
import { CliConfigToken, DesktopConfigToken } from './tokens';
import type { PlatformsConfig } from './types';
import type { ApplicationEntryPoints } from '../layers/application/types';

/**
 * Platforms - Wraps server, cli, or desktop instances
 * Stores config and delegates to platform instances
 * Service orchestrates the platforms
 */
@injectable()
export class Platforms {
  private readonly server?: Server;
  private readonly cli?: CLI;
  private readonly desktop?: Desktop;
  private readonly standaloneApplicationContainer?: DependencyContainer;

  constructor(
    @inject(PlatformsConfigToken) config: PlatformsConfig,
    @inject(ServiceContainerToken) serviceContainer?: DependencyContainer,
    @inject(ApplicationContainerToken) applicationContainer?: DependencyContainer,
  ) {
    const { server, cli, desktop } = config;
    if (serviceContainer == null && applicationContainer != null) {
      throw new InternalServerError({
        message: 'Platforms requires a Service container when an Application container is provided',
        reason: 'The Application scope must inherit the Service scope',
        component: 'Platforms',
        operation: 'constructor',
      });
    }

    const resolvedServiceContainer = serviceContainer ?? createChildContainer(getContainer());
    if (!resolvedServiceContainer.isRegistered(ServiceContainerToken, false)) {
      registerValue(
        ServiceContainerToken,
        resolvedServiceContainer,
        resolvedServiceContainer,
      );
    }

    const resolvedApplicationContainer =
      applicationContainer ?? createChildContainer(resolvedServiceContainer);
    if (applicationContainer == null) {
      registerValue(
        ApplicationContainerToken,
        resolvedApplicationContainer,
        resolvedApplicationContainer,
      );
      this.standaloneApplicationContainer = resolvedApplicationContainer;
    }

    let inheritedServiceContainer: DependencyContainer;
    let registeredApplicationContainer: DependencyContainer;
    try {
      inheritedServiceContainer = resolvedApplicationContainer.resolve(ServiceContainerToken);
      registeredApplicationContainer = resolvedApplicationContainer.resolve(ApplicationContainerToken);
    } catch (error) {
      throw new InternalServerError({
        message: 'Platforms could not resolve its required Service and Application scopes',
        reason: error instanceof Error ? error.message : String(error),
        component: 'Platforms',
        operation: 'constructor',
        error: error instanceof Error ? error : undefined,
      });
    }
    if (
      inheritedServiceContainer !== resolvedServiceContainer ||
      registeredApplicationContainer !== resolvedApplicationContainer
    ) {
      throw new InternalServerError({
        message: 'Platforms received inconsistent Service and Application container scopes',
        reason: 'The Application scope must inherit the supplied Service scope and register itself',
        component: 'Platforms',
        operation: 'constructor',
      });
    }

    const platformContainer = createChildContainer(resolvedApplicationContainer);

    if (server) {
      registerValue(ServerConfigToken, server, platformContainer);
      this.server = platformContainer.resolve(Server);
    }

    if (cli) {
      registerValue(CliConfigToken, cli, platformContainer);
      this.cli = platformContainer.resolve(CLI);
    }

    if (desktop) {
      registerValue(DesktopConfigToken, desktop, platformContainer);
      this.desktop = platformContainer.resolve(Desktop);
    }
  }

  public async registerEntrypoints(entryPoints: ApplicationEntryPoints): Promise<void> {
    if (this.server && entryPoints.rest) {
      // Direct Platforms callers do not construct an Application layer. Bind
      // their configured classes in the derived scope before Server resolves
      // them; Service-managed callers keep the Application layer as owner.
      if (this.standaloneApplicationContainer) {
        for (const hook of entryPoints.rest.hooks ?? []) {
          ensureRegisteredSingleton(hook, this.standaloneApplicationContainer);
        }
        for (const route of entryPoints.rest.routes ?? []) {
          ensureRegisteredSingleton(route, this.standaloneApplicationContainer);
        }
      }
      await this.server.registerEntrypoints(entryPoints.rest);
    }

    if (this.cli && entryPoints.cli) {
      await this.cli.registerEntrypoints(entryPoints.cli);
    }

    if (this.desktop && entryPoints.ipc) {
      await this.desktop.registerEntrypoints(entryPoints.ipc);
    }
  }

  public async stop(): Promise<void> {
    if (this.server) {
      await this.server.stop();
    }
  }

  public async prepare(): Promise<void> {
    await this.server?.prepare();
  }

  public async start(options?: ServiceStartOptions): Promise<void> {
    if (this.server) {
      await this.server.start(options);
    }

    if (this.cli) {
      await this.cli.start();
    }

    if (this.desktop) {
      await this.desktop.start();
    }
  }
}
