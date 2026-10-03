import { Writable } from 'node:stream';

import Fastify, { type FastifyInstance, type FastifyReply } from 'fastify';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

import { NotFoundError } from '../../../../../../../../src/error';
import type { Logger } from '../../../../../../../../src/logs/types';
import type { Request } from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/abstract';
import { GetRouteHandler } from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/get-route-handler';
import { PostRouteHandler } from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/post-route-handler';
import type { RouteHandler } from '../../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/route-handler';
import { createApiAdapter } from '../../../../../../../../src/service/platforms/server/providers/fastify/api-adapter';

type LogLine = { level: number; msg?: string; code?: string; err?: { code?: string } };

class GetItemHandler extends GetRouteHandler<void, void, { id: string }> {
  constructor() {
    super({ url: '/items', schema: {} });
  }

  async handler(): Promise<{ id: string }> {
    return { id: 'item-1' };
  }
}

class CreateItemHandler extends PostRouteHandler<{ name: string }, void, { name: string }> {
  constructor() {
    super({ url: '/items', schema: {} });
  }

  async handler(request: Request<{ name: string }>): Promise<{ name: string }> {
    return { name: request.body.name };
  }
}

class MissingItemHandler extends GetRouteHandler<void, void, { id: string }> {
  constructor() {
    super({ url: '/missing', schema: {} });
  }

  async handler(): Promise<{ id: string }> {
    throw new NotFoundError({ message: 'Item not found', reason: 'test' });
  }
}

class BrokenItemHandler extends GetRouteHandler<void, void, { id: string }> {
  constructor() {
    super({ url: '/broken', schema: {} });
  }

  async handler(): Promise<{ id: string }> {
    throw new Error('boom');
  }
}

// Consumer pattern (e.g. a POST handler returning 201): override execute() to set a
// status code and keep the typed `Promise<TResponse>` return. Must still compile.
class CreatedItemHandler extends PostRouteHandler<{ name: string }, void, { name: string }> {
  constructor() {
    super({ url: '/created', schema: {} });
  }

  override async execute(
    request: Request<{ name: string }>,
    reply: FastifyReply,
  ): Promise<{ name: string }> {
    reply.code(201);
    return super.execute(request, reply);
  }

  async handler(request: Request<{ name: string }>): Promise<{ name: string }> {
    return { name: request.body.name };
  }
}

// A RouteHandler implemented without AbstractRouteHandler that leaves sending
// to Fastify by returning its payload.
const plainHandler: RouteHandler = {
  url: '/plain',
  method: 'GET',
  schema: {},
  execute: async () => ({ plain: true }),
};

// A RouteHandler that throws before sending anything; the adapter must hand the
// error to Fastify's error handler instead of swallowing it.
const throwingPlainHandler: RouteHandler = {
  url: '/plain-throws',
  method: 'GET',
  schema: {},
  execute: async () => {
    throw new Error('plain handler failed');
  },
};

const makeServiceLogger = (): { [K in keyof Logger]: Mock<Logger[K]> } => ({
  log: vi.fn<Logger['log']>(),
  info: vi.fn<Logger['info']>(),
  trace: vi.fn<Logger['trace']>(),
  warn: vi.fn<Logger['warn']>(),
  error: vi.fn<Logger['error']>(),
  fatal: vi.fn<Logger['fatal']>(),
});

const isDoubleSendLog = (line: LogLine): boolean =>
  line.code === 'FST_ERR_REP_ALREADY_SENT' ||
  line.err?.code === 'FST_ERR_REP_ALREADY_SENT' ||
  (line.msg ?? '').includes('Reply was already sent') ||
  (line.msg ?? '').includes('reply.sent = true');

describe('Fastify route reply lifecycle (real Fastify)', () => {
  let app: FastifyInstance;
  let logs: LogLine[];
  let serviceLogger: ReturnType<typeof makeServiceLogger>;

  beforeEach(async () => {
    logs = [];
    const stream = new Writable({
      write(chunk: Buffer, _encoding, callback): void {
        for (const raw of chunk.toString().split('\n')) {
          if (raw.trim() !== '') {
            logs.push(JSON.parse(raw) as LogLine);
          }
        }
        callback();
      },
    });

    app = Fastify({ logger: { level: 'trace', stream } });
    serviceLogger = makeServiceLogger();
    const adapter = createApiAdapter(app, '', serviceLogger);
    adapter.registerRoute(new GetItemHandler());
    adapter.registerRoute(new CreateItemHandler());
    adapter.registerRoute(new MissingItemHandler());
    adapter.registerRoute(new BrokenItemHandler());
    adapter.registerRoute(new CreatedItemHandler());
    adapter.registerRoute(plainHandler);
    adapter.registerRoute(throwingPlainHandler);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('sends a GET response once without FST_ERR_REP_ALREADY_SENT', async () => {
    const response = await app.inject({ method: 'GET', url: '/items' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ id: 'item-1' });
    expect(logs.filter(isDoubleSendLog)).toEqual([]);
    expect(logs.filter((line) => line.level >= 40)).toEqual([]);
  });

  it('sends a POST response once without FST_ERR_REP_ALREADY_SENT', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/items',
      payload: { name: 'widget' },
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ name: 'widget' });
    expect(logs.filter(isDoubleSendLog)).toEqual([]);
    expect(logs.filter((line) => line.level >= 40)).toEqual([]);
  });

  it('sends a mapped 4xx error once without double-send logs', async () => {
    const response = await app.inject({ method: 'GET', url: '/missing' });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({ message: 'Item not found' });
    expect(logs.filter(isDoubleSendLog)).toEqual([]);
    expect(logs.filter((line) => line.level >= 40)).toEqual([]);
    expect(serviceLogger.info).toHaveBeenCalledTimes(1);
    expect(serviceLogger.info).toHaveBeenCalledWith('Route handler rejected request', {
      data: expect.objectContaining({
        reqId: expect.any(String),
        method: 'GET',
        url: '/missing',
        statusCode: 404,
        err: expect.objectContaining({ message: 'Item not found' }),
      }),
    });
  });

  it('keeps status codes set by execute() overrides', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/created',
      payload: { name: 'widget' },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ name: 'widget' });
    expect(logs.filter(isDoubleSendLog)).toEqual([]);
    expect(logs.filter((line) => line.level >= 40)).toEqual([]);
  });

  it('still sends payloads returned by handlers that do not send themselves', async () => {
    const response = await app.inject({ method: 'GET', url: '/plain' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ plain: true });
    expect(logs.filter((line) => line.level >= 40)).toEqual([]);
  });

  it('passes errors from handlers that did not send to Fastify', async () => {
    const response = await app.inject({ method: 'GET', url: '/plain-throws' });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toMatchObject({ message: 'plain handler failed' });
    const errorLogs = logs.filter((line) => line.level >= 50);
    expect(errorLogs).toHaveLength(1);
    expect(errorLogs[0]?.msg).not.toBe('Route handler failed');
  });

  it('logs 5xx handler errors once at error level', async () => {
    const response = await app.inject({ method: 'GET', url: '/broken' });

    expect(response.statusCode).toBe(500);
    expect(logs.filter(isDoubleSendLog)).toEqual([]);
    // Logged once, through the Service's logger (not Fastify's).
    expect(logs.filter((line) => line.level >= 50)).toEqual([]);
    expect(serviceLogger.error).toHaveBeenCalledTimes(1);
    expect(serviceLogger.error).toHaveBeenCalledWith('Route handler failed', {
      data: expect.objectContaining({
        statusCode: 500,
        err: expect.objectContaining({ type: 'Error', message: 'boom' }),
      }),
    });
  });
});
