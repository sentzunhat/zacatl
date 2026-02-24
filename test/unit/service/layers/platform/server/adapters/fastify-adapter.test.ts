import { describe, it, expect, vi, beforeEach } from 'vitest';
import { z } from 'zod';

import type {
  RouteHandler,
  HookHandler,
} from '../../../../../../../src/service/layers/application';
import { FastifyApiAdapter } from '../../../../../../../src/service/platforms/server/api/adapters';

describe('FastifyApiAdapter', () => {
  let adapter: FastifyApiAdapter;
  let mockServer: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = {
      withTypeProvider: vi.fn().mockReturnThis(),
      route: vi.fn(),
      addHook: vi.fn(),
      register: vi.fn().mockResolvedValue(undefined),
    };
    adapter = new FastifyApiAdapter(mockServer);
  });

  describe('registerRoute', () => {
    it('should register a GET route with the correct configuration', () => {
      const handler: RouteHandler = {
        method: 'GET',
        url: '/api/users',
        schema: {
          querystring: z.object({ skip: z.number().default(0) }),
        },
        execute: vi.fn(),
      } as any;

      adapter.registerRoute(handler);

      expect(mockServer.withTypeProvider).toHaveBeenCalled();
      expect(mockServer.route).toHaveBeenCalledWith({
        url: '/api/users',
        method: 'GET',
        schema: handler.schema,
        handler: expect.any(Function),
      });
    });

    it('should register a POST route with request body validation', () => {
      const handler: RouteHandler = {
        method: 'POST',
        url: '/api/users',
        schema: {
          body: z.object({ name: z.string(), email: z.string().email() }),
        },
        execute: vi.fn().mockResolvedValue({ id: '123' }),
      } as any;

      adapter.registerRoute(handler);

      expect(mockServer.route).toHaveBeenCalledWith({
        url: '/api/users',
        method: 'POST',
        schema: handler.schema,
        handler: expect.any(Function),
      });
    });

    it('should register a DELETE route', () => {
      const handler: RouteHandler = {
        method: 'DELETE',
        url: '/api/users/:id',
        execute: vi.fn().mockResolvedValue({ deleted: true }),
      } as any;

      adapter.registerRoute(handler);

      expect(mockServer.route).toHaveBeenCalledWith({
        url: '/api/users/:id',
        method: 'DELETE',
        schema: undefined,
        handler: expect.any(Function),
      });
    });

    it('should register a PATCH route with partial schema', () => {
      const handler: RouteHandler = {
        method: 'PATCH',
        url: '/api/users/:id',
        schema: {
          body: z.object({ name: z.string().optional() }),
          params: z.object({ id: z.string() }),
        },
        execute: vi.fn(),
      } as any;

      adapter.registerRoute(handler);

      expect(mockServer.route).toHaveBeenCalledWith({
        url: '/api/users/:id',
        method: 'PATCH',
        schema: handler.schema,
        handler: expect.any(Function),
      });
    });

    it('should bind the handler execute method to the handler context', () => {
      const executeSpy = vi.fn().mockResolvedValue({});
      const handler: RouteHandler = {
        method: 'GET',
        url: '/test',
        execute: executeSpy,
      } as any;

      adapter.registerRoute(handler);

      const registeredHandler = mockServer.route.mock.calls[0][0].handler;
      expect(registeredHandler).toBeDefined();
    });
  });

  describe('registerHook', () => {
    it('should register a preHandler hook', () => {
      const handler: HookHandler = {
        name: 'preHandler',
        execute: vi.fn(),
      } as any;

      adapter.registerHook(handler);

      expect(mockServer.addHook).toHaveBeenCalledWith('preHandler', expect.any(Function));
    });

    it('should register an onRequest hook', () => {
      const handler: HookHandler = {
        name: 'onRequest',
        execute: vi.fn(),
      } as any;

      adapter.registerHook(handler);

      expect(mockServer.addHook).toHaveBeenCalledWith('onRequest', expect.any(Function));
    });

    it('should register multiple hooks in sequence', () => {
      const handler1: HookHandler = {
        name: 'onRequest',
        execute: vi.fn(),
      } as any;

      const handler2: HookHandler = {
        name: 'preHandler',
        execute: vi.fn(),
      } as any;

      adapter.registerHook(handler1);
      adapter.registerHook(handler2);

      expect(mockServer.addHook).toHaveBeenCalledTimes(2);
    });
  });

  describe('registerProxy', () => {
    it('should register a proxy with basic configuration', async () => {
      await adapter.registerProxy({
        upstream: 'http://api.example.com',
        prefix: '/api',
      });

      expect(mockServer.register).toHaveBeenCalledWith(expect.any(Function), {
        upstream: 'http://api.example.com',
        prefix: '/api',
      });
    });

    it('should register a proxy with rewritePrefix', async () => {
      await adapter.registerProxy({
        upstream: 'http://api.example.com',
        prefix: '/api',
        rewritePrefix: '/v1',
      });

      expect(mockServer.register).toHaveBeenCalledWith(expect.any(Function), {
        upstream: 'http://api.example.com',
        prefix: '/api',
        rewritePrefix: '/v1',
      });
    });

    it('should register a proxy with http2 enabled', async () => {
      await adapter.registerProxy({
        upstream: 'http://api.example.com',
        prefix: '/api',
        http2: true,
      });

      expect(mockServer.register).toHaveBeenCalledWith(expect.any(Function), {
        upstream: 'http://api.example.com',
        prefix: '/api',
        http2: true,
      });
    });

    it('should register a proxy with http2 disabled', async () => {
      await adapter.registerProxy({
        upstream: 'http://api.example.com',
        prefix: '/api',
        http2: false,
      });

      expect(mockServer.register).toHaveBeenCalledWith(expect.any(Function), {
        upstream: 'http://api.example.com',
        prefix: '/api',
        http2: false,
      });
    });

    it('should handle multiple proxies', async () => {
      await adapter.registerProxy({
        upstream: 'http://service1.example.com',
        prefix: '/service1',
      });

      await adapter.registerProxy({
        upstream: 'http://service2.example.com',
        prefix: '/service2',
      });

      expect(mockServer.register).toHaveBeenCalledTimes(2);
    });
  });

  describe('Edge Cases and Scenarios', () => {
    it('should handle routes with complex nested paths', () => {
      const handler: RouteHandler = {
        method: 'GET',
        url: '/api/v1/users/:userId/posts/:postId/comments/:commentId',
        schema: {
          params: z.object({
            userId: z.string().uuid(),
            postId: z.string().uuid(),
            commentId: z.string().uuid(),
          }),
        },
        execute: vi.fn(),
      } as any;

      adapter.registerRoute(handler);

      expect(mockServer.route).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/api/v1/users/:userId/posts/:postId/comments/:commentId',
          method: 'GET',
        }),
      );
    });

    it('should handle routes with wildcard patterns', () => {
      const handler: RouteHandler = {
        method: 'GET',
        url: '/files/*',
        execute: vi.fn(),
      } as any;

      adapter.registerRoute(handler);

      expect(mockServer.route).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/files/*',
        }),
      );
    });

    it('should handle schema with all validation types', () => {
      const handler: RouteHandler = {
        method: 'POST',
        url: '/api/users/:id',
        schema: {
          body: z.object({ name: z.string() }),
          params: z.object({ id: z.string() }),
          querystring: z.object({ filter: z.string().optional() }),
        },
        execute: vi.fn(),
      } as any;

      adapter.registerRoute(handler);

      expect(mockServer.route).toHaveBeenCalledWith(
        expect.objectContaining({
          schema: handler.schema,
        }),
      );
    });

    it('should maintain handler context when binding', () => {
      const contextData = { userId: '123' };
      const executeSpy = vi.fn().mockReturnValue(contextData);

      const handler: RouteHandler = {
        method: 'GET',
        url: '/test',
        execute: executeSpy,
        userId: '123',
      } as any;

      adapter.registerRoute(handler);

      const registeredHandler = mockServer.route.mock.calls[0][0].handler;
      expect(typeof registeredHandler).toBe('function');
    });
  });
});
