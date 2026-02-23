import { Express } from 'express';
import { FastifyInstance } from 'fastify';

import { CustomError, InternalServerError } from '@zacatl/error';

import { ExpressApiAdapter, FastifyApiAdapter } from './api/adapters';
import { ApiServer } from './api/api-server';
import type { ApiServerPort } from './api/port';
import { DatabaseServer } from './database/database-server';
import type { DatabaseConfig } from './database/port';
import { ExpressPageAdapter, FastifyPageAdapter } from './page/adapters';
import { PageServer } from './page/page-server';
import type { PageServerPort } from './page/port';
import { ServerVendor, type HttpServerConfig } from './types/server-config';
import type { RestApplicationEntryPoints } from '../../layers/application/types';

interface ServerPageConfig {
  devServerUrl?: string;
  staticDir?: string;
  customRegister?: (server: unknown) => Promise<void> | void;
  apiPrefix?: string;
}

export interface ConfigServer {
  name: string;
  server: HttpServerConfig;
  databases: Array<DatabaseConfig>;
  page?: ServerPageConfig;
  port: number;
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
 * const server = new Server({ name: "api", server: serverConfig, databases: [], port: 3000 });
 */
export class Server {
  private readonly config: ConfigServer;
  private readonly apiAdapter: ApiServerPort;
  private readonly pageAdapter: PageServerPort;
  private apiServer?: ApiServer;
  private pageServer?: PageServer;
  private databaseServer?: DatabaseServer;

  constructor(config: ConfigServer) {
    this.config = config;

    // Create shared adapters based on vendor (Fastify or Express)
    const adapters = this.createAdapters(config.server);
    this.apiAdapter = adapters.api;
    this.pageAdapter = adapters.page;

    this.initializeServers();
  }

  /**
   * Create API and Page adapters from the same HTTP server instance
   * This ensures both ApiServer and PageServer use the same underlying server
   */
  private createAdapters(config: HttpServerConfig): {
    api: ApiServerPort;
    page: PageServerPort;
  } {
    if (config.vendor === ServerVendor.FASTIFY) {
      const instance = config.instance as FastifyInstance;
      return {
        api: new FastifyApiAdapter(instance),
        page: new FastifyPageAdapter(instance),
      };
    } else if (config.vendor === ServerVendor.EXPRESS) {
      const instance = config.instance as Express;
      return {
        api: new ExpressApiAdapter(instance),
        page: new ExpressPageAdapter(instance),
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
  private initializeServers(): void {
    this.apiServer = new ApiServer(this.config.server, this.apiAdapter);
    this.pageServer = new PageServer(this.config, this.pageAdapter);

    if (this.config.databases.length > 0) {
      this.databaseServer = new DatabaseServer(this.config.name, this.config.databases);
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
   * Get API adapter for advanced configuration
   * Useful for accessing framework-specific features (Fastify/Express)
   */
  public getApiAdapter(): ApiServerPort {
    return this.apiAdapter;
  }

  /**
   * Get Page adapter for advanced configuration
   * Useful for custom page rendering or SPA setup
   */
  public getPageAdapter(): PageServerPort {
    return this.pageAdapter;
  }

  /**
   * Get ApiServer instance for direct access
   */
  public getApiServer(): ApiServer | undefined {
    return this.apiServer;
  }

  /**
   * Get PageServer instance for direct access
   */
  public getPageServer(): PageServer | undefined {
    return this.pageServer;
  }

  /**
   * Get DatabaseServer instance for direct access
   */
  public getDatabaseServer(): DatabaseServer | undefined {
    return this.databaseServer;
  }

  /**
   * Start the server
   */
  public async start(options?: { port?: number }): Promise<void> {
    try {
      // 1. Configure databases
      await this.configureDatabases();

      // 2. Configure page server (static files, SPA)
      if (this.pageServer) {
        await this.pageServer.configure();
      }

      // 3. Start API server listening
      if (!this.apiServer) {
        throw new InternalServerError({
          message: 'ApiServer not initialized',
          reason: 'ApiServer failed to initialize',
          component: 'Server',
          operation: 'start',
        });
      }

      const port = options?.port ?? this.config.port;
      await this.apiServer.listen(port);
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
