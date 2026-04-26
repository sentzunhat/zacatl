import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockResolveDependencies = vi.fn();

vi.mock('@zacatl/dependency-injection', () => ({
  resolveDependencies: (...args: unknown[]) => mockResolveDependencies(...args),
}));

import { CustomError } from '@zacatl/error';

import type { HookHandler } from '../../../../../../src/service/layers/application/entry-points/rest/hook-handlers/hook-handler';
import type { RouteHandler } from '../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/route-handler';
import type { RestApplicationEntryPoints } from '../../../../../../src/service/layers/application/types';
import type { Constructor } from '../../../../../../src/service/layers/types';
import { ApiServer } from '../../../../../../src/service/platforms/server/api/api-server';
import type { ApiServerPort } from '../../../../../../src/service/platforms/server/api/port';
import {
  ServerType,
  ServerVendor,
} from '../../../../../../src/service/platforms/server/types/server-config';

const makeAdapter = (): ApiServerPort => ({
  registerRoute: vi.fn(),
  registerHook: vi.fn(),
  registerProxy: vi.fn(),
  listen: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  getRawServer: vi.fn().mockReturnValue({}),
});

const makeConfig = (
  overrides: Partial<{
    type: ServerType;
    gateway: { proxies: Array<{ upstream: string; prefix?: string }> };
  }> = {},
) => ({
  type: ServerType.SERVER,
  vendor: ServerVendor.EXPRESS,
  instance: {},
  ...overrides,
});

describe('ApiServer', () => {
  let adapter: ApiServerPort;
  let apiServer: ApiServer;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = makeAdapter();
    apiServer = new ApiServer(makeConfig(), adapter);
  });

  describe('registerEntrypoints()', () => {
    it('registers hooks and routes via the adapter', async () => {
      class TestHookHandler implements HookHandler {
        name = 'onRequest' as const;
        execute = vi.fn();
      }

      class TestRouteHandler implements RouteHandler {
        method = 'GET' as const;
        url = '/health';
        schema = {};
        execute = vi.fn();
      }

      const hookInstance = new TestHookHandler();
      const routeInstance = new TestRouteHandler();

      mockResolveDependencies.mockImplementation((handlers: Constructor<unknown>[]) =>
        handlers.map((Handler) => {
          if (Handler === TestHookHandler) return hookInstance;
          if (Handler === TestRouteHandler) return routeInstance;
          return new Handler();
        }),
      );

      const entryPoints: RestApplicationEntryPoints = {
        hooks: [TestHookHandler],
        routes: [TestRouteHandler],
      };

      await apiServer.registerEntrypoints(entryPoints);

      expect(adapter.registerHook).toHaveBeenCalledWith(hookInstance);
      expect(adapter.registerRoute).toHaveBeenCalledWith(routeInstance);
    });

    it('registers gateway proxies when configured', async () => {
      apiServer = new ApiServer(
        makeConfig({
          type: ServerType.GATEWAY,
          gateway: {
            proxies: [
              { upstream: 'http://localhost:4000', prefix: '/api' },
              { upstream: 'http://localhost:5000' },
            ],
          },
        }),
        adapter,
      );

      await apiServer.registerEntrypoints({ routes: [], hooks: [] });

      expect(adapter.registerProxy).toHaveBeenCalledTimes(2);
      expect(adapter.registerProxy).toHaveBeenCalledWith({
        upstream: 'http://localhost:4000',
        prefix: '/api',
        http2: false,
      });
      expect(adapter.registerProxy).toHaveBeenCalledWith({
        upstream: 'http://localhost:5000',
        prefix: '/',
        http2: false,
      });
    });

    it('wraps adapter registration failures in CustomError', async () => {
      class FailingRouteHandler implements RouteHandler {
        method = 'GET' as const;
        url = '/fail';
        schema = {};
        execute = vi.fn();
      }

      const routeInstance = new FailingRouteHandler();

      mockResolveDependencies.mockReturnValue([routeInstance]);
      vi.mocked(adapter.registerRoute).mockImplementation(() => {
        throw new Error('adapter boom');
      });

      await expect(
        apiServer.registerEntrypoints({ routes: [FailingRouteHandler], hooks: [] }),
      ).rejects.toBeInstanceOf(CustomError);
    });
  });

  describe('delegates to adapter', () => {
    it('listen() forwards to adapter.listen', async () => {
      await apiServer.listen(8080);
      expect(adapter.listen).toHaveBeenCalledWith(8080);
    });

    it('getRawServer() returns adapter raw server', () => {
      expect(apiServer.getRawServer()).toEqual({});
      expect(adapter.getRawServer).toHaveBeenCalledOnce();
    });

    it('getAdapter() returns the injected adapter', () => {
      expect(apiServer.getAdapter()).toBe(adapter);
    });

    it('registerProxy() forwards to adapter.registerProxy', () => {
      apiServer.registerProxy({ upstream: 'http://upstream', prefix: '/v1', http2: false });
      expect(adapter.registerProxy).toHaveBeenCalledWith({
        upstream: 'http://upstream',
        prefix: '/v1',
        http2: false,
      });
    });
  });
});
