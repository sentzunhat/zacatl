import type { FastifyReply, FastifyRequest } from '@zacatl/third-party/fastify';

/**
 * Fastify Hook Handler
 *
 * This type is Fastify-specific by design: `onRequest`, `preValidation`, and
 * `preSerialization` map directly to Fastify's request lifecycle
 * (`server.addHook(...)`, see the Fastify `ApiServerPort` adapter) and have
 * no equivalent in Express, which only exposes a single middleware chain.
 *
 * Express consumers should use the Express-specific `HookHandler` type from
 * `../express/hook-handlers/hook-handler` instead, which supports the
 * subset of hook names (`onRequest`, `preHandler`) that can be mapped onto
 * Express middleware (`app.use(...)`) — see `ExpressApiAdapter.registerHook`.
 */
export type HookHandlerName = 'onRequest' | 'preHandler' | 'preValidation' | 'preSerialization';

export interface HookHandler {
  name: HookHandlerName;
  execute: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
}
