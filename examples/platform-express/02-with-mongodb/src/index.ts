/**
 * Express + MongoDB (Mongoose)
 * Entry Point
 */

import "reflect-metadata";
import express from "express";
import mongoose from "mongoose";
import { container } from "tsyringe";
import { Service } from "@sentzunhat/zacatl/service";
import {
  ServiceType,
  ServerType,
  ServerVendor,
  DatabaseVendor,
} from "@sentzunhat/zacatl";
import { MongooseGreetingRepository } from "./infrastructure/repositories/greeting.repository";
import { GreetingService } from "./domain/services/greeting.service";
import { GetAllGreetingsHandler } from "./application/handlers/get-all-greetings.handler";
import { GetGreetingByIdHandler } from "./application/handlers/get-greeting-by-id.handler";
import { CreateGreetingHandler } from "./application/handlers/create-greeting.handler";
import { DeleteGreetingHandler } from "./application/handlers/delete-greeting.handler";
import { GetRandomGreetingHandler } from "./application/handlers/get-random-greeting.handler";

async function main() {
  console.log("🚀 Starting Express + MongoDB (Mongoose) Example");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const app = express();
    app.use(express.json());

    const mongoUri =
      process.env["MONGODB_URI"] ||
      "mongodb://localhost:27017/zacatl-express-02";

    // ═══════════════════════════════════════════════════════════
    // DEPENDENCY INJECTION REGISTRATION
    // ═══════════════════════════════════════════════════════════

    // 1. Infrastructure Layer (Repositories)
    const greetingRepository = new MongooseGreetingRepository();
    container.registerInstance("GreetingRepository", greetingRepository);

    // 2. Domain Layer (Services)
    const greetingService = new GreetingService(greetingRepository);
    container.registerInstance("GreetingService", greetingService);
    container.registerInstance(GreetingService, greetingService);

    // 3. Application Layer (Handlers)
    container.registerSingleton(GetAllGreetingsHandler, GetAllGreetingsHandler);
    container.registerSingleton(GetGreetingByIdHandler, GetGreetingByIdHandler);
    container.registerSingleton(CreateGreetingHandler, CreateGreetingHandler);
    container.registerSingleton(DeleteGreetingHandler, DeleteGreetingHandler);
    container.registerSingleton(
      GetRandomGreetingHandler,
      GetRandomGreetingHandler,
    );

    const serviceConfig = {
      type: ServiceType.SERVER,
      platforms: {
        server: {
          name: "express-mongodb",
          port: 8182,
          server: {
            type: ServerType.SERVER,
            vendor: ServerVendor.EXPRESS,
            instance: app,
          },
          databases: [
            {
              vendor: DatabaseVendor.MONGOOSE,
              instance: mongoose,
              connectionString: mongoUri,
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

    const service = new Service(serviceConfig);
    const port = process.env["PORT"]
      ? parseInt(process.env["PORT"]!, 10)
      : 8084;
    await service.start({ port });

    console.log(`✓ Server running on http://localhost:${port}`);
    console.log("\n📚 Available endpoints:");
    console.log("  GET    /greetings              - Get all greetings");
    console.log("  GET    /greetings/:id          - Get greeting by ID");
    console.log(
      "  GET    /greetings/random/:lang - Get random greeting by language",
    );
    console.log("  POST   /greetings              - Create new greeting");
    console.log("  DELETE /greetings/:id          - Delete greeting");
    console.log("\n💡 Try: curl http://localhost:8182/greetings");
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
