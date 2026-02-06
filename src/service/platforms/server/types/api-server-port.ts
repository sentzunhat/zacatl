import type { HookHandler, RouteHandler } from "../../../layers/application";

export type ProxyConfig = {
  upstream: string;
  prefix: string;
  rewritePrefix?: string;
  http2?: boolean;
};

/**
 * ApiServerPort - Hexagonal Architecture port for REST API server
 * Abstracts HTTP server implementations (Fastify, Express)
 */
export interface ApiServerPort {
  registerRoute(handler: RouteHandler): void;
  registerHook(handler: HookHandler): void;
  registerProxy(config: ProxyConfig): void;
  listen(port: number): Promise<void>;
  getRawServer(): unknown;
}
