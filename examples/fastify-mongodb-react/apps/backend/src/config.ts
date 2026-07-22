/**
 * Service Configuration
 * Simple, centralized configuration for the Fastify + MongoDB example
 */

import { existsSync } from 'node:fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { ServiceType } from '@sentzunhat/zacatl/service/service';
import type { HookHandler } from '@sentzunhat/zacatl/service/layers/application/entry-points/rest/hook-handlers/hook-handler';
import { DatabaseVendor } from '@sentzunhat/zacatl/service/platforms/server/database/port';
import {
  ServerType,
  ServerVendor,
} from '@sentzunhat/zacatl/service/platforms/server/types/server-config';
import type { FastifyInstance } from '@sentzunhat/zacatl/third-party/fastify';
import type { Mongoose } from 'mongoose';
import { repositories } from './infrastructure/greetings/repositories/repositories';
import { GreetingServiceAdapter } from './domain/greetings/service/adapter';
import { hookHandlers } from './application/hook-handlers/hooks';
import { GetAllGreetingsHandler } from './application/route-handlers/greetings/get-all/handler';
import { GetGreetingByIdHandler } from './application/route-handlers/greetings/get-by-id/handler';
import { CreateGreetingHandler } from './application/route-handlers/greetings/create/handler';
import { DeleteGreetingHandler } from './application/route-handlers/greetings/delete/handler';
import { UpdateGreetingHandler } from './application/route-handlers/greetings/update/handler';
import { GetRandomGreetingHandler } from './application/route-handlers/greetings/get-random/handler';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const resolveExampleRootDir = (): string => {
  const candidates = [join(__dirname, '..', '..', '..'), join(__dirname, '..', '..')];

  const found = candidates.find((dir) => {
    return existsSync(join(dir, 'apps', 'backend')) && existsSync(join(dir, 'apps', 'frontend'));
  });

  return found ?? join(__dirname, '..', '..', '..');
};

const exampleRootDir = resolveExampleRootDir();
const appsRootDir = join(exampleRootDir, 'apps');

const resolveBuiltInLocalesDir = (): string | undefined => {
  const candidates = [
    join(exampleRootDir, 'node_modules', '@sentzunhat', 'zacatl', 'src', 'localization', 'locales'),
    join(
      exampleRootDir,
      'node_modules',
      '@sentzunhat',
      'zacatl',
      'build-src-esm',
      'localization',
      'locales',
    ),
    join(
      exampleRootDir,
      'node_modules',
      '@sentzunhat',
      'zacatl',
      'build',
      'esm',
      'localization',
      'locales',
    ),
    join(exampleRootDir, '..', '..', 'src', 'localization', 'locales'),
  ];

  return candidates.find((dir) => existsSync(dir));
};

const builtInLocalesDir = resolveBuiltInLocalesDir();

export interface AppConfig {
  port: number;
  mongoUri: string;
}

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 8082),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/greetings-db',
};

export const API_PREFIX = '/api';

const shouldCreateIndexesOnBoot =
  process.env.APP_ENV === 'local' ||
  process.env.APP_ENV === 'development' ||
  process.env.NODE_ENV === 'test';

export const createServiceConfig = (fastify: FastifyInstance, mongoose: Mongoose) => {
  const routes = [
    GetAllGreetingsHandler,
    GetGreetingByIdHandler,
    CreateGreetingHandler,
    DeleteGreetingHandler,
    UpdateGreetingHandler,
    GetRandomGreetingHandler,
  ];
  const hooks = hookHandlers as Array<new () => HookHandler>;

  return {
    type: ServiceType.SERVER,
    localization: {
      builtInLocalesDir,
    },
    platforms: {
      server: {
        name: 'fastify-mongodb',
        port: config.port,
        server: {
          type: ServerType.SERVER,
          vendor: ServerVendor.FASTIFY,
          instance: fastify,
          prefixes: { api: API_PREFIX },
        },
        page: {
          staticDir: join(appsRootDir, 'frontend', 'dist'),
          // Content-hashed bundles cache long at the edge; index.html stays no-cache
          cache: { maxAge: '1y', immutable: true },
        },
        databases: [
          {
            vendor: DatabaseVendor.MONGOOSE,
            instance: mongoose,
            connection: { url: config.mongoUri },
            indexes: {
              bootMode: shouldCreateIndexesOnBoot ? 'create' : 'off',
            },
            onDatabaseConnected: async () => {},
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
            hooks,
            routes,
          },
        },
      },
    },
  };
};
