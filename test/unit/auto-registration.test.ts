/**
 * Test Auto-Registration Without Service
 *
 * Verifies that infrastructure, application, and domain layers
 * can auto-register dependencies without needing Service orchestration.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { container } from 'tsyringe';

import { clearContainer, resolveDependency } from '../../src/dependency-injection';
import { Domain } from '../../src/service/layers/domain/domain';
import { Infrastructure } from '../../src/service/layers/infrastructure/infrastructure';
import type { RepositoryPort } from '../../src/service/layers/infrastructure/types';
import type { RepositoryModel } from '../../src/service/layers/infrastructure/repositories/types';

describe('Auto-Registration Without Service', () => {
  beforeEach(() => {
    clearContainer();
  });

  it('should auto-register domain providers on construction', () => {
    class MyService {
      getName() {
        return 'MyService';
      }
    }

    // Create domain - always auto-registers in constructor
    new Domain({
      providers: [MyService],
    });

    // Should be resolvable immediately without calling start()
    const service = resolveDependency(MyService);
    expect(service).toBeDefined();
    expect(service.getName()).toBe('MyService');
  });

  it('should auto-register on construction (new behavior)', () => {
    const registerSpy = vi.spyOn(container, 'register');

    class AnotherService {
      getName() {
        return 'AnotherService';
      }
    }

    // Create domain - now always registers in constructor
    new Domain({
      providers: [AnotherService],
    });

    // Should have registered immediately
    expect(registerSpy).toHaveBeenCalledWith(
      AnotherService,
      { useClass: AnotherService },
      { lifecycle: 1 },
    );

    const service = resolveDependency(AnotherService);
    expect(service.getName()).toBe('AnotherService');
  });

  it('should work without Service - direct layer usage', () => {
    class UserService {
      getUser() {
        return { id: 1, name: 'John' };
      }
    }

    class BaseTestRepository implements RepositoryPort<object> {
      public model = {} as RepositoryModel<object>;

      public toLean(input: object): object | null {
        return input ? (input as object) : null;
      }

      async findById(_id: string): Promise<object | null> {
        return null;
      }

      async findMany(_filter?: Record<string, unknown>): Promise<object[]> {
        return [];
      }

      async create(_data: Partial<object>): Promise<object> {
        return {};
      }

      async update(_id: string, _data: Partial<object>): Promise<object | null> {
        return null;
      }

      async delete(_id: string): Promise<object | null> {
        return null;
      }

      async exists(_id: string): Promise<boolean> {
        return false;
      }
    }

    class UserRepository extends BaseTestRepository {
      findUser() {
        return { id: 1, name: 'John' };
      }
    }

    // Use layers directly without Service - auto-registers in constructor
    new Domain({
      providers: [UserService],
    });

    new Infrastructure({
      repositories: [UserRepository],
    });

    // Both should be resolvable
    const userService = resolveDependency(UserService);
    const userRepo = resolveDependency(UserRepository);

    expect(userService.getUser()).toEqual({ id: 1, name: 'John' });
    expect(userRepo.findUser()).toEqual({ id: 1, name: 'John' });
  });

  it('should support DI injection between auto-registered layers', () => {
    class DataService implements RepositoryPort<object> {
      public model = {} as RepositoryModel<object>;

      public toLean(input: object): object | null {
        return input ? (input as object) : null;
      }

      getData() {
        return 'data';
      }

      async findById(_id: string): Promise<object | null> {
        return null;
      }

      async findMany(_filter?: Record<string, unknown>): Promise<object[]> {
        return [];
      }

      async create(_data: Partial<object>): Promise<object> {
        return {};
      }

      async update(_id: string, _data: Partial<object>): Promise<object | null> {
        return null;
      }

      async delete(_id: string): Promise<object | null> {
        return null;
      }

      async exists(_id: string): Promise<boolean> {
        return false;
      }
    }

    class BusinessService {
      dataService: DataService;

      constructor() {
        this.dataService = resolveDependency(DataService);
      }

      process() {
        return this.dataService.getData().toUpperCase();
      }
    }

    // Register infrastructure first
    new Infrastructure({
      repositories: [DataService],
    });

    // Register domain that depends on infrastructure
    new Domain({
      providers: [BusinessService],
    });

    const business = resolveDependency(BusinessService);
    expect(business.process()).toBe('DATA');
  });
});
