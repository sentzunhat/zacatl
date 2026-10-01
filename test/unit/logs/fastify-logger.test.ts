import { Writable } from 'node:stream';

import Fastify, { type FastifyInstance } from 'fastify';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ConsoleLoggerAdapter, createLogger, logger as defaultLogger } from '../../../src/logs';
import { toFastifyLogger } from '../../../src/logs/fastify';
import { PinoLoggerAdapter } from '../../../src/logs/pino/adapter';
import type { LoggerInput, LoggerPort } from '../../../src/logs/types';
import { GetRouteHandler } from '../../../src/service/layers/application/entry-points/rest/fastify/handlers/get-route-handler';
import { createApiAdapter } from '../../../src/service/platforms/server/providers/fastify/api-adapter';

type Call = { level: keyof LoggerPort; message: string; data: Record<string, unknown> };

const createRecordingPort = (): LoggerPort & { calls: Call[] } => {
  const calls: Call[] = [];
  const record =
    (level: keyof LoggerPort) =>
    (message: string, input?: LoggerInput): void => {
      calls.push({ level, message, data: (input?.data ?? {}) as Record<string, unknown> });
    };
  return {
    calls,
    log: record('log'),
    info: record('info'),
    trace: record('trace'),
    warn: record('warn'),
    error: record('error'),
    fatal: record('fatal'),
  };
};

class OkHandler extends GetRouteHandler<void, void, { ok: boolean }> {
  constructor() {
    super({ url: '/ok', schema: {} });
  }

  async handler(): Promise<{ ok: boolean }> {
    return { ok: true };
  }
}

class BrokenHandler extends GetRouteHandler<void, void, { ok: boolean }> {
  constructor() {
    super({ url: '/broken', schema: {} });
  }

  async handler(): Promise<{ ok: boolean }> {
    throw new Error('boom');
  }
}

describe('toFastifyLogger', () => {
  let app: FastifyInstance | undefined;

  afterEach(async () => {
    await app?.close();
    app = undefined;
  });

  describe('pino-backed loggers', () => {
    it('returns the underlying pino instance', () => {
      const adapter = new PinoLoggerAdapter({ level: 'info' });

      expect(toFastifyLogger(adapter)).toBe(adapter.getPinoInstance());
      expect(toFastifyLogger(createLogger(adapter))).toBe(adapter.getPinoInstance());
      expect(typeof toFastifyLogger(defaultLogger).child).toBe('function');
    });

    it('sends Fastify request logs to the same pino destination', async () => {
      const lines: Array<{ msg?: string; reqId?: string }> = [];
      const destination = new Writable({
        write(chunk: Buffer, _encoding, callback): void {
          for (const raw of chunk.toString().split('\n')) {
            if (raw.trim() !== '') lines.push(JSON.parse(raw) as { msg?: string });
          }
          callback();
        },
      });
      const logger = createLogger(new PinoLoggerAdapter({ level: 'info' }, destination));

      app = Fastify({ loggerInstance: toFastifyLogger(logger) });
      createApiAdapter(app).registerRoute(new OkHandler());
      await app.inject({ method: 'GET', url: '/ok' });
      logger.info('app log');

      expect(lines.map((line) => line.msg)).toEqual(
        expect.arrayContaining(['incoming request', 'request completed', 'app log']),
      );
      expect(lines.find((line) => line.msg === 'incoming request')?.reqId).toBeDefined();
    });
  });

  describe('console and custom adapters', () => {
    it('routes Fastify request and handler-error logs through the adapter', async () => {
      const port = createRecordingPort();

      app = Fastify({ loggerInstance: toFastifyLogger(createLogger(port)) });
      const api = createApiAdapter(app);
      api.registerRoute(new OkHandler());
      api.registerRoute(new BrokenHandler());

      await app.inject({ method: 'GET', url: '/ok' });
      const broken = await app.inject({ method: 'GET', url: '/broken' });

      expect(broken.statusCode).toBe(500);

      const incoming = port.calls.find((call) => call.message === 'incoming request');
      expect(incoming?.level).toBe('info');
      expect(incoming?.data['reqId']).toBeDefined();
      expect(incoming?.data['req']).toMatchObject({ method: 'GET', url: '/ok' });

      const completed = port.calls.find((call) => call.message === 'request completed');
      expect(completed?.data['res']).toEqual({ statusCode: 200 });

      const failed = port.calls.filter((call) => call.message === 'Route handler failed');
      expect(failed).toHaveLength(1);
      expect(failed[0]?.level).toBe('error');
      expect(failed[0]?.data['err']).toMatchObject({ type: 'Error', message: 'boom' });
    });

    it('supports pino call styles, child bindings and levels', () => {
      const port = createRecordingPort();
      const log = toFastifyLogger(port, { level: 'debug' });

      log.child({ reqId: 'r1' }).warn({ userId: 7 }, 'user %s blocked', 'ann');
      log.error(new Error('kaput'));
      log.debug('debug goes to trace');
      log.info('plain message');

      expect(port.calls).toEqual([
        { level: 'warn', message: 'user ann blocked', data: { reqId: 'r1', userId: 7 } },
        {
          level: 'error',
          message: 'kaput',
          data: { err: expect.objectContaining({ type: 'Error', message: 'kaput' }) },
        },
        { level: 'trace', message: 'debug goes to trace', data: {} },
        { level: 'info', message: 'plain message', data: {} },
      ]);
    });

    it('drops messages below the configured level', () => {
      const port = createRecordingPort();
      const log = toFastifyLogger(port, { level: 'warn' });

      log.info('ignored');
      log.child({}, { level: 'silent' }).error('also ignored');
      log.warn('kept');

      expect(port.calls.map((call) => call.message)).toEqual(['kept']);
    });
  });

  describe('failure isolation', () => {
    it('keeps serving requests when the adapter throws, and warns once', async () => {
      const warn = vi.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
      const fail = (): void => {
        throw new Error('sqlite locked');
      };
      const port: LoggerPort = {
        log: fail,
        info: fail,
        trace: fail,
        warn: fail,
        error: fail,
        fatal: fail,
      };

      app = Fastify({ loggerInstance: toFastifyLogger(createLogger(port)) });
      const api = createApiAdapter(app);
      api.registerRoute(new OkHandler());
      api.registerRoute(new BrokenHandler());

      const ok = await app.inject({ method: 'GET', url: '/ok' });
      const broken = await app.inject({ method: 'GET', url: '/broken' });

      expect(ok.statusCode).toBe(200);
      expect(broken.statusCode).toBe(500);
      const adapterWarnings = warn.mock.calls.filter(
        ([, options]) =>
          (options as { code?: string } | undefined)?.code === 'ZACATL_LOGGER_ADAPTER_FAILED',
      );
      expect(adapterWarnings).toHaveLength(1);
      warn.mockRestore();
    });

    it('does not throw on values the adapter cannot serialize', () => {
      const warn = vi.spyOn(process, 'emitWarning').mockImplementation(() => undefined);
      const log = toFastifyLogger(createLogger(new ConsoleLoggerAdapter({ colors: false })));
      const circular: Record<string, unknown> = { name: 'loop' };
      circular['self'] = circular;

      expect(() => log.info({ circular }, 'circular value')).not.toThrow();
      warn.mockRestore();
    });

    it('treats prototype-named keys as plain data', () => {
      const port = createRecordingPort();
      const log = toFastifyLogger(port);
      const untrusted = JSON.parse(
        '{"__proto__": {"isAdmin": true}, "constructor": "c", "toString": "t", "user": "x"}',
      ) as Record<string, unknown>;

      log.info(untrusted, 'request body');

      const data = port.calls[0]?.data ?? {};
      expect(Object.getPrototypeOf(data)).toBe(Object.prototype);
      expect((data as { isAdmin?: boolean }).isAdmin).toBeUndefined();
      expect(Object.getOwnPropertyDescriptor(data, '__proto__')?.value).toEqual({ isAdmin: true });
      expect(data['constructor']).toBe('c');
      expect(data['toString']).toBe('t');
      expect(data['user']).toBe('x');
    });
  });

  it('keeps createLogger() output to the six logger methods', () => {
    expect(Object.keys(createLogger(createRecordingPort())).sort()).toEqual(
      ['error', 'fatal', 'info', 'log', 'trace', 'warn'].sort(),
    );
  });
});
