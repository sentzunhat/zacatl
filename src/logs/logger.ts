import { PinoLoggerAdapter } from './adapters/pino';
import type { Logger, LoggerPort, LoggerInput } from './types';

/**
 * Creates a logger instance with a specific adapter.
 * This is the recommended way to create loggers with custom adapters.
 *
 * @param adapter - LoggerPort implementation (defaults to PinoLoggerAdapter)
 * @returns Logger instance
 *
 * @example
 * ```typescript
 * import { createLogger, ConsoleLoggerAdapter } from '@zacatl';
 *
 * // Default Pino logger
 * const logger = createLogger();
 *
 * // Console logger for CLI apps
 * const cliLogger = createLogger(new ConsoleLoggerAdapter());
 *
 * // Custom adapter
 * class WinstonAdapter implements LoggerPort { ... }
 * const customLogger = createLogger(new WinstonAdapter());
 * ```
 */
export const createLogger = (adapter?: LoggerPort): Logger => {
  const adapterInstance = adapter ?? new PinoLoggerAdapter();

  return {
    log: (message: string, input?: LoggerInput) => adapterInstance.log(message, input),
    info: (message: string, input?: LoggerInput) => adapterInstance.info(message, input),
    trace: (message: string, input?: LoggerInput) => adapterInstance.trace(message, input),
    warn: (message: string, input?: LoggerInput) => adapterInstance.warn(message, input),
    error: (message: string, input?: LoggerInput) => adapterInstance.error(message, input),
    fatal: (message: string, input?: LoggerInput) => adapterInstance.fatal(message, input),
  };
};

/**
 * Default logger instance with Pino adapter.
 * Provides structured JSON logging ready for Prometheus, OpenTelemetry, and log aggregation.
 *
 * For custom adapters, use `createLogger()`:
 * ```typescript
 * import { createLogger, ConsoleLoggerAdapter } from '@zacatl';
 * const cliLogger = createLogger(new ConsoleLoggerAdapter());
 * ```
 *
 * @example
 * ```typescript
 * import { logger } from '@zacatl';
 *
 * logger.info('Application started');
 * logger.error('Request failed', {
 *   data: { userId: 123, endpoint: '/api/users' },
 *   details: { statusCode: 500 }
 * });
 * ```
 */
export const logger: Logger = createLogger();
