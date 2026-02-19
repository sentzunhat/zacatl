/**
 * Service Configuration
 * Simple, centralized configuration for the Fastify + SQLite example
 */

import type { FastifyInstance } from "@sentzunhat/zacatl/third-party/fastify";
import type { Sequelize } from "sequelize";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import {
  ServiceType,
  ServerType,
  ServerVendor,
  DatabaseVendor,
} from "@sentzunhat/zacatl";
import { GetAllGreetingsHandler } from "./application/handlers/greetings/get-all/handler";
import { GetGreetingByIdHandler } from "./application/handlers/greetings/get-by-id/handler";
import { CreateGreetingHandler } from "./application/handlers/greetings/create/handler";
import { DeleteGreetingHandler } from "./application/handlers/greetings/delete/handler";
import { GetRandomGreetingHandler } from "./application/handlers/greetings/get-random/handler";
import { initGreetingModel } from "./infrastructure/greetings/models/greeting.model";
import { repositories } from "./infrastructure/greetings/repositories/repositories";
import { GreetingServiceAdapter } from "./domain/greetings/service";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..", "..", "..");

export interface AppConfig {
  port: number;
  databaseUrl: string;
}

export const config: AppConfig = {
  port: parseInt(process.env["PORT"] || "8081", 10),
  databaseUrl: process.env["DATABASE_URL"] || "sqlite:database.sqlite",
};

export function createServiceConfig(
  fastify: FastifyInstance,
  sequelize: Sequelize,
) {
  return {
    type: ServiceType.SERVER,
    platforms: {
      server: {
        name: "fastify-sqlite",
        port: config.port,
        server: {
          type: ServerType.SERVER,
          vendor: ServerVendor.FASTIFY,
          instance: fastify,
        },
        page: {
          staticDir: join(rootDir, "apps/frontend/dist"),
          apiPrefix: "/greetings",
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
}
