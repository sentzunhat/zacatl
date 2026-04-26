/**
 * Service Configuration
 * Simple, centralized configuration for the Fastify + SQLite example
 */

import type { FastifyInstance } from '@sentzunhat/zacatl/third-party/fastify';
import type { Sequelize } from '@sentzunhat/zacatl/third-party/sequelize';
import { fileURLToPath } from 'url';
import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { dirname, extname, join } from 'path';
import { ServiceType, ServerType, ServerVendor, DatabaseVendor } from '@sentzunhat/zacatl/service';
import {
  GetAllGreetingsHandler,
  GetGreetingByIdHandler,
  CreateGreetingHandler,
  DeleteGreetingHandler,
  GetRandomGreetingHandler,
} from './application/route-handlers/greetings';
import { hookHandlers } from './application/hook-handlers';
import { initGreetingModel } from './infrastructure/greetings/models/greeting.model';
import { repositories } from './infrastructure/greetings/repositories/repositories';
import { GreetingServiceAdapter } from './domain/greetings/service';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resolveExampleRootDir = (): string => {
  const candidates = [
    join(__dirname, '..', '..', '..'),
    join(__dirname, '..', '..'),
    join(__dirname, '..'),
  ];

  const found = candidates.find((dir) => {
    const hasAppsLayout =
      existsSync(join(dir, 'apps', 'backend')) && existsSync(join(dir, 'apps', 'frontend'));
    const hasLegacyLayout = existsSync(join(dir, 'backend')) && existsSync(join(dir, 'frontend'));

    return hasAppsLayout || hasLegacyLayout;
  });

  return found ?? join(__dirname, '..', '..', '..');
};

const rootDir = resolveExampleRootDir();

export interface AppConfig {
  port: number;
  databaseUrl: string;
}

export const config: AppConfig = {
  port: parseInt(process.env['PORT'] || '8081', 10),
  databaseUrl: process.env['DATABASE_URL'] || `sqlite:${join(rootDir, 'database.sqlite')}`,
};

const MIME_BY_EXT: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
};

export const API_PREFIX = '/api';

const resolveFaviconPath = async (frontendDistDir: string): Promise<string> => {
  const stablePath = join(frontendDistDir, 'favicon.svg');
  if (existsSync(stablePath)) {
    return stablePath;
  }

  const assetsDir = join(frontendDistDir, 'assets');
  const assetFiles = await readdir(assetsDir);
  const hashedFavicon = assetFiles.find((name) => /^favicon-.*\.svg$/i.test(name));

  if (hashedFavicon != null) {
    return join(assetsDir, hashedFavicon);
  }

  throw new Error('Missing favicon in frontend dist output');
};

/**
 * Register static frontend routes at the root level
 * These are served directly and not prefixed with /api
 */
export const registerFrontendRoutes = async (fastify: FastifyInstance): Promise<void> => {
  const frontendDistDir = existsSync(join(rootDir, 'apps', 'frontend', 'dist'))
    ? join(rootDir, 'apps', 'frontend', 'dist')
    : join(rootDir, 'frontend', 'dist');
  const faviconPath = await resolveFaviconPath(frontendDistDir);

  fastify.get('/', async (_request, reply) => {
    const html = await readFile(join(frontendDistDir, 'index.html'), 'utf-8');
    await reply.type(MIME_BY_EXT['.html']).send(html);
  });

  fastify.get('/favicon.svg', async (_request, reply) => {
    const content = await readFile(faviconPath);
    await reply.type(MIME_BY_EXT['.svg']).send(content);
  });

  fastify.get('/assets/*', async (request, reply) => {
    const assetPath = (request.params as { '*': string })['*'];
    const fullPath = join(frontendDistDir, 'assets', assetPath);
    const content = await readFile(fullPath);
    const contentType = MIME_BY_EXT[extname(fullPath)] ?? 'application/octet-stream';

    await reply.type(contentType).send(content);
  });
};

/**
 * Create service config for REST API routes
 * Routes are registered with a global API prefix from server config
 */
export const createServiceConfig = (fastify: FastifyInstance, sequelize: Sequelize) => {
  return {
    type: ServiceType.SERVER,
    localization: {
      locales: {
        default: 'en',
        supported: ['en', 'es'],
        directories: [
          existsSync(join(rootDir, 'apps', 'backend', 'locales'))
            ? join(rootDir, 'apps', 'backend', 'locales')
            : join(rootDir, 'backend', 'locales'),
        ],
      },
    },
    platforms: {
      server: {
        name: 'fastify-sqlite',
        port: config.port,
        server: {
          type: ServerType.SERVER,
          vendor: ServerVendor.FASTIFY,
          instance: fastify,
          apiPrefix: API_PREFIX,
        },
        databases: [
          {
            vendor: DatabaseVendor.SEQUELIZE,
            instance: sequelize,
            connectionString: config.databaseUrl,
            onDatabaseConnected: async (db: unknown) => {
              const sequelizeDb = db as Sequelize;
              initGreetingModel(sequelizeDb);
              await sequelizeDb.sync({ alter: true });
            },
          },
        ],
      },
    },
    layers: {
      infrastructure: {
        repositories,
      },
      domain: {
        services: [GreetingServiceAdapter],
      },
      application: {
        entryPoints: {
          rest: {
            hooks: hookHandlers,
            routes: [
              GetAllGreetingsHandler,
              GetGreetingByIdHandler,
              CreateGreetingHandler,
              DeleteGreetingHandler,
              GetRandomGreetingHandler,
            ],
          },
        },
      },
    },
  };
};
