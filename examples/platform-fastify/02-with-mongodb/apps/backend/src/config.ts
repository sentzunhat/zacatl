/**
 * Service Configuration
 * Simple, centralized configuration for the Fastify + MongoDB example
 */

import type { FastifyInstance } from "@sentzunhat/zacatl/third-party/fastify";
import type { Mongoose } from "mongoose";
import {
  ServiceType,
  ServerType,
  ServerVendor,
  DatabaseVendor,
} from "@sentzunhat/zacatl";
import type { ApplicationRestRoutes } from "@sentzunhat/zacatl/service";
import { repositories } from "./infrastructure/greetings/repositories/repositories";
import { GreetingServiceAdapter } from "./domain/greetings/service";
import { GetAllGreetingsHandler } from "./application/handlers/greetings/get-all/handler";
import { GetGreetingByIdHandler } from "./application/handlers/greetings/get-by-id/handler";
import { CreateGreetingHandler } from "./application/handlers/greetings/create/handler";
import { DeleteGreetingHandler } from "./application/handlers/greetings/delete/handler";
import { GetRandomGreetingHandler } from "./application/handlers/greetings/get-random/handler";

export interface AppConfig {
  port: number;
  mongoUri: string;
}

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 8082),
  mongoUri:
    process.env.MONGO_URI ?? "mongodb://local:local@localhost:27017/appdb",
};

export function createServiceConfig(
  fastify: FastifyInstance,
  mongoose: Mongoose,
) {
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
        port: config.port,
        server: {
          type: ServerType.SERVER,
          vendor: ServerVendor.FASTIFY,
          instance: fastify,
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
