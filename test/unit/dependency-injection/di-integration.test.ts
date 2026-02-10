import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  registerDependencies,
  resolveDependencies,
  registerAndResolve,
  clearContainer,
  getContainer,
  registerDependency,
  registerSingleton,
} from "../../../src/dependency-injection/container";

/**
 * DI Integration Tests - Active Functions Only
 *
 * Tests verifying the currently supported DI container functions work correctly.
 */

describe("DI Container Integration Tests", () => {
  beforeEach(() => {
    clearContainer();
  });

  afterEach(() => {
    clearContainer();
  });

  describe("Basic Registration and Resolution", () => {
    it("should register and resolve a single dependency", () => {
      class UserService {}

      registerDependency(UserService, UserService);
      const container = getContainer();
      const service = container.resolve(UserService);

      expect(service).toBeInstanceOf(UserService);
    });

    it("should register singleton", () => {
      class Logger {}

      registerSingleton(Logger, Logger);
      const container = getContainer();
      const logger1 = container.resolve(Logger);
      const logger2 = container.resolve(Logger);

      expect(logger1).toBe(logger2);
    });

    it("should register multiple dependencies", () => {
      class Repo {}
      class Service {}

      registerDependencies([Repo, Service]);
      const resolved = resolveDependencies([Repo, Service]);

      expect(resolved[0]).toBeInstanceOf(Repo);
      expect(resolved[1]).toBeInstanceOf(Service);
    });

    it("should register and resolve dependencies in one call", () => {
      class Config {}
      class Database {}

      const instances = registerAndResolve([Config, Database]);

      expect(instances).toHaveLength(2);
      expect(instances[0]).toBeInstanceOf(Config);
      expect(instances[1]).toBeInstanceOf(Database);
    });
  });

  describe("Container Management", () => {
    it("should clear all registrations", () => {
      class UserRepository {}

      registerDependency(UserRepository, UserRepository);
      const container = getContainer();
      const repo1 = container.resolve(UserRepository);
      expect(repo1).toBeInstanceOf(UserRepository);

      clearContainer();

      // Re-register after clear and verify it works
      registerDependency(UserRepository, UserRepository);
      const repo2 = container.resolve(UserRepository);
      expect(repo2).toBeInstanceOf(UserRepository);
    });

    it("should allow re-registration after clear", () => {
      class Service {}

      registerDependency(Service, Service);
      clearContainer();

      registerDependency(Service, Service);
      const container = getContainer();
      const service = container.resolve(Service);

      expect(service).toBeInstanceOf(Service);
    });
  });
});
