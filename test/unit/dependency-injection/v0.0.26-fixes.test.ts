import { describe, it, expect, beforeEach } from "vitest";
import {
  registerWithDependencies,
  registerSingletonWithDependencies,
  clearContainer,
  getContainer,
} from "../../../src/dependency-injection/container";

describe("v0.0.26: registerWithDependencies and registerSingletonWithDependencies", () => {
  beforeEach(() => {
    clearContainer();
  });

  describe("registerWithDependencies", () => {
    it("should register class with no dependencies", () => {
      class Repository {
        getData() {
          return "data";
        }
      }

      registerWithDependencies(Repository, []);

      const container = getContainer();
      const instance1 = container.resolve(Repository);
      const instance2 = container.resolve(Repository);

      expect(instance1).toBeInstanceOf(Repository);
      expect(instance1.getData()).toBe("data");
      // Should create new instances (not singleton)
      expect(instance1).not.toBe(instance2);
    });

    it("should register class with dependencies", () => {
      class Repository {
        getData() {
          return "data from repository";
        }
      }

      class Service {
        constructor(private repo: Repository) {}

        execute() {
          return `Service using: ${this.repo.getData()}`;
        }
      }

      registerWithDependencies(Repository, []);
      registerWithDependencies(Service, [Repository]);

      const container = getContainer();
      const service = container.resolve(Service);

      expect(service).toBeInstanceOf(Service);
      expect(service.execute()).toBe("Service using: data from repository");
    });

    it("should throw error if dependency not registered", () => {
      class Repository {}

      class Service {
        // @ts-expect-error - unused in test, only testing DI registration
        constructor(private _repo: Repository) {}
      }

      registerWithDependencies(Service, [Repository]);

      const container = getContainer();
      expect(() => {
        container.resolve(Service);
      }).toThrow("Dependency Repository not registered");
    });

    it("should work with multiple dependencies", () => {
      class RepoA {
        getA() {
          return "A";
        }
      }

      class RepoB {
        getB() {
          return "B";
        }
      }

      class Service {
        constructor(
          private repoA: RepoA,
          private repoB: RepoB,
        ) {}

        execute() {
          return `${this.repoA.getA()}-${this.repoB.getB()}`;
        }
      }

      registerWithDependencies(RepoA, []);
      registerWithDependencies(RepoB, []);
      registerWithDependencies(Service, [RepoA, RepoB]);

      const container = getContainer();
      const service = container.resolve(Service);

      expect(service.execute()).toBe("A-B");
    });

    it("should work with nested dependencies", () => {
      class RepoA {
        getData() {
          return "data";
        }
      }

      class ServiceB {
        constructor(private repo: RepoA) {}

        getData() {
          return this.repo.getData();
        }
      }

      class ServiceC {
        constructor(private service: ServiceB) {}

        execute() {
          return `ServiceC: ${this.service.getData()}`;
        }
      }

      registerWithDependencies(RepoA, []);
      registerWithDependencies(ServiceB, [RepoA]);
      registerWithDependencies(ServiceC, [ServiceB]);

      const container = getContainer();
      const serviceC = container.resolve(ServiceC);

      expect(serviceC.execute()).toBe("ServiceC: data");
    });
  });

  describe("registerSingletonWithDependencies", () => {
    it("should register singleton with no dependencies", () => {
      class Repository {
        private counter = 0;

        increment() {
          this.counter++;
          return this.counter;
        }
      }

      registerSingletonWithDependencies(Repository, []);

      const container = getContainer();
      const instance1 = container.resolve(Repository);
      const instance2 = container.resolve(Repository);

      expect(instance1).toBeInstanceOf(Repository);
      expect(instance1.increment()).toBe(1);
      expect(instance2.increment()).toBe(2); // Same instance
      expect(instance1).toBe(instance2); // Should be same instance
    });

    it("should register singleton with dependencies", () => {
      class Repository {
        getData() {
          return "singleton data";
        }
      }

      class Service {
        constructor(private repo: Repository) {}

        execute() {
          return `Service: ${this.repo.getData()}`;
        }
      }

      registerSingletonWithDependencies(Repository, []);
      registerSingletonWithDependencies(Service, [Repository]);

      const container = getContainer();
      const service1 = container.resolve(Service);
      const service2 = container.resolve(Service);

      expect(service1.execute()).toBe("Service: singleton data");
      expect(service1).toBe(service2); // Same singleton instance
    });

    it("should throw error if dependency not registered", () => {
      class Repository {}

      class Service {
        // @ts-expect-error - unused in test, only testing DI registration
        constructor(private _repo: Repository) {}
      }

      registerSingletonWithDependencies(Service, [Repository]);

      const container = getContainer();
      expect(() => {
        container.resolve(Service);
      }).toThrow("Dependency Repository not registered");
    });

    it("should maintain singleton state across resolutions", () => {
      class Counter {
        private count = 0;

        increment() {
          return ++this.count;
        }
      }

      class Service {
        constructor(private counter: Counter) {}

        getCount() {
          return this.counter.increment();
        }
      }

      registerSingletonWithDependencies(Counter, []);
      registerSingletonWithDependencies(Service, [Counter]);

      const container = getContainer();
      const service1 = container.resolve(Service);
      const service2 = container.resolve(Service);
      const counter = container.resolve(Counter);

      expect(service1.getCount()).toBe(1);
      expect(service2.getCount()).toBe(2);
      expect(counter.increment()).toBe(3);
      // All share same Counter singleton
    });

    it("should work with constructor parameters of specific types", () => {
      interface User {
        id: number;
        name: string;
      }

      class UserRepository {
        getUser(): User {
          return { id: 1, name: "Test User" };
        }
      }

      class UserService {
        constructor(private userRepo: UserRepository) {}

        getUserInfo(): string {
          const user = this.userRepo.getUser();
          return `User: ${user.name} (ID: ${user.id})`;
        }
      }

      registerSingletonWithDependencies(UserRepository, []);
      registerSingletonWithDependencies(UserService, [UserRepository]);

      const container = getContainer();
      const service = container.resolve(UserService);

      expect(service.getUserInfo()).toBe("User: Test User (ID: 1)");
    });
  });

  describe("Mixed registration types", () => {
    it("should work with mix of singleton and non-singleton dependencies", () => {
      class SharedRepo {
        private counter = 0;

        increment() {
          return ++this.counter;
        }
      }

      class TransientService {
        private id = Math.random();

        getId() {
          return this.id;
        }
      }

      class MainService {
        constructor(
          private shared: SharedRepo,
          private transient: TransientService,
        ) {}

        execute() {
          return {
            counter: this.shared.increment(),
            id: this.transient.getId(),
          };
        }
      }

      registerSingletonWithDependencies(SharedRepo, []);
      registerWithDependencies(TransientService, []);
      registerWithDependencies(MainService, [SharedRepo, TransientService]);

      const container = getContainer();
      const service1 = container.resolve(MainService);
      const service2 = container.resolve(MainService);

      const result1 = service1.execute();
      const result2 = service2.execute();

      // SharedRepo is singleton - counter continues
      expect(result2.counter).toBeGreaterThan(result1.counter);
      // TransientService is new each time - different IDs
      expect(result2.id).not.toBe(result1.id);
    });
  });

  describe("Error messages", () => {
    it("should provide clear error message with class names", () => {
      class MyRepository {}
      class MyService {
        // @ts-expect-error - unused in test, only testing error messages
        constructor(private _repo: MyRepository) {}
      }

      registerSingletonWithDependencies(MyService, [MyRepository]);

      try {
        const container = getContainer();
        container.resolve(MyService);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain("MyRepository");
        expect((error as Error).message).toContain("not registered");
        expect((error as Error).message).toContain("MyService");
      }
    });
  });

  describe("tsx/ts-node compatibility", () => {
    it("should work without decorator metadata", () => {
      // These classes don't have @injectable() decorator
      // This simulates tsx/ts-node where metadata is not available
      class PlainRepository {
        getData() {
          return "plain data";
        }
      }

      class PlainService {
        constructor(private repo: PlainRepository) {}

        execute() {
          return this.repo.getData();
        }
      }

      registerSingletonWithDependencies(PlainRepository, []);
      registerSingletonWithDependencies(PlainService, [PlainRepository]);

      const container = getContainer();
      const service = container.resolve(PlainService);

      expect(service.execute()).toBe("plain data");
    });
  });
});
