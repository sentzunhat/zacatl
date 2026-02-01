/**
 * Test Auto-Registration Without Service
 *
 * Verifies that infrastructure, application, and domain layers
 * can auto-register dependencies without needing Service orchestration.
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  clearContainer,
  resolveDependency,
} from "../../src/dependency-injection";
import { Domain } from "../../src/service/architecture/domain/domain";
import { Infrastructure } from "../../src/service/architecture/infrastructure/infrastructure";

describe("Auto-Registration Without Service", () => {
  beforeEach(() => {
    clearContainer();
  });

  it("should auto-register domain providers on construction", () => {
    class MyService {
      getName() {
        return "MyService";
      }
    }

    // Create domain with autoRegister: true
    new Domain({
      providers: [MyService],
      autoRegister: true,
    });

    // Should be resolvable immediately without calling start()
    const service = resolveDependency<MyService>("MyService");
    expect(service).toBeDefined();
    expect(service.getName()).toBe("MyService");
  });

  it("should NOT auto-register when autoRegister is false", () => {
    class AnotherService {
      getName() {
        return "AnotherService";
      }
    }

    // Create domain WITHOUT autoRegister
    const domain = new Domain({
      providers: [AnotherService],
      autoRegister: false, // explicit
    });

    // Should NOT be resolvable yet
    expect(() => resolveDependency("AnotherService")).toThrow();

    // After calling start(), should be resolvable
    domain.start();
    const service = resolveDependency<AnotherService>("AnotherService");
    expect(service.getName()).toBe("AnotherService");
  });

  it("should work without Service - direct layer usage", () => {
    class UserService {
      getUser() {
        return { id: 1, name: "John" };
      }
    }

    class UserRepository {
      findUser() {
        return { id: 1, name: "John" };
      }
    }

    // Use layers directly without Service
    new Domain({
      providers: [UserService],
      autoRegister: true,
    });

    new Infrastructure({
      repositories: [UserRepository],
      autoRegister: true,
    });

    // Both should be resolvable
    const userService = resolveDependency<UserService>("UserService");
    const userRepo = resolveDependency<UserRepository>("UserRepository");

    expect(userService.getUser()).toEqual({ id: 1, name: "John" });
    expect(userRepo.findUser()).toEqual({ id: 1, name: "John" });
  });

  it("should support DI injection between auto-registered layers", () => {
    class DataService {
      getData() {
        return "data";
      }
    }

    class BusinessService {
      dataService: DataService;

      constructor() {
        this.dataService = resolveDependency<DataService>("DataService");
      }

      process() {
        return this.dataService.getData().toUpperCase();
      }
    }

    // Register infrastructure first
    new Infrastructure({
      repositories: [DataService],
      autoRegister: true,
    });

    // Register domain that depends on infrastructure
    new Domain({
      providers: [BusinessService],
      autoRegister: true,
    });

    const business = resolveDependency<BusinessService>("BusinessService");
    expect(business.process()).toBe("DATA");
  });
});
