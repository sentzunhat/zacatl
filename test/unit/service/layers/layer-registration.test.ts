import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearContainer,
  resolveDependency,
  registerDependencies,
  resolveDependencies,
  registerAndResolve,
  registerDependency,
} from '../../../../src/dependency-injection';

describe('Layer Registration Pattern', () => {
  beforeEach(() => {
    clearContainer();
  });

  it('should register and resolve dependencies in correct order', () => {
    // Infrastructure layer
    class UserRepository {
      getData() {
        return 'user-data';
      }
    }

    // Domain layer - manually register dependencies
    class UserService {
      public repo: UserRepository;

      constructor(repo: UserRepository) {
        this.repo = repo;
      }

      getUser() {
        return this.repo.getData();
      }
    }

    // Register in correct order
    registerDependency(UserRepository, UserRepository);

    // For UserService with constructor dependency, manually instantiate
    const userRepo = resolveDependency<UserRepository>(UserRepository);
    const userService = new UserService(userRepo);

    expect(userService).toBeInstanceOf(UserService);
    expect(userService.getUser()).toBe('user-data');
  });

  it('should support registerAndResolve convenience function', () => {
    class SimpleService {
      getValue() {
        return 'simple';
      }
    }

    const services = registerAndResolve([SimpleService]);
    const service = services[0];

    expect(service).toBeInstanceOf(SimpleService);
    expect(service!.getValue()).toBe('simple');
  });

  it('should handle multiple dependencies in single call', () => {
    class ServiceA {
      name = 'A';
    }
    class ServiceB {
      name = 'B';
    }
    class ServiceC {
      name = 'C';
    }

    registerDependencies([ServiceA, ServiceB, ServiceC]);
    const services = resolveDependencies([ServiceA, ServiceB, ServiceC]);

    expect(services).toHaveLength(3);
    expect(services[0]?.name).toBe('A');
    expect(services[1]?.name).toBe('B');
    expect(services[2]?.name).toBe('C');
  });

  it('should maintain instance order', () => {
    class First {
      order = 1;
    }
    class Second {
      order = 2;
    }
    class Third {
      order = 3;
    }

    const instances = registerAndResolve([First, Second, Third]);

    expect(instances[0]?.order).toBe(1);
    expect(instances[1]?.order).toBe(2);
    expect(instances[2]?.order).toBe(3);
  });
});
