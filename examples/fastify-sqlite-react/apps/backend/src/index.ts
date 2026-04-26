/**
 * Fastify + SQLite (Sequelize)
 * Entry Point
 */

import '@sentzunhat/zacatl/third-party/dependency-injection/reflect-metadata';
import sqlite3 from '@sentzunhat/zacatl/third-party/databases/sqlite3';
import {
  Fastify,
  serializerCompiler,
  validatorCompiler,
} from '@sentzunhat/zacatl/third-party/fastify';
import { Sequelize, type SequelizeOptions } from '@sentzunhat/zacatl/third-party/databases/sequelize';
import { Service } from '@sentzunhat/zacatl/service';
import { API_PREFIX, config, createServiceConfig } from './config';
import { initGreetingModel } from './infrastructure/greetings/models/greeting.model';

type FastifyError = Error & {
  statusCode?: number;
  code?: string;
  error?: string;
  validationContext?: string;
  validation?: Array<{ instancePath?: string; message?: string }>;
};

const formatValidationMessage = (error: FastifyError): string => {
  const rawMessage = error.message || 'Validation failed';
  const zodPrefixPattern = /^(body|params|querystring|headers)\/[^\s]+\s+/;

  if (zodPrefixPattern.test(rawMessage)) {
    return rawMessage.replace(zodPrefixPattern, '');
  }

  const validationMessage = error.validation?.find((item) => item.message)?.message;

  if (validationMessage) {
    return validationMessage;
  }

  return rawMessage;
};

let activeService: Service | null = null;
let shutdownInProgress = false;

const shutdown = (): void => {
  if (shutdownInProgress) {
    process.exit(0);
    return;
  }

  shutdownInProgress = true;
  console.log('\n👋 Shutting down gracefully...');

  const forceExitTimer = setTimeout(() => {
    console.warn('Force exit after timeout');
    process.exit(0);
  }, 2500);

  forceExitTimer.unref();

  (activeService?.stop() ?? Promise.resolve())
    .catch((error) => { console.error('Error during shutdown:', error); })
    .finally(() => {
      clearTimeout(forceExitTimer);
      process.exit(0);
    });
};

const main = async () => {
  console.log('🚀 Starting Fastify + SQLite (Sequelize) Example');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Initialize Fastify
    const fastify = Fastify({ logger: false });

    // Set up Zod validation for Fastify
    fastify.setValidatorCompiler(validatorCompiler);
    fastify.setSerializerCompiler(serializerCompiler);

    // Centralized error handler with uniform plain-object responses
    fastify.setErrorHandler(async (error: FastifyError, request, reply) => {
      const statusCode = error.statusCode || 500;

      // Log error for debugging
      console.error(`[${request.method}] ${request.url}:`, error.message);

      if (error.code === 'FST_ERR_VALIDATION') {
        await reply.status(400).send({
          statusCode: 400,
          code: 'FST_ERR_VALIDATION',
          error: 'Bad Request',
          message: formatValidationMessage(error),
        });
        return;
      }

      // Send clean error response
      await reply.status(statusCode).send(error);
    });

    // Initialize Sequelize with explicit dialact module for ESM compatibility
    const sequelize = new Sequelize({
      dialect: 'sqlite',
      dialectModule: sqlite3 as SequelizeOptions['dialectModule'],
      logging: false,
      storage: config.databaseUrl.replace('sqlite:', ''),
    });

    initGreetingModel(sequelize);

    // Create and start service
    const serviceConfig = createServiceConfig(fastify, sequelize);
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
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

main();
