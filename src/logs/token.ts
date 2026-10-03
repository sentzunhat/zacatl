import type { InjectionToken } from '@zacatl/third-party/dependency-injection/tsyringe';

import type { Logger } from './types';

/**
 * DI token for the Service's logger.
 *
 * The Service registers `ServiceConfig.logger` (or the default Zacatl `logger`)
 * under this token in its own container, shared by its layers and platforms,
 * so repositories, domain services and handlers can inject it, and the
 * Fastify/Express adapters log through it:
 *
 * @example
 * ```typescript
 * import { inject, singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
 * import { LoggerToken, type Logger } from '@sentzunhat/zacatl/logs';
 *
 * @singleton()
 * export class CheckoutService {
 *   constructor(@inject(LoggerToken) private readonly logger: Logger) {}
 * }
 * ```
 */
// eslint-disable-next-line @typescript-eslint/naming-convention -- PascalCase matches the other DI tokens (e.g. NodeSqliteToken)
export const LoggerToken: InjectionToken<Logger> = Symbol.for('@sentzunhat/zacatl/logger');
