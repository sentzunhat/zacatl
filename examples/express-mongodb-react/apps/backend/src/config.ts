/**
 * Service Configuration
 * Simple, centralized configuration for the Express + MongoDB example
 */

import type { Application } from '@sentzunhat/zacatl/third-party/express';
import type { Mongoose } from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { ServiceType } from '@sentzunhat/zacatl/service/service';
import { DatabaseVendor } from '@sentzunhat/zacatl/service/platforms/server/database/port';
import { ServerType, ServerVendor } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';
import type { ApplicationRestRoutes } from '@sentzunhat/zacatl/service/layers/application/types';
import { repositories } from './infrastructure/greetings/repositories/repositories';
import { GreetingServiceAdapter } from './domain/greetings/service/adapter';
import { GetAllGreetingsHandler } from './application/route-handlers/greetings/get-all/handler';
import { GetGreetingByIdHandler } from './application/route-handlers/greetings/get-by-id/handler';
import { CreateGreetingHandler } from './application/route-handlers/greetings/create/handler';
import { DeleteGreetingHandler } from './application/route-handlers/greetings/delete/handler';
import { GetRandomGreetingHandler } from './application/route-handlers/greetings/get-random/handler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..', '..', '..');

export interface AppConfig {
  port: number;
  mongoUri: string;
}

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 8182),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://local:local@localhost:27017/appdb',
};

export const API_PREFIX = '/api';

export function createServiceConfig(app: Application, mongoose: Mongoose) {
  const routes = [
    GetAllGreetingsHandler,
    GetGreetingByIdHandler,
    CreateGreetingHandler,
    DeleteGreetingHandler,
    GetRandomGreetingHandler,
  ] as unknown as ApplicationRestRoutes;

  return {
    type: ServiceType.SERVER,
    platforms: {
      server: {
        name: 'express-mongodb',
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
            vendor: DatabaseVendor.MONGOOSE,
            instance: mongoose,
            connectionString: config.mongoUri,
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
            routes,
          },
        },
      },
    },
  };
}
