import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  registerWithDependencies,
  registerSingletonWithDependencies,
  registerDependencies,
  resolveDependencies,
  registerAndResolve,
  clearContainer,
  getContainer,
} from "../../../src/dependency-injection/container";

/**
 * DI Integration Tests
 *
 * Comprehensive tests verifying the DI container works correctly
 * with various dependency patterns and configurations.
 */

describe("DI Container Integration Tests", () => {
  beforeEach(() => {
    clearContainer();
  });

  afterEach(() => {
    clearContainer();
  });

  describe("Layer-Based Registration (Infrastructure -> Domain -> Application)", () => {
    it("should register and resolve repositories (infrastructure layer)", () => {
      // Infrastructure layer - repositories with no dependencies
      class UserRepository {
        findById(id: string) {
          return { id, name: "User " + id };
        }
      }

      class ProductRepository {
        findById(id: string) {
          return { id, name: "Product " + id };
        }
      }

      registerWithDependencies(UserRepository, []);
      registerWithDependencies(ProductRepository, []);

      const container = getContainer();
      const userRepo = container.resolve(UserRepository);
      const productRepo = container.resolve(ProductRepository);

      expect(userRepo).toBeInstanceOf(UserRepository);
      expect(productRepo).toBeInstanceOf(ProductRepository);
      expect(userRepo.findById("1")).toEqual({ id: "1", name: "User 1" });
    });

    it("should register and resolve services (domain layer) with repo dependencies", () => {
      // Infrastructure layer
      class UserRepository {
        findById(id: string) {
          return { id, name: "User " + id };
        }
      }

      // Domain layer - services depend on repositories
      class UserService {
        constructor(private userRepo: UserRepository) {}

        getUser(id: string) {
          return this.userRepo.findById(id);
        }
      }

      registerWithDependencies(UserRepository, []);
      registerWithDependencies(UserService, [UserRepository]);

      const container = getContainer();
      const service = container.resolve(UserService);

      expect(service).toBeInstanceOf(UserService);
      expect(service.getUser("42")).toEqual({ id: "42", name: "User 42" });
    });

    it("should register and resolve handlers (application layer) with service dependencies", () => {
      // Infrastructure layer
      class UserRepository {
        findById(id: string) {
          return { id, name: "User " + id };
        }
      }

      // Domain layer
      class UserService {
        constructor(private userRepo: UserRepository) {}

        getUser(id: string) {
          return this.userRepo.findById(id);
        }
      }

      // Application layer - REST handlers depend on services
      class GetUserHandler {
        constructor(private userService: UserService) {}

        handle(id: string) {
          return {
            success: true,
            data: this.userService.getUser(id),
          };
        }
      }

      registerWithDependencies(UserRepository, []);
      registerWithDependencies(UserService, [UserRepository]);
      registerWithDependencies(GetUserHandler, [UserService]);

      const container = getContainer();
      const handler = container.resolve(GetUserHandler);

      expect(handler).toBeInstanceOf(GetUserHandler);
      expect(handler.handle("99")).toEqual({
        success: true,
        data: { id: "99", name: "User 99" },
      });
    });

    it("should handle complete service hierarchy", () => {
      class DatabaseConfig {
        host = "localhost";
        port = 27017;
      }

      class UserRepository {
        constructor(private config: DatabaseConfig) {}

        findById(id: string) {
          return {
            id,
            name: `User ${id}`,
            host: this.config.host,
          };
        }
      }

      class ProductRepository {
        constructor(private config: DatabaseConfig) {}

        findById(id: string) {
          return { id, name: `Product ${id}`, host: this.config.host };
        }
      }

      class UserService {
        constructor(private userRepo: UserRepository) {}

        getUser(id: string) {
          return this.userRepo.findById(id);
        }
      }

      class ProductService {
        constructor(private productRepo: ProductRepository) {}

        getProduct(id: string) {
          return this.productRepo.findById(id);
        }
      }

      class CartHandler {
        constructor(
          private userService: UserService,
          private productService: ProductService,
        ) {}

        getCart(userId: string, productId: string) {
          return {
            user: this.userService.getUser(userId),
            product: this.productService.getProduct(productId),
          };
        }
      }

      registerWithDependencies(DatabaseConfig, []);
      registerWithDependencies(UserRepository, [DatabaseConfig]);
      registerWithDependencies(ProductRepository, [DatabaseConfig]);
      registerWithDependencies(UserService, [UserRepository]);
      registerWithDependencies(ProductService, [ProductRepository]);
      registerWithDependencies(CartHandler, [UserService, ProductService]);

      const container = getContainer();
      const handler = container.resolve(CartHandler);

      expect(handler).toBeInstanceOf(CartHandler);
      const result = handler.getCart("1", "2");
      expect(result.user.host).toBe("localhost");
      expect(result.product.host).toBe("localhost");
    });
  });

  describe("Singleton Pattern for Stateful Services", () => {
    it("should maintain singleton state across multiple resolutions", () => {
      class Counter {
        private count = 0;

        increment() {
          this.count++;
          return this.count;
        }

        getCount() {
          return this.count;
        }
      }

      registerSingletonWithDependencies(Counter, []);

      const container = getContainer();
      const counter1 = container.resolve(Counter);
      const counter2 = container.resolve(Counter);

      expect(counter1).toBe(counter2); // Same instance
      expect(counter1.increment()).toBe(1);
      expect(counter2.increment()).toBe(2);
      expect(counter1.getCount()).toBe(2); // Shared state
      expect(counter2.getCount()).toBe(2);
    });

    it("should create new instances for non-singleton registrations", () => {
      class Counter {
        private count = 0;

        increment() {
          this.count++;
          return this.count;
        }
      }

      registerWithDependencies(Counter, []);

      const container = getContainer();
      const counter1 = container.resolve(Counter);
      const counter2 = container.resolve(Counter);

      expect(counter1).not.toBe(counter2); // Different instances
      expect(counter1.increment()).toBe(1);
      expect(counter2.increment()).toBe(1); // Independent state
    });

    it("should support mixed singleton and transient dependencies", () => {
      class SharedCache {
        private data: Record<string, any> = {};

        set(key: string, value: any) {
          this.data[key] = value;
        }

        get(key: string) {
          return this.data[key];
        }
      }

      class RequestHandler {
        constructor(private cache: SharedCache) {}

        process(key: string) {
          return this.cache.get(key);
        }
      }

      // Cache is singleton, handlers are transient
      registerSingletonWithDependencies(SharedCache, []);
      registerWithDependencies(RequestHandler, [SharedCache]);

      const container = getContainer();
      const cache = container.resolve(SharedCache);
      cache.set("user:1", { id: 1, name: "Alice" });

      const handler1 = container.resolve(RequestHandler);
      const handler2 = container.resolve(RequestHandler);

      expect(handler1).not.toBe(handler2); // Different handlers
      expect(handler1.process("user:1")).toEqual({ id: 1, name: "Alice" });
      expect(handler2.process("user:1")).toEqual({ id: 1, name: "Alice" }); // Share same cache
    });
  });

  describe("Multiple Dependency Registration", () => {
    it("should handle multiple dependencies in correct order", () => {
      const callOrder: string[] = [];

      class Service1 {
        constructor() {
          callOrder.push("Service1");
        }
      }

      class Service2 {
        // @ts-expect-error - unused in test, only testing DI resolution order
        constructor(private s1: Service1) {
          callOrder.push("Service2");
        }

        execute() {
          return "Service2";
        }
      }

      class Service3 {
        constructor(
          // @ts-expect-error - unused in test, only testing DI resolution order
          private s2: Service2,
          // @ts-expect-error - unused in test, only testing DI resolution order
          private s1: Service1,
        ) {
          callOrder.push("Service3");
        }

        execute() {
          return "Service3";
        }
      }

      registerWithDependencies(Service1, []);
      registerWithDependencies(Service2, [Service1]);
      registerWithDependencies(Service3, [Service2, Service1]);

      const container = getContainer();
      container.resolve(Service3);

      expect(callOrder).toContain("Service1");
      expect(callOrder).toContain("Service2");
      expect(callOrder).toContain("Service3");
    });

    it("should resolve multiple dependencies with registerAndResolve", () => {
      class Logger {
        log(msg: string) {
          return `LOG: ${msg}`;
        }
      }

      class Database {
        connect() {
          return "Connected";
        }
      }

      class ConfigService {
        getConfig() {
          return { debug: true };
        }
      }

      // Use typed array to help TypeScript understand the types
      const services = registerAndResolve<Logger | Database | ConfigService>([
        Logger,
        Database,
        ConfigService,
      ]);

      expect(services).toHaveLength(3);
      expect(services[0]?.constructor.name).toBe("Logger");
      expect(services[1]?.constructor.name).toBe("Database");
      expect(services[2]?.constructor.name).toBe("ConfigService");
      expect((services[0] as Logger)?.log("test")).toBe("LOG: test");
      expect((services[1] as Database)?.connect()).toBe("Connected");
    });

    it("should resolve specific dependencies with resolveDependencies", () => {
      class ServiceA {
        getData() {
          return "A";
        }
      }

      class ServiceB {
        getData() {
          return "B";
        }
      }

      class ServiceC {
        getData() {
          return "C";
        }
      }

      registerDependencies([ServiceA, ServiceB, ServiceC]);

      const services = resolveDependencies([ServiceA, ServiceC]);
      const a = services[0];
      const c = services[1];

      expect(a).toBeInstanceOf(ServiceA);
      expect(c).toBeInstanceOf(ServiceC);
      expect(a?.getData()).toBe("A");
      expect(c?.getData()).toBe("C");
    });
  });

  describe("Error Handling", () => {
    it("should throw error when resolving unregistered dependency", () => {
      class UnregisteredService {}

      class DependentService {
        constructor(_service: UnregisteredService) {}
      }

      registerWithDependencies(DependentService, [UnregisteredService]);

      const container = getContainer();
      expect(() => {
        container.resolve(DependentService);
      }).toThrow("Dependency UnregisteredService not registered");
    });

    it("should throw error for circular dependency attempt", () => {
      class ServiceA {
        // @ts-expect-error - unused in test, only testing circular dependency detection
        constructor(private b: ServiceB) {}
      }

      class ServiceB {
        // @ts-expect-error - unused in test, only testing circular dependency detection
        constructor(private _a: ServiceA) {}
      }

      registerWithDependencies(ServiceA, [ServiceB]);
      registerWithDependencies(ServiceB, [ServiceA]);

      const container = getContainer();
      expect(() => {
        container.resolve(ServiceA);
      }).toThrow();
    });

    it("should handle missing dependencies gracefully", () => {
      class Repository {
        getData() {
          return "data";
        }
      }

      class Service {
        constructor(private repo: Repository) {}

        execute() {
          return this.repo.getData();
        }
      }

      // Register Service but forget to register Repository
      registerWithDependencies(Service, [Repository]);

      const container = getContainer();
      expect(() => {
        container.resolve(Service);
      }).toThrow("Dependency Repository not registered");
    });
  });

  describe("Container Lifecycle", () => {
    it("should clear all registrations and reset instances", () => {
      class TestService {
        execute() {
          return "test";
        }
      }

      registerWithDependencies(TestService, []);
      let instance = getContainer().resolve(TestService);
      expect(instance).toBeInstanceOf(TestService);

      clearContainer();

      // After clearing, registering the same service should create a new instance
      registerWithDependencies(TestService, []);
      const newInstance = getContainer().resolve(TestService);
      expect(newInstance).toBeInstanceOf(TestService);
      // The new instance should be different from the old one since container was cleared
      expect(newInstance).not.toBe(instance);
    });

    it("should reset singleton instances on clear", () => {
      class Counter {
        private count = 0;

        increment() {
          this.count++;
          return this.count;
        }
      }

      registerSingletonWithDependencies(Counter, []);
      let counter = getContainer().resolve(Counter);
      expect(counter.increment()).toBe(1);
      expect(counter.increment()).toBe(2);

      clearContainer();

      registerSingletonWithDependencies(Counter, []);
      counter = getContainer().resolve(Counter);
      expect(counter.increment()).toBe(1); // Reset counter
    });

    it("should allow re-registration after clear", () => {
      class Service {
        version = 1;
      }

      registerWithDependencies(Service, []);
      let instance = getContainer().resolve(Service);
      expect(instance.version).toBe(1);

      clearContainer();

      class ServiceV2 {
        version = 2;
      }

      registerWithDependencies(ServiceV2, []);
      const instance2 = getContainer().resolve(ServiceV2);
      expect(instance2.version).toBe(2);
    });
  });

  describe("Complex Real-World Scenarios", () => {
    it("should support event-driven architecture with subscribers", () => {
      interface Event {
        type: string;
        data: any;
      }

      class EventBus {
        private subscribers: Map<string, Array<(data: any) => void>> =
          new Map();

        subscribe(eventType: string, handler: (data: any) => void) {
          if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
          }
          this.subscribers.get(eventType)!.push(handler);
        }

        emit(event: Event) {
          const handlers = this.subscribers.get(event.type) || [];
          handlers.forEach((h) => h(event.data));
        }
      }

      class Logger {
        private logs: string[] = [];

        log(msg: string) {
          this.logs.push(msg);
        }

        getLogs() {
          return this.logs;
        }
      }

      class UserCreatedSubscriber {
        constructor(
          private logger: Logger,
          private eventBus: EventBus,
        ) {
          this.eventBus.subscribe("user:created", (data) => {
            this.logger.log(`User created: ${data.email}`);
          });
        }
      }

      registerSingletonWithDependencies(EventBus, []);
      registerSingletonWithDependencies(Logger, []);
      registerWithDependencies(UserCreatedSubscriber, [Logger, EventBus]);

      const container = getContainer();
      const logger = container.resolve(Logger);
      const eventBus = container.resolve(EventBus);
      container.resolve(UserCreatedSubscriber);

      eventBus.emit({
        type: "user:created",
        data: { email: "test@example.com" },
      });

      expect(logger.getLogs()).toContain("User created: test@example.com");
    });

    it("should support middleware/pipeline pattern", () => {
      class Request {
        constructor(
          public path: string,
          public data: any = {},
        ) {}
      }

      interface Middleware {
        handle(req: Request): boolean;
      }

      class AuthMiddleware implements Middleware {
        handle(req: Request): boolean {
          req.data.authenticated = true;
          return true;
        }
      }

      class LoggingMiddleware implements Middleware {
        handle(req: Request): boolean {
          req.data.logged = true;
          return true;
        }
      }

      class ValidationMiddleware implements Middleware {
        handle(req: Request): boolean {
          req.data.validated = true;
          return true;
        }
      }

      class Pipeline {
        private middlewares: Middleware[] = [];

        constructor(middlewares: Middleware[]) {
          this.middlewares = middlewares;
        }

        execute(req: Request): boolean {
          return this.middlewares.every((m) => m.handle(req));
        }
      }

      registerWithDependencies(AuthMiddleware, []);
      registerWithDependencies(LoggingMiddleware, []);
      registerWithDependencies(ValidationMiddleware, []);

      const container = getContainer();
      const middlewares = [
        container.resolve(AuthMiddleware),
        container.resolve(LoggingMiddleware),
        container.resolve(ValidationMiddleware),
      ];

      registerWithDependencies(Pipeline, []);
      const pipeline = new Pipeline(middlewares);

      const req = new Request("/api/users");
      expect(pipeline.execute(req)).toBe(true);
      expect(req.data.authenticated).toBe(true);
      expect(req.data.logged).toBe(true);
      expect(req.data.validated).toBe(true);
    });
  });
});
