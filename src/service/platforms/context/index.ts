// @barrel-generated
/**
 * Request context module — AsyncLocalStorage-based request scoping for Node 24+.
 *
 * ## Quick start
 *
 * **1. Initialize at the platform boundary** (once per request):
 * ```typescript
 * import { requestContext } from '@sentzunhat/zacatl';
 *
 * requestContext.run({ requestId: 'abc', tenantId: 'tenant-1' }, () => {
 *   handler();
 * });
 * ```
 *
 * **2. Read anywhere in the call stack** (controller, service, repository…):
 * ```typescript
 * const ctx = requestContext.getStore();
 * // ctx?.requestId, ctx?.tenantId, ctx?.userId
 * ```
 *
 * **3. Opt in to automatic log context** (pino mixin):
 * ```typescript
 * import { PinoLoggerAdapter, createLogger, createPinoConfig } from '@sentzunhat/zacatl';
 * import { requestContextMixin } from '@sentzunhat/zacatl';
 *
 * const logger = createLogger(
 *   new PinoLoggerAdapter({ ...createPinoConfig(), mixin: requestContextMixin }),
 * );
 * // Every log line now includes requestId / tenantId / userId automatically.
 * ```
 */

export { requestContext, requestContextMixin } from './request-context';
export type { RequestContext } from './request-context';
