/**
 * Service Configuration
 * Simple, centralized configuration for the Fastify + SQLite example
 */

import type { FastifyInstance } from "fastify";
import type { Sequelize } from "sequelize";
import {
  ServiceType,
  ServerType,
  ServerVendor,
  DatabaseVendor,
} from "@sentzunhat/zacatl";
import { GetAllGreetingsHandler } from "./application/handlers/get-all-greetings.handler";
import { GetGreetingByIdHandler } from "./application/handlers/get-greeting-by-id.handler";
import { CreateGreetingHandler } from "./application/handlers/create-greeting.handler";
import { DeleteGreetingHandler } from "./application/handlers/delete-greeting.handler";
import { GetRandomGreetingHandler } from "./application/handlers/get-random-greeting.handler";
import { initGreetingModel } from "./infrastructure/models/greeting.model";
import { GreetingRepositoryAdapter } from "./infrastructure/repositories/greeting.repository";
import { GreetingService } from "./domain/services/greeting.service";

export interface AppConfig {
  port: number;
  databaseUrl: string;
}

export const config: AppConfig = {
  port: parseInt(process.env["PORT"] || "3001", 10),
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
        repositories: [GreetingRepositoryAdapter],
      },
      domain: {
        services: [GreetingService],
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
