import type { Logger, LoggerPort } from './types';

// Symbol.for so the reference survives the ESM and CJS builds being loaded together.
const LOGGER_ADAPTER = Symbol.for('@sentzunhat/zacatl/logs/adapter');

/**
 * Remember which adapter a `Logger` wrapper writes to, without changing its
 * public shape (the property is a non-enumerable symbol).
 */
export const withLoggerAdapter = <T extends object>(logger: T, adapter: LoggerPort): T => {
  Object.defineProperty(logger, LOGGER_ADAPTER, { value: adapter });
  return logger;
};

/**
 * The adapter behind a `Logger` created by `createLogger()` (or a built-in
 * default logger). Anything else is treated as the adapter itself.
 */
export const getLoggerAdapter = (logger: Logger | LoggerPort): LoggerPort =>
  (logger as unknown as Partial<Record<symbol, LoggerPort>>)[LOGGER_ADAPTER] ?? logger;
