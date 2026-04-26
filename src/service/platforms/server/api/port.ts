import type { RouteHandler } from '../../../layers/application/entry-points/rest/fastify/handlers/route-handler';
import type { HookHandler } from '../../../layers/application/entry-points/rest/hook-handlers/hook-handler';

export interface ProxyConfig {
  upstream: string;
  prefix: string;
  rewritePrefix?: string;
  http2?: boolean;
}

/**
 * ApiServerPort - Hexagonal Architecture port for REST API server
 * Abstracts HTTP server implementations (Fastify, Express)
 */
export interface ApiServerPort {
  registerRoute(handler: RouteHandler): void;
  registerHook(handler: HookHandler): void;
  registerProxy(config: ProxyConfig): void;
  listen(port: number): Promise<void>;
  close(): Promise<void>;
  getRawServer(): unknown;
}
