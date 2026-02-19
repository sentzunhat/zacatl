/**
 * Express + MongoDB (Mongoose)
 * Entry Point
 */

import "@sentzunhat/zacatl/third-party/reflect-metadata";
import { express } from "@sentzunhat/zacatl/third-party/express";
import { mongoose } from "@sentzunhat/zacatl/third-party/mongoose";
import { Service } from "@sentzunhat/zacatl/service";
import { config, createServiceConfig } from "./config";

async function main() {
  console.log("🚀 Starting Express + MongoDB (Mongoose) Example");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    // Initialize Express
    const app = express();

    // Parse JSON request bodies
    app.use(express.json());

    // Initialize MongoDB connection and create service
    const serviceConfig = createServiceConfig(app, mongoose);
    const service = new Service(serviceConfig);

    await service.start({ port: config.port });

    // Centralized error handler (real-world pattern) - MUST be after routes
    app.use(
      (
        err: Error & { statusCode?: number },
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
      ) => {
        const statusCode = err.statusCode || 500;

        // Log error for debugging
        console.error(`[${req.method}] ${req.url}:`, err.message);

        // Send clean error response
        res.status(statusCode).json({
          error: {
            message: err.message || "Internal Server Error",
            statusCode,
          },
        });
      },
    );

    console.log(`✓ Server running on http://localhost:${config.port}`);
    console.log("\n📚 Available endpoints:");
    console.log("  GET    /greetings              - Get all greetings");
    console.log("  GET    /greetings/:id          - Get greeting by ID");
    console.log(
      "  GET    /greetings/random/:lang - Get random greeting by language",
    );
    console.log("  POST   /greetings              - Create new greeting");
    console.log("  DELETE /greetings/:id          - Delete greeting");
    console.log(`\n💡 Try: curl http://localhost:${config.port}/greetings`);
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
