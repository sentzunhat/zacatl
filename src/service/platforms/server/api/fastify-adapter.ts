import proxy from "@fastify/http-proxy";
import type { FastifyInstance } from "fastify";

import { ZodTypeProvider } from "@zacatl/third-party/fastify";

import type { ApiServerPort, ProxyConfig } from "./port";
import type { HookHandler, RouteHandler } from "../../../layers/application";

/**
 * FastifyApiAdapter - Implements ApiServerPort for Fastify framework
 */
export class FastifyApiAdapter implements ApiServerPort {
  constructor(private readonly server: FastifyInstance) {}

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
      ...(config.rewritePrefix != null ? { rewritePrefix: config.rewritePrefix } : {}),
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
