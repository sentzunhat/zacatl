/**
 * Service Configuration
 * Simple, centralized configuration for the Express + SQLite example
 */

import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type { Sequelize } from 'sequelize';
import type { ApplicationRestRoutes } from '@sentzunhat/zacatl/service/layers/application/types';
import { ServiceType } from '@sentzunhat/zacatl/service/service';
import { DatabaseVendor } from '@sentzunhat/zacatl/service/platforms/server/database/port';
import { ServerType, ServerVendor } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';
import type { Application } from '@sentzunhat/zacatl/third-party/express';
import { GetAllGreetingsHandler } from './application/route-handlers/greetings/get-all/handler';
import { GetGreetingByIdHandler } from './application/route-handlers/greetings/get-by-id/handler';
import { CreateGreetingHandler } from './application/route-handlers/greetings/create/handler';
import { DeleteGreetingHandler } from './application/route-handlers/greetings/delete/handler';
import { GetRandomGreetingHandler } from './application/route-handlers/greetings/get-random/handler';
import { initGreetingModel } from './infrastructure/greetings/models/greeting.model';
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
  port: parseInt(process.env['PORT'] || '8181', 10),
  databaseUrl: process.env['DATABASE_URL'] || 'sqlite:database.sqlite',
};

export const API_PREFIX = '/api';

export const createServiceConfig = (app: Application, sequelize: Sequelize) => {
  initGreetingModel(sequelize);

  return {
    type: ServiceType.SERVER,
    platforms: {
      server: {
        name: 'express-sqlite',
        port: config.port,
        server: {
          type: ServerType.SERVER,
          vendor: ServerVendor.EXPRESS,
          instance: app,
          prefixes: { api: API_PREFIX },
        },
        page: {
          staticDir: join(rootDir, 'apps/frontend/dist'),
        },
        databases: [
          {
            vendor: DatabaseVendor.SEQUELIZE,
            instance: sequelize,
            connectionString: config.databaseUrl,
            onDatabaseConnected: async () => {
              await sequelize.sync({ alter: true });
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
              GetRandomGreetingHandler,
            ] as unknown as ApplicationRestRoutes,
          },
        },
      },
    },
  };
};
