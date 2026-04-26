/* eslint-disable import/order */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from '@zacatl/third-party/zod';

import type { HookHandler, RouteHandler } from '../../../../../../src/service/layers/application';
import { ExpressApiAdapter } from '../../../../../../src/service/platforms/server/api/adapters';

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
  let adapter: ExpressApiAdapter;
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
    adapter = new ExpressApiAdapter(mockServer as never);
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
