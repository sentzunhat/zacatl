import type { Express, Request, Response, NextFunction } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import { logger } from '@zacatl/logs';

import type { ApiServerPort, ProxyConfig } from './port';
import { applyZodSchema } from './schema-helper';
import type { HookHandler, RouteHandler } from '../../../layers/application';

/**
 * ExpressApiAdapter - Implements ApiServerPort for Express framework
 */
export class ExpressApiAdapter implements ApiServerPort {
  constructor(private readonly server: Express) {}

  registerRoute(handler: RouteHandler): void {
    const method = handler.method.toLowerCase();
    const url = handler.url;

    const register = (
      this.server as unknown as Record<
        string,
        (
          path: string,
          routeHandler: (req: Request, res: Response, next: NextFunction) => void,
        ) => void
      >
    )[method];

    if (typeof register !== 'function') {
      logger.warn(
        `ExpressApiAdapter: HTTP method '${handler.method}' is not supported by Express. ` +
          `Handler '${handler.constructor.name}' for '${url}' was not registered.`,
      );
      return;
    }

    register.call(this.server, url, async (req: Request, res: Response, next: NextFunction) => {
      try {
        await applyZodSchema(handler.schema, req);

        const replyAdapter = {
          sent: false as boolean,
          code: (statusCode: number) => {
            res.status(statusCode);
            return replyAdapter;
          },
          send: (payload: unknown) => {
            if (res.headersSent !== true) {
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

        if (res.headersSent !== true) {
          res.status(204).end();
        }
      } catch (err) {
        next(err);
      }
    });
  }

  registerHook(handler: HookHandler): void {
    if (handler.name === 'onRequest' || handler.name === 'preHandler') {
      this.server.use(async (req: Request, res: Response, next: NextFunction) => {
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
      });
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
        ...(config.rewritePrefix != null
          ? { pathRewrite: { [`^${config.prefix}`]: config.rewritePrefix } }
          : {}),
      }),
    );
  }

  async listen(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server
        .listen(port, '0.0.0.0', () => {
          resolve();
        })
        .on('error', reject);
    });
  }

  getRawServer(): unknown {
    return this.server;
  }
}
