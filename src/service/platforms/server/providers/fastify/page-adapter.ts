import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';

import type { ApiPrefixes, PageServerPort, StaticConfig } from '../../page/port';
import { isUnderPrefix } from '../../shared/prefixes/is-under-prefix';

/**
 * Fastify implementation of PageServerPort.
 */
export const createPageAdapter = (server: FastifyInstance): PageServerPort => ({
  registerStaticFiles: (config: StaticConfig): void => {
    server.register(fastifyStatic, {
      root: config.root,
      ...(config.prefix != null ? { prefix: config.prefix } : {}),
    });
  },

  registerSpaFallback: (prefixes: ApiPrefixes, staticDir: string): void => {
    const prefixValues = Object.values(prefixes);

    server.setNotFoundHandler(async (request, reply) => {
      const url = request.raw.url ?? '';

      if (prefixValues.some((p) => isUnderPrefix(url, p))) {
        reply.status(404).send({
          code: 404,
          error: 'Not Found',
          message: `Route ${request.method}:${request.url} not found`,
        });
      } else if (url.startsWith('/assets/')) {
        reply.sendFile(url.slice(1), staticDir);
      } else {
        reply.type('text/html; charset=utf-8');
        reply.sendFile('index.html', staticDir);
      }
    });
  },

  register: async (): Promise<void> => {
    // Custom registration logic if needed
  },
});
