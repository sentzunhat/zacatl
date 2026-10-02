/**
 * Fastify + MongoDB (Mongoose)
 * Entry Point
 */

import '@sentzunhat/zacatl/third-party/dependency-injection/reflect-metadata';
import { Fastify } from '@sentzunhat/zacatl/third-party/fastify';
import { createLogger, PinoLoggerAdapter, toFastifyLogger } from '@sentzunhat/zacatl/logs';
import { mongoose } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { Service } from '@sentzunhat/zacatl/service/service';
import { API_PREFIX, config, createServiceConfig } from './config';

let activeService: Service | null = null;
async function main() {
  console.log('🚀 Starting Fastify + MongoDB (Mongoose) Example');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // One pino adapter for the app, Zacatl, and Fastify's request.log / reply.log
    const loggerAdapter = new PinoLoggerAdapter();
    const logger = createLogger(loggerAdapter);
    const fastify = Fastify({ loggerInstance: toFastifyLogger(loggerAdapter) });

    // Set up Zod validation for Fastify
    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);

    // Centralized error handler (real-world pattern)
    fastify.setErrorHandler(async (error: Error & { statusCode?: number }, request, reply) => {
      const statusCode = error.statusCode || 500;

      // Log through the shared logger (includes the request id)
      if (statusCode >= 500) {
        request.log.error({ err: error }, 'Request failed');
      } else {
        request.log.info({ err: error }, 'Request rejected');
      }

      // Send clean error response
      await reply.code(statusCode).send({
        error: {
          message: statusCode >= 500 ? 'Internal Server Error' : error.message,
          statusCode,
        },
      });
    });

    const serviceConfig = createServiceConfig(fastify, mongoose, logger);
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
