/**
 * Service Configuration
 * Simple, centralized configuration for the Fastify + SQLite example
 */

import type { FastifyInstance } from '@sentzunhat/zacatl/third-party/fastify';
import type { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ServiceType } from '@sentzunhat/zacatl/service/service';
import { DatabaseVendor } from '@sentzunhat/zacatl/service/platforms/server/database/port';
import { ServerType, ServerVendor } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';
import { GetAllGreetingsHandler } from './application/route-handlers/greetings/get-all/handler';
import { GetGreetingByIdHandler } from './application/route-handlers/greetings/get-by-id/handler';
import { CreateGreetingHandler } from './application/route-handlers/greetings/create/handler';
import { DeleteGreetingHandler } from './application/route-handlers/greetings/delete/handler';
import { UpdateGreetingHandler } from './application/route-handlers/greetings/update/handler';
import { GetRandomGreetingHandler } from './application/route-handlers/greetings/get-random/handler';
import { repositories } from './infrastructure/greetings/repositories/repositories';
import { GreetingServiceAdapter } from './domain/greetings/service/adapter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..', '..');

export interface AppConfig {
  port: number;
  databaseUrl: string;
}

export const config: AppConfig = {
  port: parseInt(process.env['PORT'] || '8081', 10),
  databaseUrl: process.env['DATABASE_URL'] || 'sqlite:database.sqlite',
};

export const API_PREFIX = '/api';

export function createServiceConfig(fastify: FastifyInstance, sequelize: Sequelize) {
  return {
    type: ServiceType.SERVER,
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
          staticDir: join(rootDir, 'apps/frontend/dist'),
          // Content-hashed bundles cache long at the edge; index.html stays no-cache
          cache: { maxAge: '1y', immutable: true },
        },
        databases: [
          {
            vendor: DatabaseVendor.SEQUELIZE,
            instance: sequelize,
            connection: { url: config.databaseUrl },
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
            routes: [
              GetAllGreetingsHandler,
              GetGreetingByIdHandler,
              CreateGreetingHandler,
              DeleteGreetingHandler,
              UpdateGreetingHandler,
              GetRandomGreetingHandler,
            ],
          },
        },
      },
    },
  };
}
