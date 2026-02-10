import proxy from "@fastify/http-proxy";
import { logger } from "@zacatl/logs";
import { Express, Request, Response, NextFunction } from "express";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { ParsedQs } from "qs";

import { type ApiServerPort, type ProxyConfig } from "./port";
import { HookHandler, RouteHandler } from "../../../layers/application";

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
 * ExpressApiAdapter - Implements ApiServerPort for Express framework
 * Handles REST routes, hooks, and proxy registration
 */
export class ExpressApiAdapter implements ApiServerPort {
  constructor(private server: Express) {}

  registerRoute(handler: RouteHandler): void {
    const method = handler.method.toLowerCase();
    const url = handler.url;

    const register = (
      this.server as unknown as Record<
        string,
        (
          path: string,
          routeHandler: (
            req: Request,
            res: Response,
            next: NextFunction,
          ) => void,
        ) => void
      >
    )[method];

    if (typeof register !== "function") return;

    register(url, async (req: Request, res: Response, next: NextFunction) => {
      try {
        const schema = handler.schema as {
          body?: { parseAsync: (input: unknown) => Promise<unknown> };
          querystring?: { parseAsync: (input: unknown) => Promise<unknown> };
          params?: { parseAsync: (input: unknown) => Promise<unknown> };
        };

        if (schema) {
          if (schema.body) {
            req.body = await schema.body.parseAsync(req.body);
          }
          if (schema.querystring) {
            req.query = (await schema.querystring.parseAsync(
              req.query,
            )) as unknown as ParsedQs;
          }
          if (schema.params) {
            req.params = (await schema.params.parseAsync(req.params)) as Record<
              string,
              string
            >;
          }
        }

        const execute = handler.execute as unknown as (
          request: Request,
          reply: Response,
        ) => Promise<unknown>;
        const result = await execute(req, res);

        if (!res.headersSent && result !== undefined) {
          res.json(result);
        }
      } catch (err) {
        next(err);
      }
    });
  }

  registerHook(handler: HookHandler): void {
    if (handler.name === "onRequest" || handler.name === "preHandler") {
      this.server.use(
        async (req: Request, res: Response, next: NextFunction) => {
          try {
            const execute = handler.execute as unknown as (
              request: Request,
              reply: Response,
            ) => Promise<void>;
            await execute(req, res);
            next();
          } catch (err) {
            next(err);
          }
        },
      );
    } else {
      logger.warn(
        `Hook ${handler.name} is not fully supported in ExpressApiAdapter yet.`,
      );
    }
  }

  registerProxy(config: ProxyConfig): void {
    this.server.use(
      config.prefix,
      createProxyMiddleware({
        target: config.upstream,
        changeOrigin: true,
        ...(config.rewritePrefix
          ? { pathRewrite: { [`^${config.prefix}`]: config.rewritePrefix } }
          : {}),
      }),
    );
  }

  async listen(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server
        .listen(port, "0.0.0.0", () => {
          resolve();
        })
        .on("error", reject);
    });
  }

  getRawServer(): unknown {
    return this.server;
  }
}
