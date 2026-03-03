import { pino } from '@zacatl/third-party/pino';

import type { LoggerPort, LoggerInput } from '../types';
import { createPinoConfig } from './config';

/**
 * Pino-based logger adapter for production microservices
 * providing structured, high-performance logging.
 *
 * @example Basic usage
 * ```typescript
 * import { PinoLoggerAdapter } from '@sentzunhat/zacatl/logs';
 *
 * const logger = new PinoLoggerAdapter();
 * logger.info('Server started', { data: { port: 3000 } });
 * ```
 *
 * @example With custom configuration
 * ```typescript
 * import { PinoLoggerAdapter, createPinoConfig } from '@sentzunhat/zacatl/logs';
 *
 * const logger = new PinoLoggerAdapter(
 *   createPinoConfig({
 *     serviceName: 'my-api',
 *     appVersion: '1.0.0'
 *   })
 * );
 * ```
 *
 * @example With file destination
 * ```typescript
 * import pino from 'pino';
 * import { PinoLoggerAdapter, createPinoConfig } from '@sentzunhat/zacatl/logs';
 *
 * const dest = pino.destination('/var/log/app.log');
 * const logger = new PinoLoggerAdapter(createPinoConfig(), dest);
 * ```
 */
export class PinoLoggerAdapter implements LoggerPort {
  private readonly pinoLogger: pino.BaseLogger;

  constructor(config?: pino.LoggerOptions, destination?: pino.DestinationStream) {
    this.pinoLogger = pino(config ?? createPinoConfig(), destination);
  }

  /**
   * Get the underlying Pino logger instance for advanced usage.
   *
   * @returns {pino.BaseLogger} The underlying Pino BaseLogger instance
   */
  getPinoInstance(): pino.BaseLogger {
    return this.pinoLogger;
  }

  log(message: string, input?: LoggerInput): void {
    this.info(message, input);
  }

  info(message: string, input?: LoggerInput): void {
    this.pinoLogger.info({ data: input?.data, details: input?.details }, message);
  }

  trace(message: string, input?: LoggerInput): void {
    this.pinoLogger.trace({ data: input?.data, details: input?.details }, message);
  }

  warn(message: string, input?: LoggerInput): void {
    this.pinoLogger.warn({ data: input?.data, details: input?.details }, message);
  }

  error(message: string, input?: LoggerInput): void {
    this.pinoLogger.error({ data: input?.data, details: input?.details }, message);
  }

  fatal(message: string, input?: LoggerInput): void {
    this.pinoLogger.fatal({ data: input?.data, details: input?.details }, message);
  }
}
