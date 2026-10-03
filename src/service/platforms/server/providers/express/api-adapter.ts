import type { Express, Request, Response, NextFunction } from 'express';
import type { FastifyBaseLogger } from 'fastify';
import type { Options as ProxyOptions, RequestHandler as ProxyHandler } from 'http-proxy-middleware';

import { logger as defaultLogger, toFastifyLogger, type Logger } from '@zacatl/logs';
import { uuidv4 } from '@zacatl/third-party/uuid';

import { applyZodSchema } from './schema-helper';
import type { RouteHandler } from '../../../../layers/application/entry-points/rest/fastify/handlers/route-handler';
import type { HookHandler } from '../../../../layers/application/entry-points/rest/hook-handlers/hook-handler';
import type { ApiServerPort, ProxyConfig } from '../../api/port';
import { normalizePrefix } from '../../shared/prefixes/normalize-prefix';

/**
 * Express implementation of ApiServerPort.
 */
export const createApiAdapter = (
  server: Express,
  apiPrefix = '',
  logger: Logger = defaultLogger,
): ApiServerPort => {
  let httpServer: ReturnType<Express['listen']> | null = null;

  // Handlers are typed against Fastify's request, so give Express requests the
  // same pino-style `log` (bound to a per-request `reqId`) that Fastify's
  // `request.log` / `reply.log` have, writing through the Service's logger.
  const baseRequestLogger = toFastifyLogger(logger);
  const attachRequestLogger = (req: Request, res: Response): FastifyBaseLogger => {
    const carrier = req as Request & { id?: unknown; log?: FastifyBaseLogger };
    // Keep a logger another middleware (e.g. pino-http) already attached.
    if (carrier.log == null) {
      // Generated, never taken from request headers.
      const reqId = typeof carrier.id === 'string' ? carrier.id : uuidv4();
      carrier.log = baseRequestLogger.child({ reqId });
    }
    const response = res as Response & { log?: FastifyBaseLogger };
    response.log ??= carrier.log;
    return carrier.log;
  };

  const getRouteUrl = (url: string): string => {
    const prefix = normalizePrefix(apiPrefix);

    if (prefix === '') {
      return url;
    }

    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;

    return `${prefix}${normalizedUrl}`;
  };

  return {
    registerRoute: (handler: RouteHandler): void => {
      const method = handler.method.toLowerCase();
      const url = getRouteUrl(handler.url);

      const register = (
        server as unknown as Record<
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

      register.call(server, url, async (req: Request, res: Response, next: NextFunction) => {
        try {
          await applyZodSchema(handler.schema, req);
          const requestLog = attachRequestLogger(req, res);

          const replyAdapter = {
            sent: false as boolean,
            log: requestLog,
            setStatus: (statusCode: number) => {
              res.status(statusCode);
              return replyAdapter;
            },
            // Support both Express route handlers and shared Fastify-shaped
            // integrations when they run through this adapter.
            status: (statusCode: number) => replyAdapter.setStatus(statusCode),
            code: (statusCode: number) => replyAdapter.setStatus(statusCode),
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
    },

    registerHook: (handler: HookHandler): void => {
      if (handler.name === 'onRequest' || handler.name === 'preHandler') {
        server.use(async (req: Request, res: Response, next: NextFunction) => {
          try {
            const execute = handler.execute as unknown as (
              request: Request,
              reply: Response,
            ) => Promise<void>;
            attachRequestLogger(req, res);
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
    },

    registerProxy: (config: ProxyConfig): void => {
      const options: ProxyOptions = {
        target: config.upstream,
        changeOrigin: true,
        ...(config.rewritePrefix != null
          ? { pathRewrite: { [`^${config.prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`]: config.rewritePrefix } }
          : {}),
      };

      // http-proxy-middleware is an optional peer: load it only when a proxy is
      // configured, so apps without Express proxies never install it.
      const proxyReady: Promise<ProxyHandler> = import('http-proxy-middleware').then(
        ({ createProxyMiddleware }) => createProxyMiddleware(options),
      );
      proxyReady.catch((error: unknown) => {
        logger.error(
          `ExpressApiAdapter: proxy for '${config.prefix}' needs the optional peer ` +
            `'http-proxy-middleware' (npm install http-proxy-middleware).`,
          { data: { err: error instanceof Error ? error.message : String(error) } },
        );
      });

      server.use(config.prefix, (req: Request, res: Response, next: NextFunction) => {
        proxyReady.then((proxy) => proxy(req, res, next), next);
      });
    },

    listen: async (port: number): Promise<void> => {
      return new Promise((resolve, reject) => {
        httpServer = server
          .listen(port, '0.0.0.0', () => {
            resolve();
          })
          .on('error', reject);
      });
    },

    close: async (): Promise<void> => {
      if (httpServer == null) {
        return;
      }
      await new Promise<void>((resolve, reject) => {
        httpServer!.close((err) => (err != null ? reject(err) : resolve()));
      });
    },

    getRawServer: (): unknown => server,
  };
};
