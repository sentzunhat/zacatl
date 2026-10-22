import type { Express } from 'express';
import type { FastifyInstance } from 'fastify';

import { CustomError, InternalServerError } from '@zacatl/error';
import { logger as defaultLogger, LoggerToken, type Logger } from '@zacatl/logs';
import { getContainer, registerValue } from '@zacatl/third-party/dependency-injection';
import { createChildContainer } from '@zacatl/third-party/dependency-injection/container';
import {
  inject,
  injectable,
  type DependencyContainer,
} from '@zacatl/third-party/dependency-injection/tsyringe';

import { ApiServer } from './api/api-server';
import type { ApiServerPort } from './api/port';
import { DatabaseServer } from './database/database-server';
import type { DatabaseConfig } from './database/port';
import { PageServer } from './page/page-server';
import type { PageServerPort } from './page/port';
import type { ServiceStartOptions } from '../../types';
import { createApiAdapter as createExpressApiAdapter } from './providers/express/api-adapter';
import { createPageAdapter as createExpressPageAdapter } from './providers/express/page-adapter';
import { createApiAdapter as createFastifyApiAdapter } from './providers/fastify/api-adapter';
import { createPageAdapter as createFastifyPageAdapter } from './providers/fastify/page-adapter';
import {
  ApiServerAdapterToken,
  ApiServerConfigToken,
  ApiServerContainerToken,
  DatabaseContainerToken,
  DatabaseConfigsToken,
  DatabaseServiceNameToken,
  PageServerAdapterToken,
  PageServerConfigToken,
  PageServerResolutionContainerToken,
  ServerConfigToken,
} from './tokens';
import { ServerVendor, type HttpServerConfig, type PageServerConfig } from './types/server-config';
import { ApplicationContainerToken } from '../../layers/application/tokens';
import type { RestApplicationEntryPoints } from '../../layers/application/types';
import { InfrastructureContainerToken } from '../../layers/infrastructure/tokens';
import { ServiceContainerToken } from '../../tokens/service';

export interface ServerConfig {
  name: string;
  server: HttpServerConfig;
  databases: Array<DatabaseConfig>;
  page?: PageServerConfig;
  /** Internal HTTP port. Defaults to 9669. */
  port?: number;
  /** REST entry points for route/hook registration */
  entryPoints?: RestApplicationEntryPoints;
}

/**
 * Server orchestration for REST, pages, and database connections.
 *
 * @param config - Service server configuration and entry points.
 * @returns Starts HTTP listening and initializes configured databases.
 *
 * @example
 * const server = new Server({ name: "api", server: serverConfig, databases: [], port: 9669 });
 */
@injectable()
export class Server {
  private preparation: Promise<void> | undefined;

  private readonly config: ServerConfig;
  private readonly apiAdapter: ApiServerPort;
  private readonly pageAdapter: PageServerPort;
  private apiServer?: ApiServer;
  private pageServer?: PageServer;
  private databaseServer?: DatabaseServer;

  private readonly logger: Logger;

  constructor(
    @inject(ServerConfigToken) config: ServerConfig,
    @inject(ServiceContainerToken) container?: DependencyContainer,
    @inject(ApplicationContainerToken) applicationContainer?: DependencyContainer,
  ) {
    this.config = config;
    if (container == null && applicationContainer != null) {
      throw new InternalServerError({
        message: 'Server requires a Service container when an Application container is provided',
        reason: 'The Application scope must inherit the Service scope',
        component: 'Server',
        operation: 'constructor',
      });
    }
    const serviceContainer = container ?? createChildContainer(getContainer());
    if (!serviceContainer.isRegistered(ServiceContainerToken, false)) {
      registerValue(ServiceContainerToken, serviceContainer, serviceContainer);
    }
    const resolvedApplicationContainer = applicationContainer ?? createChildContainer(serviceContainer);
    if (applicationContainer == null) {
      registerValue(
        ApplicationContainerToken,
        resolvedApplicationContainer,
        resolvedApplicationContainer,
      );
    }
    try {
      const inheritedServiceContainer = resolvedApplicationContainer.resolve(ServiceContainerToken);
      const registeredApplicationContainer = resolvedApplicationContainer.resolve(ApplicationContainerToken);
      if (
        inheritedServiceContainer !== serviceContainer ||
        registeredApplicationContainer !== resolvedApplicationContainer
      ) {
        throw new Error('Resolved container tokens do not match the supplied scopes');
      }
    } catch (error: unknown) {
      throw new InternalServerError({
        message: 'Server received inconsistent Service and Application container scopes',
        reason: error instanceof Error ? error.message : String(error),
        component: 'Server',
        operation: 'constructor',
        error: error instanceof Error ? error : undefined,
      });
    }
    // The Service registers its logger in the container it shares with the
    // layers; standalone Platforms construction supplies its own Service scope.
    this.logger =
      serviceContainer.isRegistered(LoggerToken, true)
        ? serviceContainer.resolve(LoggerToken)
        : defaultLogger;

    // Create shared adapters based on vendor (Fastify or Express)
    const adapters = this.createAdapters(config.server);
    this.apiAdapter = adapters.api;
    this.pageAdapter = adapters.page;

    // Direct Server callers have no Application layer to register entry-point
    // classes in the derived child. Keep their existing container lookup path;
    // Service-managed callers always supply the exact Application scope.
    this.initializeServers(
      resolvedApplicationContainer,
      applicationContainer ?? container ?? getContainer(),
    );
  }

  /**
   * Create API and Page adapters from the same HTTP server instance
   * This ensures both ApiServer and PageServer use the same underlying server
   */
  private createAdapters(config: HttpServerConfig): {
    api: ApiServerPort;
    page: PageServerPort;
  } {
    const prefixes = config.prefixes?.api ?? '';

    if (config.vendor === ServerVendor.FASTIFY) {
      const instance = config.instance as FastifyInstance;
      return {
        api: createFastifyApiAdapter(instance, prefixes),
        page: createFastifyPageAdapter(instance),
      };
    } else if (config.vendor === ServerVendor.EXPRESS) {
      const instance = config.instance as Express;
      return {
        api: createExpressApiAdapter(instance, prefixes, this.logger),
        page: createExpressPageAdapter(instance),
      };
    } else {
      throw new InternalServerError({
        message: `Unsupported server vendor: ${config.vendor}`,
        reason: 'Server vendor must be Fastify or Express',
        component: 'Server',
        operation: 'createAdapters',
        metadata: { vendor: config.vendor },
      });
    }
  }

  /**
   * Initialize ApiServer, PageServer, and DatabaseServer
   */
  private initializeServers(
    applicationContainer: DependencyContainer,
    handlerContainer: DependencyContainer,
  ): void {
    // Server owns component construction and registers each component's values
    // in its own child scope. Components inherit application services without
    // leaking their private tokens into sibling scopes.
    const apiServerContainer = createChildContainer(applicationContainer);
    registerValue(ApiServerConfigToken, this.config.server, apiServerContainer);
    registerValue(ApiServerAdapterToken, this.apiAdapter, apiServerContainer);
    // Entry-point classes are registered by the Application layer, so bind
    // ApiServer's handler scope to that exact container. Its config and
    // adapter stay private to the API server child scope.
    registerValue(ApiServerContainerToken, handlerContainer, apiServerContainer);
    this.apiServer = apiServerContainer.resolve(ApiServer);

    const pageServerContainer = createChildContainer(applicationContainer);
    registerValue(PageServerConfigToken, this.config, pageServerContainer);
    registerValue(PageServerAdapterToken, this.pageAdapter, pageServerContainer);
    registerValue(PageServerResolutionContainerToken, handlerContainer, pageServerContainer);
    this.pageServer = pageServerContainer.resolve(PageServer);

    if (this.config.databases.length > 0) {
      const databaseServerContainer = createChildContainer(applicationContainer);
      registerValue(DatabaseServiceNameToken, this.config.name, databaseServerContainer);
      registerValue(DatabaseConfigsToken, this.config.databases, databaseServerContainer);
      const infrastructureContainer = applicationContainer.isRegistered(
        InfrastructureContainerToken,
        true,
      )
        ? applicationContainer.resolve(InfrastructureContainerToken)
        : getContainer();
      registerValue(DatabaseContainerToken, infrastructureContainer, databaseServerContainer);
      this.databaseServer = databaseServerContainer.resolve(DatabaseServer);
    }
  }

  /**
   * Configure all databases for the service
   */
  private async configureDatabases(): Promise<void> {
    if (this.databaseServer) {
      await this.databaseServer.configure();
    }
  }

  /**
   * Register entry points from Application layer
   */
  public async registerEntrypoints(entryPoints: RestApplicationEntryPoints): Promise<void> {
    if (this.apiServer) {
      await this.apiServer.registerEntrypoints(entryPoints);
    }
  }

  /**
   * Stop the server: close HTTP connections and disconnect all databases.
   */
  public async stop(): Promise<void> {
    let shutdownError: unknown;
    let hasShutdownError = false;
    try {
      await this.apiServer?.close();
    } catch (error) {
      shutdownError = error;
      hasShutdownError = true;
    }
    try {
      await this.databaseServer?.disconnect();
    } catch (error) {
      if (!hasShutdownError) {
        shutdownError = error;
        hasShutdownError = true;
      }
    }
    if (hasShutdownError) {
      throw shutdownError;
    }
  }

  /**
   * Start the server
   */
  public async prepare(): Promise<void> {
    if (this.preparation == null) {
      this.preparation = this.prepareInternal().catch((error: unknown) => {
        this.preparation = undefined;
        throw error;
      });
    }

    await this.preparation;
  }

  private async prepareInternal(): Promise<void> {
    try {
      await this.configureDatabases();
      if (this.pageServer) {
        await this.pageServer.configure();
      }
    } catch (error: unknown) {
      throw new CustomError({
        message: `failed to prepare service "${this.config.name}"`,
        code: 500,
        reason: 'service preparation failed',
        error: error as Error,
      });
    }
  }

  public async start(options?: ServiceStartOptions): Promise<void> {
    try {
      // Direct Server consumers historically received database and page
      // preparation as part of startup. Service.start() may call prepare()
      // earlier; the cached preparation promise keeps that path idempotent.
      await this.prepare();

      // 3. Start API server listening
      if (!this.apiServer) {
        throw new InternalServerError({
          message: 'ApiServer not initialized',
          reason: 'ApiServer failed to initialize',
          component: 'Server',
          operation: 'start',
        });
      }

      const host = options?.host ?? this.config.server.host ?? '0.0.0.0';
      const port = options?.port ?? this.config.port ?? 9669;
      await this.apiServer.listen(host, port);
    } catch (error: unknown) {
      throw new CustomError({
        message: `failed to start service "${this.config.name}"`,
        code: 500,
        reason: 'service start failed',
        error: error as Error,
        metadata: {
          service: {
            name: this.config.name,
            vendor: this.config.server.vendor,
            type: this.config.server.type,
          },
        },
      });
    }
  }
}
