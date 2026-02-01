import type pino from "pino";

export interface PinoConfigOptions {
  env?: string;
  serviceName?: string;
  appVersion?: string;
  appEnv?: string;
}

/**
 * Default Pino logger configuration with sensible fallbacks.
 * - Uses pino-pretty in non-production environments for readability
 * - Emits structured JSON in production
 */
export const createPinoConfig = (
  options?: PinoConfigOptions,
): pino.LoggerOptions => {
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

  return {
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
};
