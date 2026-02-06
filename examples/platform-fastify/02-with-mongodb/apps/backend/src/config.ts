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
import { GreetingRepositoryAdapter } from "./infrastructure/repositories/greeting.repository";
import { GreetingService } from "./domain/services/greeting.service";
import { GetAllGreetingsHandler } from "./application/handlers/get-all-greetings.handler";
import { GetGreetingByIdHandler } from "./application/handlers/get-greeting-by-id.handler";
import { CreateGreetingHandler } from "./application/handlers/create-greeting.handler";
import { DeleteGreetingHandler } from "./application/handlers/delete-greeting.handler";
import { GetRandomGreetingHandler } from "./application/handlers/get-random-greeting.handler";

export interface AppConfig {
  port: number;
  mongoUri: string;
}

export const config: AppConfig = {
  port: Number(process.env.PORT ?? 3002),
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
        repositories: [GreetingRepositoryAdapter],
      },
      domain: {
        services: [GreetingService],
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
