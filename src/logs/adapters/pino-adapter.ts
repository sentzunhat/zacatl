import pino from "pino";

import { createPinoConfig } from "../config";
import type { LoggerPort, LoggerInput } from "../types";

/**
 * Pino-based logger adapter for production microservices
 * providing structured, high-performance logging.
 */
export class PinoLoggerAdapter implements LoggerPort {
  private readonly pinoLogger: pino.BaseLogger;

  constructor(
    config?: pino.LoggerOptions,
    destination?: pino.DestinationStream,
  ) {
    this.pinoLogger = pino(config ?? createPinoConfig(), destination);
  }

  /**
   * Get the underlying Pino logger instance for advanced usage
   */
  getPinoInstance(): pino.BaseLogger {
    return this.pinoLogger;
  }

  log(message: string, input?: LoggerInput): void {
    this.info(message, input);
  }

  info(message: string, input?: LoggerInput): void {
    this.pinoLogger.info(
      { data: input?.data, details: input?.details },
      message,
    );
  }

  trace(message: string, input?: LoggerInput): void {
    this.pinoLogger.trace(
      { data: input?.data, details: input?.details },
      message,
    );
  }

  warn(message: string, input?: LoggerInput): void {
    this.pinoLogger.warn(
      { data: input?.data, details: input?.details },
      message,
    );
  }

  error(message: string, input?: LoggerInput): void {
    this.pinoLogger.error(
      { data: input?.data, details: input?.details },
      message,
    );
  }

  fatal(message: string, input?: LoggerInput): void {
    this.pinoLogger.fatal(
      { data: input?.data, details: input?.details },
      message,
    );
  }
}
