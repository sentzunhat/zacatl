import type { LoggerOptions } from "@zacatl/third-party/pino";

export interface PinoConfigOptions {
  env?: string;
  serviceName?: string;
  appVersion?: string;
  appEnv?: string;
  /** Override or extend the generated Pino config */
  pinoConfig?: Partial<LoggerOptions>;
}

/**
 * Default Pino logger configuration with sensible fallbacks.
 * - Uses pino-pretty in non-production environments for readability
 * - Emits structured JSON in production
 *
 * @example Basic usage
 * ```typescript
 * import { PinoLoggerAdapter, createPinoConfig } from '@zacatl/logs';
 * const logger = new PinoLoggerAdapter(createPinoConfig());
 * ```
 *
 * @example With service metadata
 * ```typescript
 * const config = createPinoConfig({
 *   serviceName: 'user-api',
 *   appVersion: '1.0.0'
 * });
 * ```
 *
 * @example Multi-transport (console + file) - NO SPREAD NEEDED
 * ```typescript
 * const config = createPinoConfig({
 *   pinoConfig: {
 *     transport: {
 *       targets: [
 *         { target: 'pino/file', options: { destination: './app.log' } },
 *         { target: 'pino-pretty', options: { colorize: true } }
 *       ]
 *     }
 *   }
 * });
 * ```
 *
 * @example File logging with destination
 * ```typescript
 * import pino from 'pino';
 * const dest = pino.destination('/var/log/app.log');
 * const logger = new PinoLoggerAdapter(createPinoConfig(), dest);
 * ```
 */
export const createPinoConfig = (
  options?: PinoConfigOptions,
): LoggerOptions => {
  const env = options?.env ?? process.env["NODE_ENV"] ?? "development";
  const isPretty = env !== "production";

  const transport = isPretty
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      }
    : undefined;

  const baseConfig: LoggerOptions = {
    level: process.env["LOG_LEVEL"] ?? "info",
    ...(transport ? { transport } : {}),
    formatters: {
      bindings: (bindings) => {
        return {
          pid: bindings["pid"],
          service:
            options?.serviceName ?? process.env["SERVICE_NAME"] ?? "zacatl",
          environment: env,
          app: {
            version:
              options?.appVersion ?? process.env["APP_VERSION"] ?? "0.0.0",
            environment: options?.appEnv ?? process.env["APP_ENV"] ?? env,
          },
          host: bindings["hostname"],
        };
      },
      level: (label) => {
        return { level: label.toLowerCase() };
      },
    },
  };

  // Merge custom Pino config if provided
  if (options?.pinoConfig) {
    return {
      ...baseConfig,
      ...options.pinoConfig,
      // Deep merge formatters if both exist
      formatters: {
        ...baseConfig.formatters,
        ...options.pinoConfig.formatters,
      },
    };
  }

  return baseConfig;
};
