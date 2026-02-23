import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExpressApiAdapter } from '../../../../../../../src/service/platforms/server/api/adapters';
import { RouteHandler } from '../../../../../../../src/service/layers/application';
import { z } from 'zod';

// Mock http-proxy-middleware
vi.mock('http-proxy-middleware', () => ({
  createProxyMiddleware: vi.fn().mockReturnValue('proxy-middleware'),
}));

import { createProxyMiddleware } from 'http-proxy-middleware';

describe('ExpressApiAdapter', () => {
  let adapter: ExpressApiAdapter;
  let mockServer: any;

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
    adapter = new ExpressApiAdapter(mockServer);
  });

  describe('registerRoute', () => {
    it('should register a route with the correct method and url', () => {
      const handler: RouteHandler = {
        method: 'GET',
        url: '/test',
        handler: vi.fn(),
      } as any;

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
        execute: vi.fn().mockImplementation(async (_req, reply: any) => {
          // Handler calls reply.send() which translates to res.json()
          await reply.code(200).send({ success: true });
          return { success: true };
        }),
      } as any;

      adapter.registerRoute(handler);

      // Get the callback registered with express
      const callback = mockServer.post.mock.calls[0][1];

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

      await callback(req, res, next);

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
      } as any;

      adapter.registerRoute(handler);

      const callback = mockServer.post.mock.calls[0][1];

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

      await callback(req, res, next);

      expect(handler.execute).not.toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('registerHook', () => {
    it('should register middleware for hooks', () => {
      const handler: any = {
        name: 'onRequest',
        execute: vi.fn(),
      };
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
