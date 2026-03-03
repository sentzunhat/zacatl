/**
 * Pino logger adapter types
 * @module logs/pino/types
 */

import type { LoggerOptions } from '@zacatl/third-party/pino';

/**
 * Re-export Pino types for convenience
 *
 * @remarks
 * This is a type-only export and does not introduce runtime dependencies.
 */
export type { LoggerOptions as PinoLoggerConfig } from '@zacatl/third-party/pino';

/**
 * Configuration options for creating Pino logger config
 */
export interface PinoConfigOptions {
  /** Environment override (defaults to NODE_ENV) */
  env?: string;
  /** Service name for structured logging */
  serviceName?: string;
  /** Application version */
  appVersion?: string;
  /** Application environment tag */
  appEnv?: string;
  /** Override or extend the generated Pino config */
  pinoConfig?: Partial<LoggerOptions>;
}
