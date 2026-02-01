import { afterEach, beforeEach, describe, expect, it } from "vitest";

import {
  clearContainer,
  registerDependency,
  registerSingleton,
  registerValue,
  resolveDependency,
} from "../../../src/dependency-injection/container";

class TestService {
  public id = Math.random();

  public getMessage(): string {
    return "Hello from TestService";
  }
}

class TestRepository {
  public name = "TestRepository";

  public findAll(): string[] {
    return ["item1", "item2"];
  }
}

describe("Dependency Injection Container", () => {
  beforeEach(() => {
    clearContainer();
  });

  afterEach(() => {
    clearContainer();
  });

  it("should register and resolve a dependency", () => {
    registerDependency("TestService", TestService);

    const service = resolveDependency<TestService>("TestService");

    expect(service).toBeInstanceOf(TestService);
    expect(service.getMessage()).toBe("Hello from TestService");
  });

  it("should register and resolve a singleton (shared instance)", () => {
    registerSingleton("TestService", TestService);

    const instance1 = resolveDependency<TestService>("TestService");
    const instance2 = resolveDependency<TestService>("TestService");

    expect(instance1).toBe(instance2); // Same instance
    expect(instance1.id).toBe(instance2.id);
  });

  it("should create new instances for non-singleton registrations", () => {
    registerDependency("TestService", TestService);

    const instance1 = resolveDependency<TestService>("TestService");
    const instance2 = resolveDependency<TestService>("TestService");

    expect(instance1).toBeInstanceOf(TestService);
    expect(instance2).toBeInstanceOf(TestService);
    expect(instance1.id).not.toBe(instance2.id); // Different instances
  });

  it("should register and resolve a value (instance)", () => {
    const repoInstance = new TestRepository();
    registerValue("TestRepository", repoInstance);

    const resolved = resolveDependency<TestRepository>("TestRepository");

    expect(resolved).toBe(repoInstance);
    expect(resolved.name).toBe("TestRepository");
    expect(resolved.findAll()).toEqual(["item1", "item2"]);
  });

  it("should support multiple different registrations", () => {
    registerDependency("TestService", TestService);
    registerSingleton("TestRepository", TestRepository);

    const service = resolveDependency<TestService>("TestService");
    const repo = resolveDependency<TestRepository>("TestRepository");

    expect(service).toBeInstanceOf(TestService);
    expect(repo).toBeInstanceOf(TestRepository);
  });

  it("should clear all registrations", () => {
    registerDependency("TestService", TestService);
    clearContainer();

    expect(() => {
      resolveDependency<TestService>("TestService");
    }).toThrow();
  });
});
