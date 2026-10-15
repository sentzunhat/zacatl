import type { AddressInfo } from 'node:net';

import express, { type NextFunction, type Request, type Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { z } from '@zacatl/third-party/zod';

import type { RouteHandler } from '../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/route-handler';
import { createApiAdapter } from '../../../../../../../src/service/platforms/server/providers/express/api-adapter';

// EXPRESS-400: a request that fails the route's Zod schema must answer 400 on
// Express, like Fastify does, instead of falling through to a 500.
// eslint-disable-next-line @typescript-eslint/naming-convention -- real HTTP header name
const jsonHeaders = { 'content-type': 'application/json' };

describe('Express adapter request validation status', () => {
  let close: (() => Promise<void>) | undefined;

  afterEach(async () => {
    await close?.();
    close = undefined;
  });

  const start = async (
    handler: RouteHandler,
    errorHandler?: (
      err: Error & { statusCode?: number },
      req: Request,
      res: Response,
      next: NextFunction,
    ) => void,
  ): Promise<string> => {
    const app = express();
    app.use(express.json());
    createApiAdapter(app).registerRoute(handler);
    if (errorHandler != null) app.use(errorHandler);

    const server = app.listen(0, '127.0.0.1');
    await new Promise<void>((resolve) => server.once('listening', resolve));
    close = (): Promise<void> => new Promise<void>((resolve) => server.close(() => resolve()));
    return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  };

  const greetingHandler = (): RouteHandler =>
    ({
      method: 'POST',
      url: '/greetings/:id',
      schema: {
        body: z.object({ language: z.string() }),
        querystring: z.object({ page: z.coerce.number().int().positive() }).partial(),
        params: z.object({ id: z.string().uuid() }),
      },
      execute: vi.fn(
        async (_req: unknown, reply: { code: (n: number) => { send: (p: unknown) => void } }) => {
          reply.code(201).send({ ok: true });
        },
      ),
    }) as unknown as RouteHandler;

  const validId = '6f1c2b3a-4d5e-4f60-8a7b-9c0d1e2f3a4b';

  // Same shape as the express-* examples' centralized error handler.
  const exampleErrorHandler = (
    err: Error & { statusCode?: number },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ): void => {
    const statusCode = err.statusCode ?? 500;
    res
      .status(statusCode)
      .json({
        error: { message: statusCode >= 500 ? 'Internal Server Error' : err.message, statusCode },
      });
  };

  it('answers 400 for an invalid body through an app error handler that reads statusCode', async () => {
    const handler = greetingHandler();
    const url = await start(handler, exampleErrorHandler);

    const res = await fetch(`${url}/greetings/${validId}`, {
      method: 'POST',
      headers: jsonHeaders,
      body: '{}',
    });

    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { message: string; statusCode: number } };
    expect(body.error.statusCode).toBe(400);
    expect(body.error.message).toContain('body/language');
    expect(handler.execute).not.toHaveBeenCalled();
  });

  it("answers 400 through Express's default error handler (err.status)", async () => {
    const url = await start(greetingHandler());

    const res = await fetch(`${url}/greetings/${validId}`, {
      method: 'POST',
      headers: jsonHeaders,
      body: '{}',
    });

    expect(res.status).toBe(400);
  });

  it('answers 400 for invalid querystring and params', async () => {
    const url = await start(greetingHandler(), exampleErrorHandler);
    const post = (path: string): Promise<globalThis.Response> =>
      fetch(`${url}${path}`, {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify({ language: 'en' }),
      });

    const badQuery = await post(`/greetings/${validId}?page=-1`);
    expect(badQuery.status).toBe(400);
    expect(((await badQuery.json()) as { error: { message: string } }).error.message).toContain(
      'querystring/page',
    );

    const badParams = await post('/greetings/not-a-uuid');
    expect(badParams.status).toBe(400);
    expect(((await badParams.json()) as { error: { message: string } }).error.message).toContain(
      'params/id',
    );
  });

  it('leaves valid requests unchanged', async () => {
    const handler = greetingHandler();
    const url = await start(handler, exampleErrorHandler);

    const res = await fetch(`${url}/greetings/${validId}?page=2`, {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify({ language: 'en' }),
    });

    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ ok: true });
    expect(handler.execute).toHaveBeenCalledOnce();
  });

  it('keeps non-validation handler errors on the existing 500 path', async () => {
    const handler = {
      method: 'GET',
      url: '/boom',
      execute: vi.fn(async () => {
        throw new Error('boom');
      }),
    } as unknown as RouteHandler;
    const url = await start(handler, exampleErrorHandler);

    const res = await fetch(`${url}/boom`);

    expect(res.status).toBe(500);
  });
});
