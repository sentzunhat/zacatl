import { resolveDependencies } from "@zacatl/dependency-injection";
import { CustomError, InternalServerError } from "@zacatl/error";

import { type ApiServerPort, type ProxyConfig } from "./port";
import { HookHandler, RouteHandler } from "../../../layers/application";
import type { RestApplicationEntryPoints } from "../../../layers/application/types";
import { ApiServerType, type HttpServerConfig } from "../types/server-config";

export enum HandlersType {
  HOOK = "hook",
  ROUTE = "route",
}

type Handlers = RouteHandler | HookHandler;

interface RegisterHandlersInput {
  handlers: Handlers[];
  handlersType: HandlersType;
}

/**
 * ApiServer - Encapsulates REST API logic
 * Uses shared adapter provided by Server class
 * Handles route/hook registration and proxy configuration
 */
export class ApiServer {
  private readonly config: HttpServerConfig;
  private readonly adapter: ApiServerPort;

  constructor(config: HttpServerConfig, adapter: ApiServerPort) {
    this.config = config;
    this.adapter = adapter;
  }

  /**
   * Register entry points (routes and hooks) and configure gateway proxies
   */
  public async registerEntrypoints(entryPoints: RestApplicationEntryPoints): Promise<void> {
    // Register REST entry points
    await this.registerAllRestHandlers(entryPoints);

    // Configure gateway proxies if needed
    if (this.config.type === ApiServerType.GATEWAY && this.config.gateway?.proxies != null) {
      for (const proxyConf of this.config.gateway.proxies) {
        this.registerProxy({
          upstream: proxyConf.upstream,
          prefix: proxyConf.prefix ?? "/",
          http2: false,
        });
      }
    }
  }

  private async registerHandlers(input: RegisterHandlersInput): Promise<void> {
    const { handlers, handlersType } = input;

    await Promise.all(
      handlers.map(async (handler) => {
        try {
          if (handlersType === HandlersType.ROUTE) {
            this.adapter.registerRoute(handler as RouteHandler);
          } else if (handlersType === HandlersType.HOOK) {
            this.adapter.registerHook(handler as HookHandler);
          } else {
            throw new InternalServerError({
              message: `Handler type ${handlersType} is not supported`,
              reason: "Handler type must be ROUTE or HOOK",
              component: "ApiServer",
              operation: "registerHandlers",
              metadata: { handlersType },
            });
          }
        } catch (error: unknown) {
          throw new CustomError({
            message: `failed to register ${handlersType}: ${handler.constructor.name}`,
            code: 500,
            reason: "handler registration failed",
            error: error as Error,
            metadata: { handler: handler.constructor.name },
          });
        }
      }),
    );
  }

  /**
   * Register all hooks from REST entry points config
   */
  public async registerAllHooks(restEntryPoints: RestApplicationEntryPoints): Promise<void> {
    if (restEntryPoints.hooks == null || restEntryPoints.hooks.length === 0) {
      return;
    }

    const hooks = resolveDependencies(restEntryPoints.hooks);

    await this.registerHandlers({
      handlers: hooks,
      handlersType: HandlersType.HOOK,
    });
  }

  /**
   * Register all routes from REST entry points config
   */
  public async registerAllRoutes(restEntryPoints: RestApplicationEntryPoints): Promise<void> {
    if (restEntryPoints.routes == null || restEntryPoints.routes.length === 0) {
      return;
    }

    const routes = resolveDependencies(restEntryPoints.routes);

    await this.registerHandlers({
      handlers: routes,
      handlersType: HandlersType.ROUTE,
    });
  }

  /**
   * Register all REST entry points (hooks and routes)
   */
  public async registerAllRestHandlers(restEntryPoints: RestApplicationEntryPoints): Promise<void> {
    await this.registerAllHooks(restEntryPoints);
    await this.registerAllRoutes(restEntryPoints);
  }

  /**
   * Register proxy routes
   */
  public registerProxy(config: ProxyConfig): void {
    this.adapter.registerProxy(config);
  }

  /**
   * Start listening on port
   */
  public async listen(port: number): Promise<void> {
    await this.adapter.listen(port);
  }

  /**
   * Get raw server instance for direct access
   */
  public getRawServer(): unknown {
    return this.adapter.getRawServer();
  }

  /**
   * Get API adapter for advanced configuration
   * Useful for accessing framework-specific features (Fastify/Express)
   */
  public getAdapter(): ApiServerPort {
    return this.adapter;
  }
}
