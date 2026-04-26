import type { Express } from 'express';
import express from 'express';

import type { ApiPrefixes, PageServerPort, StaticConfig } from '../../page/port';
import { isUnderPrefix } from '../../shared/prefixes/is-under-prefix';

/**
 * Express implementation of PageServerPort.
 */
export const createPageAdapter = (server: Express): PageServerPort => ({
  registerStaticFiles: (config: StaticConfig): void => {
    server.use(config.prefix ?? '/', express.static(config.root));
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
        res.sendFile('index.html', { root: staticDir });
      }
    });
  },

  register: async (): Promise<void> => {
    // Custom registration logic if needed
  },
});
