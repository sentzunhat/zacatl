/**
 * Service Configuration
 * Simple, centralized configuration for the Fastify + MongoDB example
 */

import type { FastifyInstance } from '@sentzunhat/zacatl/third-party/fastify';
import type { Mongoose } from 'mongoose';
import { fileURLToPath } from 'url';
import { existsSync } from 'node:fs';
import { dirname, join } from 'path';
import { ServiceType, ServerType, ServerVendor, DatabaseVendor } from '@sentzunhat/zacatl';
import { resolveDependency } from '@sentzunhat/zacatl/dependency-injection';
import type { ApplicationRestRoutes, HookHandler } from '@sentzunhat/zacatl/service';
import { repositories } from './infrastructure/greetings/repositories/repositories';
import { GreetingRepositoryAdapter } from './infrastructure/greetings/repositories/greeting/adapter';
import { GreetingServiceAdapter } from './domain/greetings/service';
import { hookHandlers } from './application/hook-handlers';
import { GetAllGreetingsHandler } from './application/route-handlers/greetings/get-all/handler';
import { GetGreetingByIdHandler } from './application/route-handlers/greetings/get-by-id/handler';
import { CreateGreetingHandler } from './application/route-handlers/greetings/create/handler';
import { DeleteGreetingHandler } from './application/route-handlers/greetings/delete/handler';
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

type InitializableGreetingRepository = GreetingRepositoryAdapter & {
  initializeModel: () => Promise<void>;
};

export interface AppConfig {
  port: number;
  mongoUri: string;
}

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 8082),
  mongoUri: process.env.MONGO_URI ?? 'mongodb://localhost:27017/greetings-db',
};

export const API_PREFIX = '/api';

export const createServiceConfig = (fastify: FastifyInstance, mongoose: Mongoose) => {
  const routes = [
    GetAllGreetingsHandler,
    GetGreetingByIdHandler,
    CreateGreetingHandler,
    DeleteGreetingHandler,
    GetRandomGreetingHandler,
  ] as unknown as ApplicationRestRoutes;
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
          apiPrefix: API_PREFIX,
        },
        page: {
          staticDir: join(appsRootDir, 'frontend', 'dist'),
        },
        databases: [
          {
            vendor: DatabaseVendor.MONGOOSE,
            instance: mongoose,
            connectionString: config.mongoUri,
            onDatabaseConnected: async () => {
              const greetingRepository = resolveDependency(
                GreetingRepositoryAdapter,
              ) as InitializableGreetingRepository;
              await greetingRepository.initializeModel();
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
            hooks,
            routes,
          },
        },
      },
    },
  };
};
