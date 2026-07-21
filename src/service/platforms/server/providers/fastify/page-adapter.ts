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
      ...(config.cache?.maxAge != null ? { maxAge: config.cache.maxAge } : {}),
      ...(config.cache?.immutable != null ? { immutable: config.cache.immutable } : {}),
      // Content-hashed assets can cache long, but the HTML shell must
      // revalidate so deploys propagate immediately (CDNs respect this).
      // @fastify/static v10 passes the Fastify Reply here (`.header()`);
      // earlier majors passed the raw ServerResponse (`.setHeader()`).
      setHeaders: (res, filePath) => {
        if (filePath.endsWith('.html')) {
          const setter = res as {
            header?: (key: string, value: string) => unknown;
            setHeader?: (key: string, value: string) => void;
          };
          if (typeof setter.header === 'function') setter.header('Cache-Control', 'no-cache');
          else setter.setHeader?.('Cache-Control', 'no-cache');
        }
      },
    });
  },

  registerSpaFallback: (prefixes: ApiPrefixes, staticDir: string): void => {
    const prefixValues = Object.values(prefixes);

    server.setNotFoundHandler(async (request, reply) => {
      const rawUrl = request.raw.url ?? '';
      // Strip query string so that e.g. /assets/app.js?v=1 resolves to app.js,
      // not a filename containing the literal query string.
      const url = new URL(rawUrl, 'http://x').pathname;

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
        reply.header('Cache-Control', 'no-cache');
        reply.sendFile('index.html', staticDir);
      }
    });
  },

  register: async (): Promise<void> => {
    // Custom registration logic if needed
  },
});
