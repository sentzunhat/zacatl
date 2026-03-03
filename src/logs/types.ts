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
 * Logger interface for structured logging
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
 * Logger port interface - implement this to create custom log transports
 * (Winston, Bunyan, Console, CloudWatch, etc.)
 */
export interface LoggerPort {
  log: (message: string, input?: LoggerInput) => void;
  info: (message: string, input?: LoggerInput) => void;
  trace: (message: string, input?: LoggerInput) => void;
  warn: (message: string, input?: LoggerInput) => void;
  error: (message: string, input?: LoggerInput) => void;
  fatal: (message: string, input?: LoggerInput) => void;
}

/**
 * Adapter type identifier for built-in adapters
 */
export type LoggerAdapterType = 'pino' | 'console';
