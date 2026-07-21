/* eslint-disable import/order */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from '@zacatl/third-party/zod';

import type { HookHandler } from '../../../../../../../src/service/layers/application/entry-points/rest/hook-handlers/hook-handler';
import type { RouteHandler } from '../../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/route-handler';
import { createApiAdapter } from '../../../../../../../src/service/platforms/server/providers/express/api-adapter';

// Mock http-proxy-middleware
vi.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: vi.fn().mockReturnValue('proxy-middleware'),
}));

import { createProxyMiddleware } from 'http-proxy-middleware';

/* eslint-enable import/order */

type MockExpressServer = {
  get: ReturnType<typeof vi.fn>;
  post: ReturnType<typeof vi.fn>;
  put: ReturnType<typeof vi.fn>;
  delete: ReturnType<typeof vi.fn>;
  patch: ReturnType<typeof vi.fn>;
  use: ReturnType<typeof vi.fn>;
  all: ReturnType<typeof vi.fn>;
};

describe('ExpressApiAdapter', () => {
  let adapter: ReturnType<typeof createApiAdapter>;
  let mockServer: MockExpressServer;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      use: vi.fn(),
      all: vi.fn(),
    };
    adapter = createApiAdapter(mockServer as never);
  });

  describe('registerRoute', () => {
    it('should register a route with the correct method and url', () => {
      const handler: RouteHandler = {
        method: 'GET',
        url: '/test',
        execute: vi.fn(),
      } as unknown as RouteHandler;

      adapter.registerRoute(handler);

      expect(mockServer.get).toHaveBeenCalledWith('/test', expect.any(Function));
    });

    it('should handle request validation and call handler', async () => {
      const handler: RouteHandler = {
        method: 'POST',
        url: '/validate',
        schema: {
          body: z.object({ name: z.string() }),
        },
        execute: vi
          .fn()
          .mockImplementation(
            async (
              _req,
              reply: { code: (statusCode: number) => { send: (payload: unknown) => unknown } },
            ) => {
              // Handler calls reply.send() which translates to res.json()
              await reply.code(200).send({ success: true });
              return { success: true };
            },
          ),
      } as unknown as RouteHandler;

      adapter.registerRoute(handler);

      // Get the callback registered with express
      const callback = mockServer.post.mock.calls[0]?.[1];
      expect(callback).toBeDefined();

      const req = {
        body: { name: 'Valid' },
        query: {},
        params: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        send: vi.fn(),
        setHeader: vi.fn(),
        headersSent: false,
      };
      const next = vi.fn();

      await (callback as (...args: unknown[]) => Promise<void>)(req, res, next);

      expect(handler.execute).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ success: true });
    });

    it('should handle validation errors', async () => {
      const handler: RouteHandler = {
        method: 'POST',
        url: '/validate',
        schema: {
          body: z.object({ name: z.string() }),
        },
        execute: vi.fn(),
      } as unknown as RouteHandler;

      adapter.registerRoute(handler);

      const callback = mockServer.post.mock.calls[0]?.[1];
      expect(callback).toBeDefined();

      const req = {
        body: { name: 123 }, // Invalid type
        query: {},
        params: {},
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        setHeader: vi.fn(),
        headersSent: false,
      };
      const next = vi.fn();

      await (callback as (...args: unknown[]) => Promise<void>)(req, res, next);

      expect(handler.execute).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('registerHook', () => {
    it('should register middleware for hooks', () => {
      const handler: HookHandler = {
        name: 'onRequest',
        execute: vi.fn(),
      } as unknown as HookHandler;
      adapter.registerHook(handler);
      expect(mockServer.use).toHaveBeenCalled();
    });

    it('skips unsupported hook names without registering middleware', () => {
      const handler: HookHandler = {
        name: 'onSend',
        execute: vi.fn(),
      } as unknown as HookHandler;
      adapter.registerHook(handler);
      expect(mockServer.use).not.toHaveBeenCalled();
    });

    it('forwards hook execution errors to next()', async () => {
      const handler: HookHandler = {
        name: 'preHandler',
        execute: vi.fn().mockRejectedValue(new Error('hook-fail')),
      } as unknown as HookHandler;
      adapter.registerHook(handler);

      const middleware = mockServer.use.mock.calls[0]?.[0] as (
        req: unknown,
        res: unknown,
        next: (err?: unknown) => void,
      ) => Promise<void>;
      const next = vi.fn();
      await middleware({}, {}, next);
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });

    it('calls next() with no args on hook success', async () => {
      const handler: HookHandler = {
        name: 'onRequest',
        execute: vi.fn().mockResolvedValue(undefined),
      } as unknown as HookHandler;
      adapter.registerHook(handler);

      const middleware = mockServer.use.mock.calls[0]?.[0] as (
        req: unknown,
        res: unknown,
        next: (err?: unknown) => void,
      ) => Promise<void>;
      const next = vi.fn();
      await middleware({}, {}, next);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('route registration edge cases', () => {
    it('skips handlers with methods Express does not support', () => {
      const handler: RouteHandler = {
        method: 'SUBSCRIBE',
        url: '/events',
        execute: vi.fn(),
      } as unknown as RouteHandler;

      adapter.registerRoute(handler);

      expect(mockServer.get).not.toHaveBeenCalled();
      expect(mockServer.use).not.toHaveBeenCalled();
    });

    it('prefixes route urls when apiPrefix is configured', () => {
      const prefixed = createApiAdapter(mockServer as never, '/api');
      const handler: RouteHandler = {
        method: 'GET',
        url: 'items',
        execute: vi.fn(),
      } as unknown as RouteHandler;

      prefixed.registerRoute(handler);

      expect(mockServer.get).toHaveBeenCalledWith('/api/items', expect.any(Function));
    });

    it('responds 204 when the handler sends nothing', async () => {
      const handler: RouteHandler = {
        method: 'GET',
        url: '/empty',
        execute: vi.fn().mockResolvedValue(undefined),
      } as unknown as RouteHandler;
      adapter.registerRoute(handler);

      const routeFn = mockServer.get.mock.calls[0]?.[1] as (
        req: unknown,
        res: unknown,
        next: (err?: unknown) => void,
      ) => Promise<void>;
      const res = { headersSent: false, status: vi.fn().mockReturnThis(), end: vi.fn(), json: vi.fn(), setHeader: vi.fn() };
      await routeFn({}, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.end).toHaveBeenCalled();
    });

    it('reply adapter maps code/send/header onto the Express response', async () => {
      const handler: RouteHandler = {
        method: 'GET',
        url: '/reply',
        execute: vi.fn(async (_req: unknown, reply: { code: (n: number) => { send: (p: unknown) => void }; header: (k: string, v: string) => unknown }) => {
          reply.header('X-Test', 'yes');
          reply.code(201).send({ ok: true });
        }),
      } as unknown as RouteHandler;
      adapter.registerRoute(handler);

      const routeFn = mockServer.get.mock.calls[0]?.[1] as (
        req: unknown,
        res: unknown,
        next: (err?: unknown) => void,
      ) => Promise<void>;
      const res = { headersSent: false, status: vi.fn().mockReturnThis(), end: vi.fn(), json: vi.fn(), setHeader: vi.fn() };
      await routeFn({}, res, vi.fn());

      expect(res.setHeader).toHaveBeenCalledWith('X-Test', 'yes');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ ok: true });
    });
  });

  describe('listen/close/getRawServer', () => {
    it('listen resolves when the server starts and close shuts it down', async () => {
      const fakeHttpServer = {
        on: vi.fn().mockReturnThis(),
        close: vi.fn((cb: (err?: Error) => void) => cb()),
      };
      const listeningServer = {
        ...mockServer,
        listen: vi.fn((_port: number, _host: string, cb: () => void) => {
          cb();
          return fakeHttpServer;
        }),
      };
      const a = createApiAdapter(listeningServer as never);

      await expect(a.listen(0)).resolves.toBeUndefined();
      await expect(a.close()).resolves.toBeUndefined();
      expect(fakeHttpServer.close).toHaveBeenCalled();
    });

    it('close is a no-op before listen', async () => {
      await expect(adapter.close()).resolves.toBeUndefined();
    });

    it('getRawServer returns the underlying Express instance', () => {
      expect(adapter.getRawServer()).toBe(mockServer);
    });
  });

  describe('registerProxy', () => {
    it('should apply proxy middleware', () => {
      const config = {
        upstream: 'http://upstream',
        prefix: '/api',
        rewritePrefix: '/remote',
      };

      adapter.registerProxy(config);

      expect(createProxyMiddleware).toHaveBeenCalledWith({
        target: 'http://upstream',
        changeOrigin: true,
        pathRewrite: expect.any(Object),
      });
      expect(mockServer.use).toHaveBeenCalledWith('/api', 'proxy-middleware');
    });
  });
});
