import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';

import { createPageAdapter } from '../../../../../../../src/service/platforms/server/providers/express/page-adapter';

type MockExpressServer = {
  use: ReturnType<typeof vi.fn>;
};

type MiddlewareRequest = { path: string; method: string };
type MiddlewareResponse = Record<string, unknown>;
type MiddlewareNext = () => void;
type MiddlewareHandler = (
  req: MiddlewareRequest,
  res: MiddlewareResponse,
  next: MiddlewareNext,
) => void;

describe('ExpressPageAdapter', () => {
  let adapter: ReturnType<typeof createPageAdapter>;
  let mockServer: MockExpressServer;
  let middlewareHandler: MiddlewareHandler = () => {};

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = {
      use: vi.fn((_: unknown, handler: unknown) => {
        if (typeof handler === 'function') {
          middlewareHandler = handler as MiddlewareHandler;
        }
      }),
    };
    adapter = createPageAdapter(mockServer as never);
  });

  describe('registerStaticFiles', () => {
    it('should serve static files from root by default', () => {
      adapter.registerStaticFiles({ root: '/dist/client' });

      expect(mockServer.use).toHaveBeenCalledOnce();
      const firstCall = mockServer.use.mock.calls[0];
      expect(firstCall).toBeDefined();
      const [prefix] = firstCall as unknown[];
      expect(prefix).toBe('/');
    });

    it('should use provided prefix when given', () => {
      adapter.registerStaticFiles({ root: '/dist/client', prefix: '/assets' });

      const firstCall = mockServer.use.mock.calls[0];
      expect(firstCall).toBeDefined();
      const [prefix] = firstCall as unknown[];
      expect(prefix).toBe('/assets');
    });

    it('should pass cache options to express.static and no-cache html via setHeaders', () => {
      const staticSpy = vi.spyOn(express, 'static');
      adapter.registerStaticFiles({ root: '/dist/client', cache: { maxAge: '1y', immutable: true } });

      const opts = staticSpy.mock.calls[0]?.[1] as {
        maxAge?: string;
        immutable?: boolean;
        setHeaders?: (res: unknown, path: string) => void;
      };
      expect(opts.maxAge).toBe('1y');
      expect(opts.immutable).toBe(true);

      const res = { setHeader: vi.fn() };
      opts.setHeaders?.(res, '/dist/client/index.html');
      expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-cache');
      res.setHeader.mockClear();
      opts.setHeaders?.(res, '/dist/client/assets/app-abc123.js');
      expect(res.setHeader).not.toHaveBeenCalled();
      staticSpy.mockRestore();
    });
  });

  describe('registerSpaFallback', () => {
    beforeEach(() => {
      mockServer.use = vi.fn((handler: unknown) => {
        middlewareHandler = handler as MiddlewareHandler;
      });
      adapter = createPageAdapter(mockServer as never);
      adapter.registerSpaFallback({ api: '/api' }, '/dist/client');
    });

    it('should return 404 json for API routes', () => {
      const req = { path: '/api/users', method: 'GET' };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      middlewareHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ code: 404, error: 'Not Found' }),
      );
    });

    it('should serve index.html for SPA deep link routes', () => {
      const req = { path: '/patients/123', method: 'GET' };
      const res = { sendFile: vi.fn(), setHeader: vi.fn() };
      const next = vi.fn();

      middlewareHandler(req, res, next);

      expect(res.sendFile).toHaveBeenCalledWith('index.html', { root: '/dist/client' });
    });

    it('should serve index.html for root route', () => {
      const req = { path: '/', method: 'GET' };
      const res = { sendFile: vi.fn(), setHeader: vi.fn() };
      const next = vi.fn();

      middlewareHandler(req, res, next);

      expect(res.sendFile).toHaveBeenCalledWith('index.html', { root: '/dist/client' });
    });

    it('should not fall back for API subroutes', () => {
      const req = { path: '/api/health/check', method: 'GET' };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      const next = vi.fn();

      middlewareHandler(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('register', () => {
    it('should resolve without error', async () => {
      await expect(adapter.register()).resolves.toBeUndefined();
    });
  });
});
