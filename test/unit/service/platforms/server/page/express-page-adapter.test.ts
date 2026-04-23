import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ExpressPageAdapter } from '../../../../../../src/service/platforms/server/page/adapters';

describe('ExpressPageAdapter', () => {
  let adapter: ExpressPageAdapter;
  let mockServer: any;
  let middlewareHandler: (req: any, res: any, next: any) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = {
      use: vi.fn((_, handler) => {
        if (typeof handler === 'function') {
          middlewareHandler = handler;
        }
      }),
    };
    adapter = new ExpressPageAdapter(mockServer);
  });

  describe('registerStaticFiles', () => {
    it('should serve static files from root by default', () => {
      adapter.registerStaticFiles({ root: '/dist/client' });

      expect(mockServer.use).toHaveBeenCalledOnce();
      const [prefix] = mockServer.use.mock.calls[0];
      expect(prefix).toBe('/');
    });

    it('should use provided prefix when given', () => {
      adapter.registerStaticFiles({ root: '/dist/client', prefix: '/assets' });

      const [prefix] = mockServer.use.mock.calls[0];
      expect(prefix).toBe('/assets');
    });
  });

  describe('registerSpaFallback', () => {
    beforeEach(() => {
      mockServer.use = vi.fn((handler) => {
        middlewareHandler = handler;
      });
      adapter = new ExpressPageAdapter(mockServer);
      adapter.registerSpaFallback('/api', '/dist/client');
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
      const res = { sendFile: vi.fn() };
      const next = vi.fn();

      middlewareHandler(req, res, next);

      expect(res.sendFile).toHaveBeenCalledWith('index.html', { root: '/dist/client' });
    });

    it('should serve index.html for root route', () => {
      const req = { path: '/', method: 'GET' };
      const res = { sendFile: vi.fn() };
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
