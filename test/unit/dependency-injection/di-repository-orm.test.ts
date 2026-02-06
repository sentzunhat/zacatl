import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  registerWithDependencies,
  registerSingletonWithDependencies,
  clearContainer,
  getContainer,
} from "../../../src/dependency-injection/container";

/**
 * DI Container - Repository & ORM Integration Tests
 *
 * Tests verifying the DI container works properly with repository patterns
 * and ORM initialization (Mongoose, Sequelize) without eager loading issues.
 */

describe("DI Container - Repository & ORM Integration", () => {
  beforeEach(() => {
    clearContainer();
  });

  afterEach(() => {
    clearContainer();
  });

  describe("Repository Pattern with DI", () => {
    it("should register and resolve repositories without ORM eager loading", () => {
      // Mock ORM configurations
      // type MongooseConfig = {
      //   connectionString: string;
      //   options?: Record<string, any>;
      // };

      class RepositoryConfig {
        mongooseUri = "mongodb://localhost:27017/test";
      }

      class AbstractRepository<_T = any> {
        protected model: any;

        constructor(protected config: RepositoryConfig) {
          // Don't eagerly load ORM here
        }

        async initialize() {
          // Simulate lazy loading of ORM
          this.model = { schema: "placeholder" };
        }

        async findById(id: string) {
          if (!this.model) {
            await this.initialize();
          }
          return { id, data: "test" };
        }
      }

      class UserRepository extends AbstractRepository<{ id: string }> {
        async findByEmail(email: string) {
          if (!this.model) {
            await this.initialize();
          }
          return { email, id: "user1" };
        }
      }

      registerWithDependencies(RepositoryConfig, []);
      registerWithDependencies(UserRepository, [RepositoryConfig]);

      const container = getContainer();
      const repo = container.resolve(UserRepository);

      expect(repo).toBeInstanceOf(UserRepository);
      expect(repo).toBeDefined();
    });

    it("should support lazy ORM initialization in repositories", async () => {
      let mongooseInitialized = false;
      let sequelizeInitialized = false;

      class MongooseAdapter {
        connect() {
          mongooseInitialized = true;
          return Promise.resolve();
        }
      }

      class SequelizeAdapter {
        connect() {
          sequelizeInitialized = true;
          return Promise.resolve();
        }
      }

      class MongooseRepository {
        private adapter: MongooseAdapter | null = null;

        constructor() {
          // Don't initialize adapter in constructor
        }

        async initialize() {
          if (!this.adapter) {
            this.adapter = new MongooseAdapter();
            await this.adapter.connect();
          }
        }

        async find() {
          await this.initialize();
          return [];
        }
      }

      class SequelizeRepository {
        private adapter: SequelizeAdapter | null = null;

        constructor() {
          // Don't initialize adapter in constructor
        }

        async initialize() {
          if (!this.adapter) {
            this.adapter = new SequelizeAdapter();
            await this.adapter.connect();
          }
        }

        async find() {
          await this.initialize();
          return [];
        }
      }

      registerWithDependencies(MongooseRepository, []);
      registerWithDependencies(SequelizeRepository, []);

      // At this point, neither ORM should be initialized
      expect(mongooseInitialized).toBe(false);
      expect(sequelizeInitialized).toBe(false);

      const container = getContainer();

      // Even after resolving, they shouldn't be initialized (lazy loading)
      const mongoRepo = container.resolve(MongooseRepository);
      expect(mongooseInitialized).toBe(false);

      const sequelizeRepo = container.resolve(SequelizeRepository);
      expect(sequelizeInitialized).toBe(false);

      // Initialize when needed
      await mongoRepo.find();
      expect(mongooseInitialized).toBe(true);
      expect(sequelizeInitialized).toBe(false); // Still not initialized

      await sequelizeRepo.find();
      expect(sequelizeInitialized).toBe(true);
    });
  });

  describe("Service Layer with Repository Dependencies", () => {
    it("should resolve service with repository dependencies", () => {
      class Database {
        isConnected = false;

        connect() {
          this.isConnected = true;
        }
      }

      class UserRepository {
        constructor(private db: Database) {}

        findUser(id: string) {
          return { id, name: "User " + id, connected: this.db.isConnected };
        }
      }

      class UserService {
        constructor(private userRepo: UserRepository) {}

        getUser(id: string) {
          return this.userRepo.findUser(id);
        }
      }

      registerWithDependencies(Database, []);
      registerWithDependencies(UserRepository, [Database]);
      registerWithDependencies(UserService, [UserRepository]);

      const container = getContainer();
      const service = container.resolve(UserService);

      const user = service.getUser("42");
      expect(user).toEqual({ id: "42", name: "User 42", connected: false });
    });

    it("should maintain repository singleton across multiple service resolutions", () => {
      let repositoryCreationCount = 0;

      class Repo {
        id = ++repositoryCreationCount;
      }

      class ServiceA {
        constructor(private repo: Repo) {}

        getRepoId() {
          return this.repo.id;
        }
      }

      class ServiceB {
        constructor(private repo: Repo) {}

        getRepoId() {
          return this.repo.id;
        }
      }

      registerSingletonWithDependencies(Repo, []);
      registerWithDependencies(ServiceA, [Repo]);
      registerWithDependencies(ServiceB, [Repo]);

      const container = getContainer();
      const serviceA = container.resolve(ServiceA);
      const serviceB = container.resolve(ServiceB);

      expect(serviceA.getRepoId()).toBe(1);
      expect(serviceB.getRepoId()).toBe(1); // Same repository instance
      expect(serviceA.getRepoId()).toBe(serviceB.getRepoId());
    });
  });

  describe("Multi-Tier Architecture", () => {
    it("should resolve complete application architecture", () => {
      // Configuration layer
      class Config {
        dbUrl = "mongodb://localhost";
        apiPort = 3000;
      }

      // Infrastructure layer
      class DatabaseConnection {
        constructor(private config: Config) {}

        getUrl() {
          return this.config.dbUrl;
        }
      }

      class UserRepository {
        constructor(private db: DatabaseConnection) {}

        findAll() {
          return [
            { id: "1", name: "Alice", dbUrl: this.db.getUrl() },
            { id: "2", name: "Bob", dbUrl: this.db.getUrl() },
          ];
        }
      }

      // Domain layer
      class UserService {
        constructor(private userRepo: UserRepository) {}

        getAllUsers() {
          return this.userRepo.findAll();
        }

        getUserCount() {
          return this.userRepo.findAll().length;
        }
      }

      // Application layer
      class UserController {
        constructor(private userService: UserService) {}

        listUsers() {
          return {
            users: this.userService.getAllUsers(),
            count: this.userService.getUserCount(),
          };
        }
      }

      registerWithDependencies(Config, []);
      registerWithDependencies(DatabaseConnection, [Config]);
      registerWithDependencies(UserRepository, [DatabaseConnection]);
      registerWithDependencies(UserService, [UserRepository]);
      registerWithDependencies(UserController, [UserService]);

      const container = getContainer();
      const controller = container.resolve(UserController);

      const result = controller.listUsers();
      expect(result.users).toHaveLength(2);
      expect(result.count).toBe(2);
      expect(result.users[0]?.name).toBe("Alice");
      expect(result.users[0]?.dbUrl).toBe("mongodb://localhost");
    });

    it("should handle multiple independent repositories with shared config", () => {
      class DatabaseConfig {
        constructor(
          readonly host = "localhost",
          readonly port = 27017,
        ) {}
      }

      class UserRepository {
        constructor(private config: DatabaseConfig) {}

        getData() {
          return {
            type: "users",
            host: this.config.host,
            port: this.config.port,
          };
        }
      }

      class ProductRepository {
        constructor(private config: DatabaseConfig) {}

        getData() {
          return {
            type: "products",
            host: this.config.host,
            port: this.config.port,
          };
        }
      }

      class OrderRepository {
        constructor(private config: DatabaseConfig) {}

        getData() {
          return {
            type: "orders",
            host: this.config.host,
            port: this.config.port,
          };
        }
      }

      class ApplicationService {
        constructor(
          private users: UserRepository,
          private products: ProductRepository,
          private orders: OrderRepository,
        ) {}

        getDataSources() {
          return {
            users: this.users.getData(),
            products: this.products.getData(),
            orders: this.orders.getData(),
          };
        }
      }

      registerSingletonWithDependencies(DatabaseConfig, []);
      registerWithDependencies(UserRepository, [DatabaseConfig]);
      registerWithDependencies(ProductRepository, [DatabaseConfig]);
      registerWithDependencies(OrderRepository, [DatabaseConfig]);
      registerWithDependencies(ApplicationService, [
        UserRepository,
        ProductRepository,
        OrderRepository,
      ]);

      const container = getContainer();
      const appService = container.resolve(ApplicationService);
      const sources = appService.getDataSources();

      expect(sources.users.type).toBe("users");
      expect(sources.products.type).toBe("products");
      expect(sources.orders.type).toBe("orders");
      // All should use same config instance
      expect(sources.users.host).toBe(sources.products.host);
      expect(sources.products.host).toBe(sources.orders.host);
    });
  });

  describe("ORM Type Safety", () => {
    it("should support generic repository pattern", () => {
      abstract class GenericRepository<T> {
        abstract findById(id: string): T | null;
        abstract findAll(): T[];
        abstract save(entity: T): void;
      }

      interface User {
        id: string;
        name: string;
      }

      interface Product {
        id: string;
        price: number;
      }

      class UserRepository extends GenericRepository<User> {
        private users: User[] = [];

        findById(id: string): User | null {
          return this.users.find((u) => u.id === id) || null;
        }

        findAll(): User[] {
          return this.users;
        }

        save(user: User): void {
          this.users.push(user);
        }
      }

      class ProductRepository extends GenericRepository<Product> {
        private products: Product[] = [];

        findById(id: string): Product | null {
          return this.products.find((p) => p.id === id) || null;
        }

        findAll(): Product[] {
          return this.products;
        }

        save(product: Product): void {
          this.products.push(product);
        }
      }

      registerWithDependencies(UserRepository, []);
      registerWithDependencies(ProductRepository, []);

      const container = getContainer();
      const userRepo = container.resolve(UserRepository);
      const productRepo = container.resolve(ProductRepository);

      userRepo.save({ id: "1", name: "Alice" });
      productRepo.save({ id: "1", price: 99.99 });

      expect(userRepo.findAll()).toHaveLength(1);
      expect(productRepo.findAll()).toHaveLength(1);
      expect(userRepo.findById("1")?.name).toBe("Alice");
      expect(productRepo.findById("1")?.price).toBe(99.99);
    });
  });

  describe("Initialization Helpers", () => {
    it("should support setupModule pattern for complete initialization", () => {
      class Logger {
        logs: string[] = [];

        log(msg: string) {
          this.logs.push(msg);
        }
      }

      class DatabaseConnection {
        connected = false;

        connect() {
          this.connected = true;
        }
      }

      class Repository {
        constructor(private db: DatabaseConnection) {}

        isReady() {
          return this.db.connected;
        }
      }

      class Service {
        constructor(
          private repo: Repository,
          private logger: Logger,
        ) {}

        execute() {
          this.logger.log("Executing service");
          return this.repo.isReady();
        }
      }

      // Setup module
      const setupModule = () => {
        registerSingletonWithDependencies(Logger, []);
        registerSingletonWithDependencies(DatabaseConnection, []);
        registerWithDependencies(Repository, [DatabaseConnection]);
        registerWithDependencies(Service, [Repository, Logger]);
      };

      setupModule();

      const container = getContainer();
      const db = container.resolve(DatabaseConnection);
      db.connect();

      const service = container.resolve(Service);
      expect(service.execute()).toBe(true);

      const logger = container.resolve(Logger);
      expect(logger.logs).toContain("Executing service");
    });
  });
});
