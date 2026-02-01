import { Express, Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import express from "express";
import { logger } from "../../../../../logs";
import { ServerAdapter, ProxyConfig, StaticConfig } from "../server-adapter";
import { HookHandler, RouteHandler } from "../../../application";

export class ExpressAdapter implements ServerAdapter {
  constructor(private server: Express) {}

  registerRoute(handler: RouteHandler): void {
    const method = handler.method.toLowerCase();
    // Fastify uses :param, Express uses :param.
    // Fastify might use wildcard *, Express uses *.
    const url = handler.url;

    (this.server as any)[method](
      url,
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          // Basic Zod Validation Shim
          // We assume handler.schema follows the structure { body?: ZodSchema, querystring?: ZodSchema, params?: ZodSchema }
          const schema = handler.schema as any;

          if (schema) {
            if (schema.body) {
              req.body = await schema.body.parseAsync(req.body);
            }
            if (schema.querystring) {
              req.query = await schema.querystring.parseAsync(req.query);
            }
            if (schema.params) {
              req.params = await schema.params.parseAsync(req.params);
            }
          }

          const result = await handler.execute(req as any, res as any);

          if (!res.headersSent && result !== undefined) {
            res.json(result);
          }
        } catch (err) {
          next(err);
        }
      },
    );
  }

  registerHook(handler: HookHandler): void {
    // Map Fastify hooks to Express middleware
    // onRequest -> app.use
    if (handler.name === "onRequest" || handler.name === "preHandler") {
      this.server.use(async (req, res, next) => {
        try {
          await handler.execute(req as any, res as any);
          next();
        } catch (err) {
          next(err);
        }
      });
    } else {
      logger.warn(
        `Hook ${handler.name} is not fully supported in ExpressAdapter yet.`,
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

  serveStatic(config: StaticConfig): void {
    this.server.use(config.prefix || "/", express.static(config.root));
  }

  registerSpaFallback(apiPrefix: string, staticDir: string): void {
    this.server.use((req, res, _next) => {
      if (req.path.startsWith(apiPrefix)) {
        res.status(404).json({
          code: 404,
          error: "Not Found",
          message: `Route ${req.method}:${req.path} not found`,
        });
      } else {
        res.sendFile("index.html", { root: staticDir });
      }
    });
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

  getRawServer(): any {
    return this.server;
  }
}
