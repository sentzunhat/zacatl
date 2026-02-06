/**
 * Fastify + MongoDB (Mongoose)
 * Entry Point
 */

import "reflect-metadata";
import "./di";
import { Fastify } from "@sentzunhat/zacatl/third-party/fastify";
import mongoose from "mongoose";
import { Service } from "@sentzunhat/zacatl/service";
import { config, createServiceConfig } from "./config";

async function main() {
  console.log("🚀 Starting Fastify + MongoDB (Mongoose) Example");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  try {
    const fastify = Fastify({ logger: false });
    const serviceConfig = createServiceConfig(fastify, mongoose);
    const service = new Service(serviceConfig);

    await service.start({ port: config.port });

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
