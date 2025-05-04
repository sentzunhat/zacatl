import pino from "pino";

import { getConfigOrThrow } from "./configuration";

const defaultLogger: pino.BaseLogger = pino({
  level: process.env["LOG_LEVEL"] ?? "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
    },
  },
  formatters: {
    bindings: (bindings) => {
      return {
        unique: bindings["pid"],
        service: getConfigOrThrow<string>("SERVICE_NAME"),
        environment: getConfigOrThrow<string>("NODE_ENV"),
        app: {
          version: getConfigOrThrow<string>("APP_VERSION"),
          environment: getConfigOrThrow<string>("APP_ENV"),
        },
        host: bindings["hostname"],
      };
    },
    level: (label) => {
      return { level: label.toLocaleLowerCase() };
    },
  },
});

export type LoggerInput =
  | {
      logData?: unknown;
      metadata?: unknown;
    }
  | undefined;

const logger = {
  log: (message: string, input?: LoggerInput): void => {
    console.log(message, {
      logData: input?.logData,
      metadata: input?.metadata,
    });
  },

  info: (message: string, input?: LoggerInput): void => {
    defaultLogger.info(
      { logData: input?.logData, metadata: input?.metadata },
      message
    );
  },

  trace: (message: string, input?: LoggerInput): void => {
    defaultLogger.trace(
      { logData: input?.logData, metadata: input?.metadata },
      message
    );
  },

  warn: (message: string, input?: LoggerInput): void => {
    defaultLogger.warn(
      { logData: input?.logData, metadata: input?.metadata },
      message
    );
  },

  error: (message: string, input?: LoggerInput): void => {
    defaultLogger.error(
      { logData: input?.logData, metadata: input?.metadata },
      message
    );
  },

  fatal: (message: string, input?: LoggerInput): void => {
    defaultLogger.fatal(
      { logData: input?.logData, metadata: input?.metadata },
      message
    );
  },
};

export { defaultLogger, logger };
