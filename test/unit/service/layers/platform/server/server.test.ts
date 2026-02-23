import type {
  ConfigServer} from '../../../../../../src/service/platforms/server';
import {
  DatabaseVendor,
  Server,
} from '../../../../../../src/service/platforms/server';
import {
  ServerVendor,
  ApiServerType as ServerType,
} from '../../../../../../src/service/platforms/server/types/server-config';

class FakeFastifyInstance {
  listen = vi.fn(() => Promise.resolve());
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

  let config: ConfigServer;

  beforeEach(() => {
    config = {
      name: 'TestService',
      port: 3000,
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fakeFastify as any, // Cast as FastifyInstance
      },
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: fakeMongoose as any, // Cast as DatabaseInstance
          connectionString: 'mongodb://localhost/test',
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
      vi.spyOn(server.getDatabaseServer() as any, 'configure').mockResolvedValue(undefined);

      await server.start();

      expect(fakeFastify.listen).toHaveBeenCalledWith({
        host: '0.0.0.0',
        port: 3000,
      });
    });

    it('should use override port if provided', async () => {
      const server = new Server(config);

      vi.spyOn(server.getDatabaseServer() as any, 'configure').mockResolvedValue(undefined);

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
});
