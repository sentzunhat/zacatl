import type { Logger, LoggerPort, LoggerInput } from '../types';
import { PinoLoggerAdapter } from './adapter';
import { createPinoConfig } from './config';

/**
 * Creates a logger instance with a specific adapter.
 * This is the recommended way to create loggers with custom adapters.
 *
 * Defaults to PinoLoggerAdapter for production-ready structured logging.
 *
 * @param adapter - LoggerPort implementation (defaults to PinoLoggerAdapter)
 * @returns Logger instance
 *
 * @example
 * ```typescript
 * import { createLogger, ConsoleLoggerAdapter } from '@sentzunhat/zacatl/logs';
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
 * Default Pino logger instance with standard configuration.
 * Use this for production microservices with structured logging.
 *
 * @example
 * ```typescript
 * import { pinoLogger } from '@sentzunhat/zacatl/logs';
 *
 * pinoLogger.info('Server started', { data: { port: 3000 } });
 * pinoLogger.error('Request failed', {
 *   data: { userId: 123, endpoint: '/api/users' },
 *   details: { statusCode: 500 }
 * });
 * ```
 */
const pinoLoggerAdapter = new PinoLoggerAdapter(createPinoConfig());

export const pinoLogger: Logger = {
  log: (message, input) => pinoLoggerAdapter.log(message, input),
  info: (message, input) => pinoLoggerAdapter.info(message, input),
  trace: (message, input) => pinoLoggerAdapter.trace(message, input),
  warn: (message, input) => pinoLoggerAdapter.warn(message, input),
  error: (message, input) => pinoLoggerAdapter.error(message, input),
  fatal: (message, input) => pinoLoggerAdapter.fatal(message, input),
};
