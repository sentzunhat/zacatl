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
      data?: unknown;
      details?: unknown;
    }
  | undefined;

const logger = {
  log: (message: string, input?: LoggerInput): void => {
    console.log(message, {
      data: input?.data,
      details: input?.details,
    });
  },

  info: (message: string, input?: LoggerInput): void => {
    defaultLogger.info({ data: input?.data, details: input?.details }, message);
  },

  trace: (message: string, input?: LoggerInput): void => {
    defaultLogger.trace(
      { data: input?.data, details: input?.details },
      message
    );
  },

  warn: (message: string, input?: LoggerInput): void => {
    defaultLogger.warn({ data: input?.data, details: input?.details }, message);
  },

  error: (message: string, input?: LoggerInput): void => {
    defaultLogger.error(
      { data: input?.data, details: input?.details },
      message
    );
  },

  fatal: (message: string, input?: LoggerInput): void => {
    defaultLogger.fatal(
      { data: input?.data, details: input?.details },
      message
    );
  },
};

export { defaultLogger, logger };
