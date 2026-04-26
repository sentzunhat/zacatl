import proxy from '@fastify/http-proxy';
import type { FastifyInstance } from 'fastify';

import type { ZodTypeProvider } from '@zacatl/third-party/fastify';

import type { RouteHandler } from '../../../../layers/application/entry-points/rest/fastify/handlers/route-handler';
import type { HookHandler } from '../../../../layers/application/entry-points/rest/hook-handlers/hook-handler';
import type { ApiServerPort, ProxyConfig } from '../../api/port';
import { normalizePrefix } from '../../shared/prefixes/normalize-prefix';

/**
 * Fastify implementation of ApiServerPort.
 */
export const createApiAdapter = (
  server: FastifyInstance,
  apiPrefix = '',
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
        handler: handler.execute.bind(handler),
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
