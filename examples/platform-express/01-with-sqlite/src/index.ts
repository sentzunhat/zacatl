/**
 * Express + SQLite (Sequelize)
 * Entry Point
 */

import "reflect-metadata";
import express from "express";
import { Sequelize } from "sequelize";
import { container } from "tsyringe";
import { Service } from "@sentzunhat/zacatl/service";
import {
  ServiceType,
  ServerType,
  ServerVendor,
  DatabaseVendor,
} from "@sentzunhat/zacatl";
import { initGreetingModel } from "./infrastructure/models/greeting.model";
import { GreetingRepositoryAdapter } from "./infrastructure/greetings/repositories/greeting/adapter";
import { GreetingServiceAdapter } from "./domain/greetings/service/adapter";
import { GetAllGreetingsHandler } from "./application/handlers/get-all-greetings.handler";
import { GetGreetingByIdHandler } from "./application/handlers/get-greeting-by-id.handler";
import { CreateGreetingHandler } from "./application/handlers/create-greeting.handler";
import { DeleteGreetingHandler } from "./application/handlers/delete-greeting.handler";
import { GetRandomGreetingHandler } from "./application/handlers/get-random-greeting.handler";

async function main() {
  console.log("🚀 Starting Express + SQLite (Sequelize) Example");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const app = express();
    app.use(express.json());

    const databaseUrl = process.env["DATABASE_URL"] || "sqlite:database.sqlite";
    const sequelize = new Sequelize({
      dialect: "sqlite",
      logging: false,
      storage: databaseUrl.replace("sqlite:", ""),
    });

    // ═══════════════════════════════════════════════════════════
    // DEPENDENCY INJECTION REGISTRATION
    // ═══════════════════════════════════════════════════════════

    // 1. Infrastructure Layer (Repositories)
    const greetingRepository = new GreetingRepositoryAdapter();
    container.registerInstance("GreetingRepository", greetingRepository);

    // 2. Domain Layer (Services)
    const greetingService = new GreetingServiceAdapter(greetingRepository);
    container.registerInstance("GreetingService", greetingService);
    container.registerInstance(GreetingServiceAdapter, greetingService);

    // 3. Application Layer (Handlers)
    container.registerSingleton(GetAllGreetingsHandler, GetAllGreetingsHandler);
    container.registerSingleton(GetGreetingByIdHandler, GetGreetingByIdHandler);
    container.registerSingleton(CreateGreetingHandler, CreateGreetingHandler);
    container.registerSingleton(DeleteGreetingHandler, DeleteGreetingHandler);
    container.registerSingleton(
      GetRandomGreetingHandler,
      GetRandomGreetingHandler,
    );

    // ═══════════════════════════════════════════════════════════
    // SERVICE CONFIGURATION
    // ═══════════════════════════════════════════════════════════

    const serviceConfig = {
      type: ServiceType.SERVER,
      platforms: {
        server: {
          name: "express-sqlite",
          port: 8181,
          server: {
            type: ServerType.SERVER,
            vendor: ServerVendor.EXPRESS,
            instance: app,
          },
          databases: [
            {
              vendor: DatabaseVendor.SEQUELIZE,
              instance: sequelize,
              connectionString: databaseUrl,
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
        application: {
          entryPoints: {
            rest: {
              hooks: [],
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
        domain: {
          providers: [],
        },
        infrastructure: {
          repositories: [],
        },
      },
    };

    // ═══════════════════════════════════════════════════════════
    // SERVICE INITIALIZATION
    // ═══════════════════════════════════════════════════════════

    const service = new Service(serviceConfig);
    const port = process.env["PORT"]
      ? parseInt(process.env["PORT"]!, 10)
      : 8083;
    await service.start({ port });

    console.log(`✓ Server running on http://localhost:${port}`);
    console.log("\n📚 Available endpoints:");
    console.log("  GET    /greetings            - Get all greetings");
    console.log("  GET    /greetings/random     - Get random greeting");
    console.log("  GET    /greetings/:id        - Get greeting by ID");
    console.log("  POST   /greetings            - Create new greeting");
    console.log("  DELETE /greetings/:id        - Delete greeting");
    console.log("\n💡 Try: curl http://localhost:8181/greetings");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Failed to start service:", error);
    process.exit(1);
  }
}

process.on("SIGINT", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n👋 Shutting down gracefully...");
  process.exit(0);
});

main();
