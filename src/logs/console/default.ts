import type { Logger } from '../types';
import { ConsoleLoggerAdapter } from './adapter';
import { createConsoleConfig } from './config';

/**
 * Default console logger instance with standard configuration.
 * Use this for CLI tools, development scripts, and desktop applications.
 *
 * @example
 * ```typescript
 * import { consoleLogger } from '@sentzunhat/zacatl/logs';
 *
 * consoleLogger.info('Starting CLI tool');
 * consoleLogger.error('Command failed', { data: { code: 1 } });
 * ```
 */
const consoleLoggerAdapter = new ConsoleLoggerAdapter(createConsoleConfig());

export const consoleLogger: Logger = {
  log: (message, input) => consoleLoggerAdapter.log(message, input),
  info: (message, input) => consoleLoggerAdapter.info(message, input),
  trace: (message, input) => consoleLoggerAdapter.trace(message, input),
  warn: (message, input) => consoleLoggerAdapter.warn(message, input),
  error: (message, input) => consoleLoggerAdapter.error(message, input),
  fatal: (message, input) => consoleLoggerAdapter.fatal(message, input),
};
