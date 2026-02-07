/**
 * Logs module - Pluggable structured logging
 * @module logs
 */

export { logger, createLogger } from "./logger";
export type {
  Logger,
  LoggerPort,
  LoggerInput,
  LoggerAdapterType,
  PinoLoggerConfig,
} from "./types";
export { createPinoConfig, type PinoConfigOptions } from "./config";
export { ConsoleLoggerAdapter } from "./console-adapter";
export { PinoLoggerAdapter } from "./pino-adapter";
