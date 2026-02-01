/**
 * Input structure for logger methods
 */
export type LoggerInput =
  | {
      data?: unknown;
      details?: unknown;
    }
  | undefined;

/**
 * Logger interface that wraps Pino with structured logging
 */
export interface Logger {
  log: (message: string, input?: LoggerInput) => void;
  info: (message: string, input?: LoggerInput) => void;
  trace: (message: string, input?: LoggerInput) => void;
  warn: (message: string, input?: LoggerInput) => void;
  error: (message: string, input?: LoggerInput) => void;
  fatal: (message: string, input?: LoggerInput) => void;
}

/**
 * Logger adapter interface - implement this to create custom log transports
 * (Winston, Bunyan, Console, CloudWatch, etc.)
 */
export interface LoggerAdapter {
  log: (message: string, input?: LoggerInput) => void;
  info: (message: string, input?: LoggerInput) => void;
  trace: (message: string, input?: LoggerInput) => void;
  warn: (message: string, input?: LoggerInput) => void;
  error: (message: string, input?: LoggerInput) => void;
  fatal: (message: string, input?: LoggerInput) => void;
}

/**
 * Re-export Pino types for convenience
 */
export type { LoggerOptions as PinoLoggerConfig } from "pino";

/**
 * Adapter type identifier for built-in adapters
 */
export type LoggerAdapterType = "pino" | "console";
