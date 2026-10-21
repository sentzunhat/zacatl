import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockResolveDependencies = vi.fn();

vi.mock('@zacatl/third-party/dependency-injection', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@zacatl/third-party/dependency-injection')>();
  return {
    ...actual,
    resolveDependencies: (...args: unknown[]) => mockResolveDependencies(...args),
  };
});

import { CustomError } from '@zacatl/error';

import {
  createChildContainer,
  registerValue,
} from '../../../../../../src/third-party/dependency-injection/container';
import type { RouteHandler } from '../../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/route-handler';
import type { HookHandler } from '../../../../../../src/service/layers/application/entry-points/rest/hook-handlers/hook-handler';
import type { RestApplicationEntryPoints } from '../../../../../../src/service/layers/application/types';
import type { Constructor } from '../../../../../../src/service/layers/types';
import {
  ApiServer,
  ApiServerAdapterToken,
  ApiServerConfigToken,
  ApiServerContainerToken,
} from '../../../../../../src/service/platforms/server/api/api-server';
import type { ApiServerPort } from '../../../../../../src/service/platforms/server/api/port';
import type { HttpServerConfig } from '../../../../../../src/service/platforms/server/types/server-config';
import {
  ServerType,
  ServerVendor,
} from '../../../../../../src/service/platforms/server/types/server-config';
import type { DependencyContainer } from '../../../../../../src/third-party/dependency-injection/tsyringe';

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
): HttpServerConfig => ({
  type: ServerType.SERVER,
  vendor: ServerVendor.EXPRESS,
  instance: {},
  ...overrides,
});

describe('ApiServer', () => {
  let adapter: ApiServerPort;
  let apiServer: ApiServer;
  let container: ReturnType<typeof createChildContainer>;

  const resolveApiServer = (
    config = makeConfig(),
    apiAdapter = adapter,
    handlerContainer?: DependencyContainer,
  ): ApiServer => {
    container = createChildContainer();
    registerValue(ApiServerConfigToken, config, container);
    registerValue(ApiServerAdapterToken, apiAdapter, container);
    registerValue(ApiServerContainerToken, handlerContainer ?? container, container);
    return container.resolve(ApiServer);
  };

  it('fails fast when its required handler container is not registered', () => {
    const incompleteContainer = createChildContainer();
    registerValue(ApiServerConfigToken, makeConfig(), incompleteContainer);
    registerValue(ApiServerAdapterToken, adapter, incompleteContainer);

    expect(() => incompleteContainer.resolve(ApiServer)).toThrow(/api\/container/);
  });

  it('supports direct construction with config and adapter arguments', () => {
    expect(() => new ApiServer(makeConfig(), adapter)).not.toThrow();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = makeAdapter();
    apiServer = resolveApiServer();
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
        handlers.map((handlerClass) => {
          if (handlerClass === TestHookHandler) return hookInstance;
          if (handlerClass === TestRouteHandler) return routeInstance;
          return new handlerClass();
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

    it('resolves service-managed handlers in the supplied application container', async () => {
      const container = { resolve: vi.fn(), isRegistered: vi.fn() } as never;
      class ScopedHandler implements RouteHandler {
        url = '/scoped';
        method = 'GET' as const;
        schema = {};
        execute = vi.fn();
      }
      mockResolveDependencies.mockReturnValue([]);
      apiServer = resolveApiServer(makeConfig(), adapter, container);
      await apiServer.registerAllRoutes({ routes: [ScopedHandler] });
      expect(mockResolveDependencies).toHaveBeenCalledWith([ScopedHandler], container);
    });

    it('registers gateway proxies when configured', async () => {
      apiServer = resolveApiServer(
        makeConfig({
          type: ServerType.GATEWAY,
          gateway: {
            proxies: [
              { upstream: 'http://localhost:4000', prefix: '/api' },
              { upstream: 'http://localhost:5000' },
            ],
          },
        }),
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
    it('listen(host, port) forwards both values to the adapter', async () => {
      await apiServer.listen('127.0.0.1', 8080);
      expect(adapter.listen).toHaveBeenCalledWith('127.0.0.1', 8080);
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
