/**
 * Service Configuration
 * Simple, centralized configuration for the Fastify + SQLite example
 */

import type { FastifyInstance } from '@sentzunhat/zacatl/third-party/fastify';
import type { Sequelize } from '@sentzunhat/zacatl/third-party/databases/sequelize';
import { fileURLToPath } from 'url';
import { existsSync } from 'node:fs';
import { dirname, join } from 'path';
import { ServiceType } from '@sentzunhat/zacatl/service';
import { DatabaseVendor } from '@sentzunhat/zacatl/service/platforms/server/database/port';
import { ServerType, ServerVendor } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';
import { GetAllGreetingsHandler } from './application/route-handlers/greetings/get-all/handler';
import { GetGreetingByIdHandler } from './application/route-handlers/greetings/get-by-id/handler';
import { CreateGreetingHandler } from './application/route-handlers/greetings/create/handler';
import { DeleteGreetingHandler } from './application/route-handlers/greetings/delete/handler';
import { GetRandomGreetingHandler } from './application/route-handlers/greetings/get-random/handler';
import { hookHandlers } from './application/hook-handlers/hooks';
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

  const found = candidates.find((dir) =>
    existsSync(join(dir, 'apps', 'backend')) && existsSync(join(dir, 'apps', 'frontend')),
  );

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

export const API_PREFIX = '/api';

export const createServiceConfig = (fastify: FastifyInstance, sequelize: Sequelize) => {
  return {
    type: ServiceType.SERVER,
    localization: {
      locales: {
        default: 'en',
        supported: ['en', 'es'],
        directories: [join(rootDir, 'apps', 'backend', 'locales')],
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
          prefixes: { api: API_PREFIX },
        },
        page: {
          staticDir: join(rootDir, 'apps', 'frontend', 'dist'),
        },
        databases: [
          {
            vendor: DatabaseVendor.SEQUELIZE,
            instance: sequelize,
            connectionString: config.databaseUrl,
            onDatabaseConnected: async (db: unknown) => {
              const sequelizeDb = db as Sequelize;
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
