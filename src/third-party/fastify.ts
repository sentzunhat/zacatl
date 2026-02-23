/**
 * Fastify re-exports
 *
 * This module re-exports Fastify types and utilities for use across the framework
 * and in examples to ensure version consistency.
 */

export {
  default as Fastify,
  type FastifyInstance,
  type FastifyRequest,
  type FastifyReply,
  type FastifySchema,
  type HTTPMethods,
  type FastifyServerOptions,
  type RawServerBase,
} from 'fastify';

// Type provider for Zod schema validation at the type level
export type { ZodTypeProvider } from 'fastify-type-provider-zod';
