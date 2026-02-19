import proxy from "@fastify/http-proxy";
import { logger } from "@zacatl/logs";
import { Express, Request, Response, NextFunction } from "express";
import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createProxyMiddleware } from "http-proxy-middleware";
import type { ParsedQs } from "qs";

import { type ApiServerPort, type ProxyConfig } from "./port";
import { HookHandler, RouteHandler } from "../../../layers/application";

// ---------------------------------------------------------------------------
// Shared Zod schema validation helper (used by ExpressApiAdapter)
// ---------------------------------------------------------------------------

type RouteSchema = {
  body?: { parseAsync: (input: unknown) => Promise<unknown> };
  querystring?: { parseAsync: (input: unknown) => Promise<unknown> };
  params?: { parseAsync: (input: unknown) => Promise<unknown> };
};

async function applyZodSchema(schema: unknown, req: Request): Promise<void> {
  const s = schema as RouteSchema | undefined;
  if (!s) return;
  if (s.body) req.body = await s.body.parseAsync(req.body);
  if (s.querystring)
    req.query = (await s.querystring.parseAsync(req.query)) as ParsedQs;
  if (s.params)
    req.params = (await s.params.parseAsync(req.params)) as Record<
      string,
      string
    >;
}

// ---------------------------------------------------------------------------
// FastifyApiAdapter
// ---------------------------------------------------------------------------

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

    if (typeof register !== "function") {
      logger.warn(
        `ExpressApiAdapter: HTTP method '${handler.method}' is not supported by Express. ` +
          `Handler '${handler.constructor.name}' for '${url}' was not registered.`,
      );
      return;
    }

    register.call(
      this.server,
      url,
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          // Apply Zod schema validation (body, querystring, params) if present
          await applyZodSchema(handler.schema, req);

          // Fastify-compatible reply wrapper so handlers written against FastifyReply
          // work transparently on Express
          const replyAdapter = {
            sent: false as boolean,
            code: (statusCode: number) => {
              res.status(statusCode);
              return replyAdapter;
            },
            send: (payload: unknown) => {
              if (!res.headersSent) {
                replyAdapter.sent = true;
                res.json(payload);
              }
              return replyAdapter;
            },
            header: (key: string, value: string) => {
              res.setHeader(key, value);
              return replyAdapter;
            },
          };

          await handler.execute(req as never, replyAdapter as never);

          // If the handler returned without sending (e.g. reply.sent is still false),
          // send a 204 No Content so the request is not left hanging
          if (!res.headersSent) {
            res.status(204).end();
          }
        } catch (err) {
          next(err);
        }
      },
    );
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
        `ExpressApiAdapter: Hook '${handler.name}' is not supported in Express. ` +
          `Supported hooks: onRequest, preHandler.`,
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
