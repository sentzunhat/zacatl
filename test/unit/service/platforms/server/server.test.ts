import type { FastifyInstance } from 'fastify';

import type { ServerConfig } from '../../../../../src/service/platforms/server/server';
import { Server } from '../../../../../src/service/platforms/server/server';
import { DatabaseVendor } from '../../../../../src/service/platforms/server/database/port';
import type { DatabaseInstance } from '../../../../../src/service/platforms/server/database/port';
import {
  ServerVendor,
  ServerType as ServerType,
} from '../../../../../src/service/platforms/server/types/server-config';

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
      const server = new Server(config);

      expect(server).toBeInstanceOf(Server);
      expect(server.getApiAdapter()).toBeDefined();
      expect(server.getPageAdapter()).toBeDefined();
      expect(server.getApiServer()).toBeDefined();
      expect(server.getPageServer()).toBeDefined();
    });

    it('should create DatabaseServer if databases are provided', () => {
      const server = new Server(config);

      expect(server.getDatabaseServer()).toBeDefined();
    });
  });

  describe('start', () => {
    it('should start the server on configured port', async () => {
      const server = new Server(config);

      // Mock database configuration
      const databaseServer = server.getDatabaseServer();
      if (databaseServer == null) {
        throw new Error('DatabaseServer should be defined');
      }
      vi.spyOn(databaseServer, 'configure').mockResolvedValue(undefined);

      await server.start();

      expect(fakeFastify.listen).toHaveBeenCalledWith({
        host: '0.0.0.0',
        port: 3000,
      });
    });

    it('should use override port if provided', async () => {
      const server = new Server(config);

      const databaseServer = server.getDatabaseServer();
      if (databaseServer == null) {
        throw new Error('DatabaseServer should be defined');
      }
      vi.spyOn(databaseServer, 'configure').mockResolvedValue(undefined);

      await server.start({ port: 9999 });

      expect(fakeFastify.listen).toHaveBeenCalledWith({
        host: '0.0.0.0',
        port: 9999,
      });
    });

    it('should throw an error if starting the server fails', async () => {
      fakeFastify.listen.mockRejectedValue(new Error('listen failed'));

      const server = new Server(config);

      await expect(server.start()).rejects.toThrow('failed to start service');
    });
  });

  describe('stop()', () => {
    it('resolves cleanly when no database server is present', async () => {
      const serverWithNoDbs = new Server({ ...config, databases: [] });
      await expect(serverWithNoDbs.stop()).resolves.toBeUndefined();
    });

    it('calls disconnect on the database server', async () => {
      const server = new Server(config);
      const dbServer = server.getDatabaseServer();
      if (dbServer == null) throw new Error('DatabaseServer should be defined');
      const disconnectSpy = vi.spyOn(dbServer, 'disconnect').mockResolvedValue(undefined);

      await server.stop();

      expect(disconnectSpy).toHaveBeenCalledOnce();
    });
  });

  describe('registerEntrypoints()', () => {
    it('delegates to apiServer.registerEntrypoints', async () => {
      const server = new Server(config);
      const apiServer = server.getApiServer();
      if (apiServer == null) throw new Error('ApiServer should be defined');
      const spy = vi.spyOn(apiServer, 'registerEntrypoints').mockResolvedValue(undefined);

      await server.registerEntrypoints({ routes: [] });

      expect(spy).toHaveBeenCalledOnce();
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
      const server = new Server(expressConfig);
      expect(server.getApiAdapter()).toBeDefined();
      expect(server.getPageAdapter()).toBeDefined();
    });
  });

  describe('unsupported vendor', () => {
    it('throws InternalServerError for unknown vendor', () => {
      const badConfig: ServerConfig = {
        ...config,
        server: { ...config.server, vendor: 'UNKNOWN' as unknown as ServerVendor },
      };
      expect(() => new Server(badConfig)).toThrow();
    });
  });
});
