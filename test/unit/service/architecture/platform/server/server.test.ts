import {
  ConfigServer,
  DatabaseVendor,
  HandlersType,
  ServerVendor,
  Server,
  ServerType,
  strategiesForDatabaseVendor,
} from "../../../../../../src/service/architecture/platform/server/server";

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
    Object.defineProperty(this.constructor, "name", { value: "FakeMongoose" });
  }
}

const dummyRouteHandler = {
  url: "/test",
  method: "GET",
  schema: {},
  execute: vi.fn(),
  constructor: { name: "DummyRouteHandler" },
};

// Dummy hook handler.
const dummyHookHandler = {
  name: "onRequest",
  execute: vi.fn(),
  constructor: { name: "DummyHookHandler" },
};

describe("Server", () => {
  const fakeFastify: FakeFastifyInstance = new FakeFastifyInstance();
  const fakeMongoose: FakeMongoose = new FakeMongoose();

  let config: ConfigServer;

  beforeEach(() => {
    config = {
      name: "TestService",
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fakeFastify as any, // Cast as FastifyInstance
      },
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: fakeMongoose as any, // Cast as DatabaseInstance
          connectionString: "mongodb://localhost/test",
          onDatabaseConnected: vi.fn(),
        },
      ],
    };
  });

  describe("registerHandlers", () => {
    it("should register a route handler using FASTIFY strategy", async () => {
      const routeSpy = vi.fn();

      fakeFastify.withTypeProvider = vi
        .fn()
        .mockReturnValue({ route: routeSpy });

      const server = new Server(config);

      await server.registerHandlers({
        handlers: [dummyRouteHandler as any],
        handlersType: HandlersType.ROUTE,
      });

      expect(fakeFastify.withTypeProvider).toHaveBeenCalled();
      expect(routeSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: dummyRouteHandler.url,
          method: dummyRouteHandler.method,
          schema: dummyRouteHandler.schema,
          handler: expect.any(Function),
        }),
      );
    });

    it("should register a hook handler using FASTIFY strategy", async () => {
      const server = new Server(config);

      await server.registerHandlers({
        handlers: [dummyHookHandler as any],
        handlersType: HandlersType.HOOK,
      });

      expect(fakeFastify.addHook).toHaveBeenCalledWith(
        dummyHookHandler.name,
        expect.any(Function),
      );
    });

    it("should throw an error if registration function does not exist", async () => {
      const server = new Server(config);

      await expect(
        server.registerHandlers({
          handlers: [dummyRouteHandler as any],
          handlersType: "invalid" as HandlersType,
        }),
      ).rejects.toThrowError(/failed to register invalid/);
    });
  });

  describe("start", () => {
    let originalDbStrategy: any;

    beforeEach(() => {
      originalDbStrategy = strategiesForDatabaseVendor[DatabaseVendor.MONGOOSE];
      strategiesForDatabaseVendor[DatabaseVendor.MONGOOSE] = vi.fn(() =>
        Promise.resolve(),
      );
    });

    afterEach(() => {
      strategiesForDatabaseVendor[DatabaseVendor.MONGOOSE] = originalDbStrategy;
    });

    it("should configure databases, configure server, and start the server", async () => {
      const port = 3000;
      const server = new Server(config);

      await server.configureDatabases();

      await server.start({ port });

      expect(
        strategiesForDatabaseVendor[DatabaseVendor.MONGOOSE],
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          serviceName: config.name,
          database: fakeMongoose,
          connectionString: config.databases[0]?.connectionString,
          onDatabaseConnected: expect.any(Function),
        }),
      );

      expect(fakeFastify.listen).toHaveBeenCalledWith({
        host: "0.0.0.0",
        port,
      });
    });

    it("should throw an error if starting the server fails", async () => {
      const port = 3000;

      fakeFastify.listen.mockRejectedValue(new Error("listen failed"));

      const server = new Server(config);

      await expect(server.start({ port })).rejects.toThrow(
        "failed to start service",
      );
    });

    it("should throw an error if database configuration fails", async () => {
      strategiesForDatabaseVendor[DatabaseVendor.MONGOOSE] = originalDbStrategy;

      fakeMongoose.connect.mockRejectedValue(new Error("db connect failed"));

      const server = new Server(config);

      await expect(server.configureDatabases()).rejects.toThrow(
        "failed to configure database for service",
      );
    });
  });
});
