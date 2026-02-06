/**
 * Service Configuration - Fastify + SQLite (Sequelize)
 */

import type { FastifyInstance } from "fastify";
import type { Sequelize } from "sequelize";
import type {
  ApplicationRestRoutes,
  ConfigService,
} from "@sentzunhat/zacatl/service";
import {
  ServiceType,
  ServerType,
  ServerVendor,
  DatabaseVendor,
} from "@sentzunhat/zacatl";
import { GetAllGreetingsHandler } from "../application/handlers/get-all-greetings.handler";
import { GetGreetingByIdHandler } from "../application/handlers/get-greeting-by-id.handler";
import { CreateGreetingHandler } from "../application/handlers/create-greeting.handler";
import { DeleteGreetingHandler } from "../application/handlers/delete-greeting.handler";
import { GetRandomGreetingHandler } from "../application/handlers/get-random-greeting.handler";
import { initGreetingModel } from "../infrastructure/models/greeting.model";

type ConfigInput = {
  server: FastifyInstance;
  database: Sequelize;
  connectionString: string;
};

export const createServiceConfig = (input: ConfigInput): ConfigService => {
  const { server, database, connectionString } = input;
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
        name: "fastify-sqlite",
        server: {
          type: ServerType.SERVER,
          vendor: ServerVendor.FASTIFY,
          instance: server,
        },
        databases: [
          {
            vendor: DatabaseVendor.SEQUELIZE,
            instance: database,
            connectionString,
            onDatabaseConnected: async (db: unknown) => {
              const sequelize = db as Sequelize;
              initGreetingModel(sequelize);
              await sequelize.sync({ alter: true });
            },
          },
        ],
      },
    },

    layers: {
      application: {
        entryPoints: {
          rest: {
            hooks: [],
            routes,
          },
        },
      },
      domain: {
        providers: [],
      },
      infrastructure: {
        repositories: [],
      },
    },
  };
};
