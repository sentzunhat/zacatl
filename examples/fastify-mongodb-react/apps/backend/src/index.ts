/**
 * Fastify + MongoDB (Mongoose)
 * Entry Point
 */

import '@sentzunhat/zacatl/third-party/dependency-injection/reflect-metadata';
import { Fastify } from '@sentzunhat/zacatl/third-party/fastify';
import { mongoose } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { Service } from '@sentzunhat/zacatl/service/service';
import { API_PREFIX, config, createServiceConfig } from './config';

let activeService: Service | null = null;
async function main() {
  console.log('🚀 Starting Fastify + MongoDB (Mongoose) Example');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
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
          message: statusCode >= 500 ? 'Internal Server Error' : error.message,
          statusCode,
        },
      });
    });

    const serviceConfig = createServiceConfig(fastify, mongoose);
    const service = new Service(serviceConfig);
    activeService = service;

    await service.start({ port: config.port });

    console.log(`✓ Server running on http://localhost:${config.port}`);
    console.log('\n📚 Available endpoints:');
    console.log(`  GET    ${API_PREFIX}/greetings              - Get all greetings`);
    console.log(`  GET    ${API_PREFIX}/greetings/:id          - Get greeting by ID`);
    console.log(`  GET    ${API_PREFIX}/greetings/random/:lang - Get random greeting by language`);
    console.log(`  POST   ${API_PREFIX}/greetings              - Create new greeting`);
    console.log(`  DELETE ${API_PREFIX}/greetings/:id          - Delete greeting`);
    console.log(`\n💡 Try: curl http://localhost:${config.port}${API_PREFIX}/greetings`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error) {
    console.error('❌ Failed to start service:', error);
    process.exit(1);
  }
}

const shutdown = (): void => {
  console.log('\n👋 Shutting down gracefully...');
  (activeService?.stop() ?? Promise.resolve()).finally(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main();
