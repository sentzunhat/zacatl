/**
 * Service Configuration - Fastify + MongoDB (Mongoose)
 */

import type { FastifyInstance } from "@sentzunhat/zacatl/third-party/fastify";
import type { Mongoose } from "mongoose";
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

type ConfigInput = {
  server: FastifyInstance;
  database: Mongoose;
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
        name: "fastify-mongodb",
        server: {
          type: ServerType.SERVER,
          vendor: ServerVendor.FASTIFY,
          instance: server,
        },
        databases: [
          {
            vendor: DatabaseVendor.MONGOOSE,
            instance: database,
            connectionString,
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
