import proxy from '@fastify/http-proxy';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

import { logger as defaultLogger, type Logger } from '@zacatl/logs';
import type { ZodTypeProvider } from '@zacatl/third-party/fastify';

import type { RouteHandler } from '../../../../layers/application/entry-points/rest/fastify/handlers/route-handler';
import type { HookHandler } from '../../../../layers/application/entry-points/rest/hook-handlers/hook-handler';
import type { ApiServerPort, ProxyConfig } from '../../api/port';
import { normalizePrefix } from '../../shared/prefixes/normalize-prefix';

/**
 * Fastify implementation of ApiServerPort.
 */
// Plain fields only: adapters receive `data` as-is, where an Error instance
// would serialize to `{}`, and arbitrary error properties stay out of logs.
const describeError = (error: unknown): Record<string, unknown> =>
  error instanceof Error
    ? { type: error.name, message: error.message, stack: error.stack }
    : { message: String(error) };

export const createApiAdapter = (
  server: FastifyInstance,
  apiPrefix = '',
  logger: Logger = defaultLogger,
): ApiServerPort => {
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
      server.withTypeProvider<ZodTypeProvider>().route({
        url: getRouteUrl(handler.url),
        method: handler.method,
        schema: handler.schema,
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
          try {
            const result = await handler.execute(request, reply);

            // AbstractRouteHandler sends its own result. Handing that result back
            // to Fastify would send it twice (FST_ERR_REP_ALREADY_SENT), so return
            // the reply to mark the request handled. Handlers that leave sending
            // to Fastify still have their result sent as before.
            // eslint-disable-next-line @typescript-eslint/return-await
            return reply.sent ? reply : result;
          } catch (error) {
            if (!reply.sent) {
              throw error;
            }

            // The error response is already out; log once through the Service's
            // logger instead of letting Fastify log "Promise errored, but
            // reply.sent = true was set".
            const data = {
              reqId: request.id,
              method: request.method,
              url: request.url,
              statusCode: reply.statusCode,
              err: describeError(error),
            };
            if (reply.statusCode >= 500) {
              logger.error('Route handler failed', { data });
            } else {
              logger.info('Route handler rejected request', { data });
            }

            return reply;
          }
        },
      });
    },

    registerHook: (handler: HookHandler): void => {
      server.addHook(handler.name, handler.execute.bind(handler));
    },

    registerProxy: (config: ProxyConfig): void => {
      server.register(proxy, {
        upstream: config.upstream,
        prefix: config.prefix,
        ...(config.rewritePrefix != null ? { rewritePrefix: config.rewritePrefix } : {}),
        ...(config.http2 !== undefined ? { http2: config.http2 } : {}),
      });
    },

    listen: async (port: number): Promise<void> => {
      await server.listen({ port, host: '0.0.0.0' });
    },

    close: async (): Promise<void> => {
      await server.close();
    },

    getRawServer: (): unknown => server,
  };
};
