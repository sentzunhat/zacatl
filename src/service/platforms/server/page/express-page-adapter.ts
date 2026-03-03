import type { Express } from 'express';
import express from 'express';

import type { PageServerPort, StaticConfig } from './port';

export class ExpressPageAdapter implements PageServerPort {
  constructor(private readonly server: Express) {}

  registerStaticFiles(config: StaticConfig): void {
    this.server.use(config.prefix ?? '/', express.static(config.root));
  }

  registerSpaFallback(apiPrefix: string, staticDir: string): void {
    this.server.use((req, res, _next) => {
      if (req.path.startsWith(apiPrefix)) {
        res.status(404).json({
          code: 404,
          error: 'Not Found',
          message: `Route ${req.method}:${req.path} not found`,
        });
      } else {
        res.sendFile('index.html', { root: staticDir });
      }
    });
  }

  async register(): Promise<void> {
    // Custom registration logic if needed
  }
}
