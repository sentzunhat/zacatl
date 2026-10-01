import { format } from 'node:util';

import type { FastifyBaseLogger } from 'fastify';

import { getLoggerAdapter } from './adapter-ref';
import type { Logger, LoggerPort } from './types';

type FastifyLogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
type Serializer = (value: unknown) => unknown;

export interface FastifyLoggerOptions {
  /**
   * Minimum level for console/custom adapters (default `info`, Fastify's default).
   * Pino-backed loggers keep their own pino level.
   */
  level?: FastifyLogLevel | 'silent';
}

interface BridgeState {
  port: LoggerPort;
  level: string;
  bindings: Record<string, unknown>;
  serializers: Record<string, Serializer>;
  // Shared by a bridge and all its children, so a broken adapter warns once.
  failure: { reported: boolean };
}

const LEVEL_VALUES: Record<string, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
  silent: Number.POSITIVE_INFINITY,
};

// LoggerPort has no debug level; trace is the closest lower one.
const PORT_METHOD: Record<FastifyLogLevel, keyof LoggerPort> = {
  fatal: 'fatal',
  error: 'error',
  warn: 'warn',
  info: 'info',
  debug: 'trace',
  trace: 'trace',
};

// Own-property lookup only: keys such as `constructor`, `toString` or
// `__proto__` in a logged object must never resolve to Object.prototype members.
const ownSerializer = (
  serializers: Record<string, Serializer>,
  key: string,
): Serializer | undefined => {
  if (!Object.hasOwn(serializers, key)) return undefined;
  const serializer = serializers[key];
  return typeof serializer === 'function' ? serializer : undefined;
};

// defineProperty instead of assignment, so a `__proto__` key stays a plain
// data field instead of replacing the object's prototype.
const setField = (target: Record<string, unknown>, key: string, value: unknown): void => {
  Object.defineProperty(target, key, {
    value,
    enumerable: true,
    writable: true,
    configurable: true,
  });
};

const reportFailure = (state: BridgeState, error: unknown): void => {
  if (state.failure.reported) return;
  state.failure.reported = true;
  const reason = error instanceof Error ? error.message : String(error);
  process.emitWarning(`Zacatl logger adapter failed; log entries are being dropped: ${reason}`, {
    code: 'ZACATL_LOGGER_ADAPTER_FAILED',
  });
};

const serializeError = (error: Error): Record<string, unknown> => ({
  type: error.name,
  message: error.message,
  stack: error.stack,
});

const createBridge = (state: BridgeState): FastifyBaseLogger => {
  const write =
    (level: FastifyLogLevel) =>
    (first?: unknown, ...rest: unknown[]): void => {
      if ((LEVEL_VALUES[level] ?? 0) < (LEVEL_VALUES[bridge.level] ?? LEVEL_VALUES['info'] ?? 30)) {
        return;
      }

      // Logging must never break the request path: a failing adapter or
      // serializer (or an unserializable value) drops the entry instead of throwing.
      try {
        // Fastify and pino call styles: (msg, ...args), (obj, msg?, ...args), (err, msg?)
        let fields: Record<string, unknown> = {};
        let message = '';
        if (first instanceof Error) {
          fields = { err: first };
          message = rest.length > 0 ? format(...rest) : first.message;
        } else if (first !== null && typeof first === 'object') {
          fields = { ...(first as Record<string, unknown>) };
          message = rest.length > 0 ? format(...rest) : '';
        } else if (first !== undefined) {
          message = format(first, ...rest);
        }

        const data: Record<string, unknown> = { ...state.bindings };
        for (const [key, value] of Object.entries(fields)) {
          const serializer = ownSerializer(state.serializers, key);
          setField(
            data,
            key,
            serializer != null
              ? serializer(value)
              : value instanceof Error
                ? serializeError(value)
                : value,
          );
        }

        state.port[PORT_METHOD[level]](
          message,
          Object.keys(data).length > 0 ? { data } : undefined,
        );
      } catch (error) {
        reportFailure(state, error);
      }
    };

  const bridge = {
    level: state.level,
    fatal: write('fatal'),
    error: write('error'),
    warn: write('warn'),
    info: write('info'),
    debug: write('debug'),
    trace: write('trace'),
    silent: (): void => undefined,
    child: (
      bindings: Record<string, unknown>,
      options?: { level?: string; serializers?: Record<string, Serializer> },
    ): FastifyBaseLogger =>
      createBridge({
        port: state.port,
        level: options?.level ?? bridge.level,
        bindings: { ...state.bindings, ...bindings },
        serializers: { ...state.serializers, ...(options?.serializers ?? {}) },
        failure: state.failure,
      }),
  };

  return bridge;
};

/**
 * Turn a Zacatl logger into a Fastify logger, so `request.log` / `reply.log`
 * write through the same logger as the rest of the app.
 *
 * - Pino-backed loggers (`createLogger()` with the default or a
 *   `PinoLoggerAdapter`, or the default `logger`) return the real pino
 *   instance, keeping pino's performance and Fastify's serializers.
 * - Console and custom `LoggerPort` adapters (e.g. a file or SQLite writer)
 *   get a bridge implementing Fastify's logger contract (`level`, `child()`,
 *   `info(obj, msg)`); child bindings such as `reqId` and Fastify's
 *   `req`/`res`/`err` serializers end up in `input.data`.
 *
 * @example
 * ```typescript
 * import Fastify from 'fastify';
 * import { createLogger, PinoLoggerAdapter, toFastifyLogger } from '@sentzunhat/zacatl/logs';
 *
 * const logger = createLogger(new PinoLoggerAdapter());
 * const fastify = Fastify({ loggerInstance: toFastifyLogger(logger) });
 * ```
 */
export const toFastifyLogger = (
  logger: Logger | LoggerPort,
  options?: FastifyLoggerOptions,
): FastifyBaseLogger => {
  const adapter = getLoggerAdapter(logger);

  const pinoSource = adapter as Partial<{ getPinoInstance: () => unknown }>;
  if (typeof pinoSource.getPinoInstance === 'function') {
    return pinoSource.getPinoInstance() as FastifyBaseLogger;
  }

  return createBridge({
    port: adapter,
    level: options?.level ?? 'info',
    bindings: {},
    serializers: {},
    failure: { reported: false },
  });
};
