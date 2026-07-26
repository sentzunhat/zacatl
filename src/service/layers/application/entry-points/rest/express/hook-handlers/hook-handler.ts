import type { Request, Response } from 'express';

/**
 * Express-specific Hook Handler
 *
 * Compatible with Fastify's `HookHandler` API (see
 * `../../hook-handlers/hook-handler`) but uses Express types.
 *
 * Express has no native `onRequest`/`preValidation`/`preSerialization`
 * lifecycle events, so only `onRequest` and `preHandler` are supported here.
 * The `ExpressApiAdapter.registerHook` translates both to Express middleware
 * via `app.use(...)` at runtime; any other hook name is rejected (logged and
 * skipped) at registration time.
 *
 * @example
 * ```typescript
 * export const AuthHook: HookHandler = {
 *   name: 'preHandler',
 *   execute: async (request, reply) => {
 *     const token = request.headers.authorization?.replace('Bearer ', '');
 *     if (!token) {
 *       throw new UnauthorizedError({ message: 'Missing authentication token' });
 *     }
 *   },
 * };
 * ```
 */
export type HookHandlerName = 'onRequest' | 'preHandler';

export interface HookHandler {
  name: HookHandlerName;
  execute: (request: Request, reply: Response) => Promise<void>;
}
