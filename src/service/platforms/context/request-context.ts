import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Metadata propagated through an async request lifecycle.
 * All fields are optional — populate only what is available at your platform boundary.
 *
 * Keep this to IDs and metadata only. Never store secrets, tokens, or PII here.
 */
export interface RequestContext {
  requestId?: string;
  tenantId?: string;
  userId?: string;
}

/**
 * Singleton AsyncLocalStorage instance for request-scoped context.
 *
 * Initialize at the platform/middleware boundary with `requestContext.run()`,
 * then read from any layer with `requestContext.getStore()`.
 *
 * @example Platform boundary (e.g., Fastify hook)
 * ```typescript
 * import { requestContext } from '@sentzunhat/zacatl';
 *
 * fastify.addHook('onRequest', (req, _reply, done) => {
 *   requestContext.run(
 *     { requestId: req.id, tenantId: req.headers['x-tenant-id'] as string },
 *     done,
 *   );
 * });
 * ```
 *
 * @example Reading context anywhere in the call stack
 * ```typescript
 * const ctx = requestContext.getStore();
 * // ctx?.requestId, ctx?.tenantId, ctx?.userId
 * ```
 */
export const requestContext = new AsyncLocalStorage<RequestContext>();

/**
 * Pino-compatible mixin function that merges the current request context
 * into every log entry.
 *
 * Pass this to `PinoLoggerAdapter` to opt in to automatic context propagation:
 *
 * @example
 * ```typescript
 * import { PinoLoggerAdapter, createLogger, createPinoConfig } from '@sentzunhat/zacatl';
 * import { requestContextMixin } from '@sentzunhat/zacatl';
 *
 * const logger = createLogger(
 *   new PinoLoggerAdapter({ ...createPinoConfig(), mixin: requestContextMixin }),
 * );
 * ```
 */
export const requestContextMixin = (): Partial<RequestContext> => {
  return requestContext.getStore() ?? {};
};
