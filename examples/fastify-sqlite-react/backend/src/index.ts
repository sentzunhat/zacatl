/**
 * Fastify + SQLite (Sequelize)
 * Entry Point
 */

import '@sentzunhat/zacatl/third-party/reflect-metadata';
import {
  Fastify,
  serializerCompiler,
  validatorCompiler,
} from '@sentzunhat/zacatl/third-party/fastify';
import { Sequelize } from '@sentzunhat/zacatl/third-party/sequelize';
import { Service } from '@sentzunhat/zacatl/service';
import { config, createServiceConfig } from './config';

async function main() {
  console.log('🚀 Starting Fastify + SQLite (Sequelize) Example');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Initialize Fastify
    const fastify = Fastify({ logger: false });

    // Set up Zod validation for Fastify
    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);

    // Centralized error handler (real-world pattern)
    fastify.setErrorHandler(async (error: Error & { statusCode?: number }, request, reply) => {
      const statusCode = error.statusCode || 500;

      // Log error for debugging
      console.error(`[${request.method}] ${request.url}:`, error.message);

      // Send clean error response
      await reply.status(statusCode).send({
        error: {
          message: error.message || 'Internal Server Error',
          statusCode,
        },
      });
    });

    // Initialize Sequelize
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      logging: false,
      storage: config.databaseUrl.replace('sqlite:', ''),
    });

    // Create and start service - DI registration happens automatically via layers
    const serviceConfig = createServiceConfig(fastify, sequelize);
    const service = new Service(serviceConfig);

    await service.start({ port: config.port });

    console.log(`✓ Server running on http://localhost:${config.port}`);
    console.log('\n📚 Available endpoints:');
    console.log('  GET    /greetings              - Get all greetings');
    console.log('  GET    /greetings/:id          - Get greeting by ID');
    console.log('  GET    /greetings/random/:lang - Get random greeting by language');
    console.log('  POST   /greetings              - Create new greeting');
    console.log('  DELETE /greetings/:id          - Delete greeting');
    console.log(`\n💡 Try: curl http://localhost:${config.port}/greetings`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Failed to start service:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down gracefully...');
  process.exit(0);
});

main();
