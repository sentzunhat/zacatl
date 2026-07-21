import type { Express } from 'express';
import express from 'express';

import type { ApiPrefixes, PageServerPort, StaticConfig } from '../../page/port';
import { isUnderPrefix } from '../../shared/prefixes/is-under-prefix';

/**
 * Express implementation of PageServerPort.
 */
export const createPageAdapter = (server: Express): PageServerPort => ({
  registerStaticFiles: (config: StaticConfig): void => {
    server.use(
      config.prefix ?? '/',
      express.static(config.root, {
        ...(config.cache?.maxAge != null ? { maxAge: config.cache.maxAge } : {}),
        ...(config.cache?.immutable != null ? { immutable: config.cache.immutable } : {}),
        // Content-hashed assets can cache long, but the HTML shell must
        // revalidate so deploys propagate immediately (CDNs respect this).
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      }),
    );
  },

  registerSpaFallback: (prefixes: ApiPrefixes, staticDir: string): void => {
    const prefixValues = Object.values(prefixes);

    server.use((req, res, _next) => {
      if (prefixValues.some((p) => isUnderPrefix(req.path, p))) {
        res.status(404).json({
          code: 404,
          error: 'Not Found',
          message: `Route ${req.method}:${req.path} not found`,
        });
      } else {
        res.setHeader('Cache-Control', 'no-cache');
        res.sendFile('index.html', { root: staticDir });
      }
    });
  },

  register: async (): Promise<void> => {
    // Custom registration logic if needed
  },
});
