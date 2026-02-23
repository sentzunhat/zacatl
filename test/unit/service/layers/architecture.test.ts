import { container } from 'tsyringe';

import {
  registerDependencies,
  registerAndResolve,
} from '../../../../src/dependency-injection/container';

class DummyDependency {
  public value = 'dummy';
}

class AnotherDependency {
  public name = 'another';
  public value = 'test-value';
}

describe('Layer Composition Utilities', () => {
  describe('registerDependencies', () => {
    it('should register each dependency with the container', () => {
      const spyFunction = vi.spyOn(container, 'register');

      registerDependencies([DummyDependency, AnotherDependency]);

      expect(spyFunction).toHaveBeenCalledWith(DummyDependency, {
        useClass: DummyDependency,
      });
      expect(spyFunction).toHaveBeenCalledWith(AnotherDependency, {
        useClass: AnotherDependency,
      });
    });

    it('should handle empty array', () => {
      const spyFunction = vi.spyOn(container, 'register');
      const initialCallCount = spyFunction.mock.calls.length;

      registerDependencies([]);

      expect(spyFunction.mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('registerAndResolve', () => {
    it('should register dependencies and return resolved instances', () => {
      const registerSpy = vi.spyOn(container, 'register');
      const resolveSpy = vi.spyOn(container, 'resolve');

      const instances = registerAndResolve([DummyDependency]);

      expect(registerSpy).toHaveBeenCalledWith(DummyDependency, {
        useClass: DummyDependency,
      });
      expect(resolveSpy).toHaveBeenCalledWith(DummyDependency);
      expect(instances).toHaveLength(1);
    });

    it('should return array of resolved instances in order', () => {
      const instances = registerAndResolve([DummyDependency, AnotherDependency]);

      expect(instances).toHaveLength(2);
      expect(instances[0]).toBeInstanceOf(DummyDependency);
      expect(instances[1]).toBeInstanceOf(AnotherDependency);
    });

    it('should return empty array for empty input', () => {
      const instances = registerAndResolve([]);

      expect(instances).toEqual([]);
    });
  });
});
