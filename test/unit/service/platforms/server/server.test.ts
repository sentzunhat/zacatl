import type { FastifyInstance } from 'fastify';

import { createChildContainer, getContainer, registerValue } from '../../../../../src/dependency-injection/container';
import { DatabaseVendor } from '../../../../../src/service/platforms/server/database/port';
import type { DatabaseInstance } from '../../../../../src/service/platforms/server/database/port';
import type { ServerConfig } from '../../../../../src/service/platforms/server/server';
import { Server } from '../../../../../src/service/platforms/server/server';
import { ServerConfigToken } from '../../../../../src/service/platforms/server/tokens';
import {
  ServerVendor,
  ServerType as ServerType,
} from '../../../../../src/service/platforms/server/types/server-config';
import {
  ApplicationContainerToken,
  ServiceContainerToken,
} from '../../../../../src/service/tokens';

const createServer = (config: ServerConfig): Server => {
  const serviceContainer = createChildContainer(getContainer());
  registerValue(ServiceContainerToken, serviceContainer, serviceContainer);
  const applicationContainer = createChildContainer(serviceContainer);
  registerValue(ApplicationContainerToken, applicationContainer, applicationContainer);
  return new Server(config, serviceContainer, applicationContainer);
};

class FakeFastifyInstance {
  listen = vi.fn(() => Promise.resolve());
  close = vi.fn(() => Promise.resolve());
  withTypeProvider = vi.fn(() => ({ route: vi.fn() }));
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

    it('preserves direct construction with the legacy Service container argument', () => {
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
