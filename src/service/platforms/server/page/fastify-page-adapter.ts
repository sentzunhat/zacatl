import fastifyStatic from '@fastify/static';
import type { FastifyInstance } from 'fastify';

import type { PageServerPort, StaticConfig } from './port';

export class FastifyPageAdapter implements PageServerPort {
  constructor(private readonly server: FastifyInstance) {}

  registerStaticFiles(config: StaticConfig): void {
    this.server.register(fastifyStatic, {
      root: config.root,
      ...(config.prefix != null ? { prefix: config.prefix } : {}),
    });
  }

  registerSpaFallback(apiPrefix: string, staticDir: string): void {
    this.server.setNotFoundHandler(async (request, reply) => {
      if (request.raw.url != null && request.raw.url.startsWith(apiPrefix)) {
        reply.status(404).send({
          code: 404,
          error: 'Not Found',
          message: `Route ${request.method}:${request.url} not found`,
        });
      } else {
        reply.sendFile('index.html', staticDir);
      }
    });
  }

  async register(): Promise<void> {
    // Custom registration logic if needed
  }
}
