// @barrel-generated
/**
 * Logs module - Pluggable structured logging
 * @module logs
 */

// Logger factory and default instance (from Pino provider)
export { createLogger, pinoLogger as logger } from './pino';

// Core types
export type { Logger, LoggerPort, LoggerInput, LoggerAdapterType } from './types';

// Console logger exports
export {
  ConsoleLoggerAdapter,
  createConsoleConfig,
  consoleLogger,
  type ConsoleLoggerOptions,
} from './console';

// Pino logger exports
export {
  PinoLoggerAdapter,
  createPinoConfig,
  pinoLogger,
  type PinoLoggerConfig,
  type PinoConfigOptions,
} from './pino';
