import proxy from "@fastify/http-proxy";
import fastifyStatic from "@fastify/static";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";

import { HookHandler, RouteHandler } from "../../../layers/application";
import { type ApiServerPort, type ProxyConfig } from "../types/api-server-port";
import {
  type PageServerPort,
  type StaticConfig,
} from "../types/page-server-port";

/**
 * FastifyApiAdapter - Implements ApiServerPort for Fastify framework
 * Handles REST routes, hooks, and proxy registration
 */
export class FastifyApiAdapter implements ApiServerPort {
  constructor(private server: FastifyInstance) {}

  registerRoute(handler: RouteHandler): void {
    this.server.withTypeProvider<ZodTypeProvider>().route({
      url: handler.url,
      method: handler.method,
      schema: handler.schema,
      handler: handler.execute.bind(handler),
    });
  }

  registerHook(handler: HookHandler): void {
    this.server.addHook(handler.name, handler.execute.bind(handler));
  }

  registerProxy(config: ProxyConfig): void {
    this.server.register(proxy, {
      upstream: config.upstream,
      prefix: config.prefix,
      ...(config.rewritePrefix ? { rewritePrefix: config.rewritePrefix } : {}),
      ...(config.http2 !== undefined ? { http2: config.http2 } : {}),
    });
  }

  async listen(port: number): Promise<void> {
    await this.server.listen({ port, host: "0.0.0.0" });
  }

  getRawServer(): unknown {
    return this.server;
  }
}

/**
 * FastifyPageAdapter - Implements PageServerPort for Fastify framework
 * Handles static files and SPA fallback routing
 */
export class FastifyPageAdapter implements PageServerPort {
  constructor(private server: FastifyInstance) {}

  registerStaticFiles(config: StaticConfig): void {
    this.server.register(fastifyStatic, {
      root: config.root,
      ...(config.prefix ? { prefix: config.prefix } : {}),
    });
  }

  registerSpaFallback(apiPrefix: string, staticDir: string): void {
    this.server.setNotFoundHandler(async (request, reply) => {
      if (request.raw.url?.startsWith(apiPrefix)) {
        reply.status(404).send({
          code: 404,
          error: "Not Found",
          message: `Route ${request.method}:${request.url} not found`,
        });
      } else {
        reply.sendFile("index.html", staticDir);
      }
    });
  }

  async register(): Promise<void> {
    // Custom registration logic if needed
  }
}
