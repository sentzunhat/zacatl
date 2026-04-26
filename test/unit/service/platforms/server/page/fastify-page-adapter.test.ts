import { describe, it, expect, vi, beforeEach } from 'vitest';

import { FastifyPageAdapter } from '../../../../../../src/service/platforms/server/page/adapters';

type MockFastifyServer = {
  register: ReturnType<typeof vi.fn>;
  setNotFoundHandler: ReturnType<typeof vi.fn>;
  sendFile: ReturnType<typeof vi.fn>;
};

type NotFoundRequest = {
  raw: { url?: string };
  method: string;
  url?: string;
};
type NotFoundReply = Record<string, unknown>;
type NotFoundHandler = (request: NotFoundRequest, reply: NotFoundReply) => Promise<void>;

describe('FastifyPageAdapter', () => {
  let adapter: FastifyPageAdapter;
  let mockServer: MockFastifyServer;
  let notFoundHandler: NotFoundHandler = async () => {};

  beforeEach(() => {
    vi.clearAllMocks();
    mockServer = {
      register: vi.fn(),
      setNotFoundHandler: vi.fn((fn: unknown) => {
        notFoundHandler = fn as NotFoundHandler;
      }),
      sendFile: vi.fn(),
    };
    adapter = new FastifyPageAdapter(mockServer as never);
  });

  describe('registerStaticFiles', () => {
    it('should register fastify-static with the given root', () => {
      adapter.registerStaticFiles({ root: '/dist/client' });

      expect(mockServer.register).toHaveBeenCalledOnce();
      const [, options] = mockServer.register.mock.calls[0];
      expect(options.root).toBe('/dist/client');
    });

    it('should include prefix when provided', () => {
      adapter.registerStaticFiles({ root: '/dist/client', prefix: '/assets/' });

      const [, options] = mockServer.register.mock.calls[0];
      expect(options.prefix).toBe('/assets/');
    });

    it('should not include prefix when not provided', () => {
      adapter.registerStaticFiles({ root: '/dist/client' });

      const [, options] = mockServer.register.mock.calls[0];
      expect(options.prefix).toBeUndefined();
    });
  });

  describe('registerSpaFallback', () => {
    beforeEach(() => {
      adapter.registerSpaFallback('/api', '/dist/client');
    });

    it('should call setNotFoundHandler once', () => {
      expect(mockServer.setNotFoundHandler).toHaveBeenCalledOnce();
    });

    it('should return structured 404 for API routes', async () => {
      const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
      const request = { raw: { url: '/api/users' }, method: 'GET', url: '/api/users' };

      await notFoundHandler(request, reply);

      expect(reply.status).toHaveBeenCalledWith(404);
      expect(reply.send).toHaveBeenCalledWith(
        expect.objectContaining({ code: 404, error: 'Not Found' }),
      );
    });

    it('should serve asset files for /assets/ paths', async () => {
      const reply = { sendFile: vi.fn(), type: vi.fn() };
      const request = { raw: { url: '/assets/main.js' }, method: 'GET', url: '/assets/main.js' };

      await notFoundHandler(request, reply);

      expect(reply.sendFile).toHaveBeenCalledWith('assets/main.js', '/dist/client');
    });

    it('should serve index.html for SPA deep link routes', async () => {
      const reply = { sendFile: vi.fn(), type: vi.fn() };
      const request = { raw: { url: '/patients/123' }, method: 'GET', url: '/patients/123' };

      await notFoundHandler(request, reply);

      expect(reply.type).toHaveBeenCalledWith('text/html; charset=utf-8');
      expect(reply.sendFile).toHaveBeenCalledWith('index.html', '/dist/client');
    });

    it('should serve index.html for root SPA route', async () => {
      const reply = { sendFile: vi.fn(), type: vi.fn() };
      const request = { raw: { url: '/' }, method: 'GET', url: '/' };

      await notFoundHandler(request, reply);

      expect(reply.type).toHaveBeenCalledWith('text/html; charset=utf-8');
      expect(reply.sendFile).toHaveBeenCalledWith('index.html', '/dist/client');
    });

    it('should not fall back to index.html for API subroutes', async () => {
      const reply = { status: vi.fn().mockReturnThis(), send: vi.fn() };
      const request = {
        raw: { url: '/api/health/check' },
        method: 'GET',
        url: '/api/health/check',
      };

      await notFoundHandler(request, reply);

      expect(reply.status).toHaveBeenCalledWith(404);
    });
  });

  describe('registerSpaFallback with missing URL', () => {
    it('should treat undefined url as root and fall back to index.html', async () => {
      adapter.registerSpaFallback('/api', '/dist/client');
      const reply = { sendFile: vi.fn(), type: vi.fn() };
      const request = { raw: { url: undefined }, method: 'GET', url: undefined };

      await notFoundHandler(request, reply);

      expect(reply.sendFile).toHaveBeenCalledWith('index.html', '/dist/client');
    });
  });

  describe('register', () => {
    it('should resolve without error', async () => {
      await expect(adapter.register()).resolves.toBeUndefined();
    });
  });
});
