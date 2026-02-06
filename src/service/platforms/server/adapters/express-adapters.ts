import { logger } from "@zacatl/logs";
import { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

import { HookHandler, RouteHandler } from "../../../layers/application";
import { type ApiServerPort, type ProxyConfig } from "../types/api-server-port";
import {
  type PageServerPort,
  type StaticConfig,
} from "../types/page-server-port";

/**
 * ExpressApiAdapter - Implements ApiServerPort for Express framework
 * Handles REST routes, hooks, and proxy registration
 */
export class ExpressApiAdapter implements ApiServerPort {
  constructor(private server: Express) {}

  registerRoute(handler: RouteHandler): void {
    const method = handler.method.toLowerCase();
    const url = handler.url;

    (this.server as any)[method](
      url,
      async (req: Request, res: Response, next: NextFunction) => {
        try {
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

/**
 * ExpressPageAdapter - Implements PageServerPort for Express framework
 * Handles static files and SPA fallback routing
 */
export class ExpressPageAdapter implements PageServerPort {
  constructor(private server: Express) {}

  registerStaticFiles(config: StaticConfig): void {
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

  async register(): Promise<void> {
    // Custom registration logic if needed
  }
}
