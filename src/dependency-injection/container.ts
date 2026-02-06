import "reflect-metadata";
import { container as tsyringeContainer } from "@zacatl/third-party";
import type { DependencyContainer, InjectionToken } from "@zacatl/third-party";

import type { Constructor } from "../service/layers/types";

/**
 * Standalone DI container decoupled from microservice architecture.
 * Automatically used by Service layers - typically no manual registration needed.
 *
 * For advanced use cases, you can register dependencies manually:
 *
 * @example
 * ```typescript
 * import { registerDependency, resolveDependency } from '@sentzunhat/zacatl';
 *
 * // Manual registration (advanced use case)
 * class CustomService { ... }
 * registerDependency('CustomService', CustomService);
 *
 * // Resolve manually
 * const service = resolveDependency<CustomService>('CustomService');
 * ```
 *
 * Preferred approach (automatic registration through Service):
 * ```typescript
 * const service = new Service({
 *   layers: {
 *     domain: { providers: [CustomService] }
 *   }
 * });
 * ```
 */

export const getContainer = (): DependencyContainer => {
  return tsyringeContainer;
};

export const registerDependency = <T>(
  token: InjectionToken<T>,
  implementation: new (...args: unknown[]) => T,
): void => {
  tsyringeContainer.register(token, { useClass: implementation });
};

export const registerSingleton = <T>(
  token: InjectionToken<T>,
  implementation: new (...args: unknown[]) => T,
): void => {
  tsyringeContainer.registerSingleton(token, implementation);
};

export const registerValue = <T>(token: InjectionToken<T>, value: T): void => {
  tsyringeContainer.register(token, { useValue: value });
};

export const resolveDependency = <T>(token: InjectionToken<T>): T => {
  return tsyringeContainer.resolve(token);
};

export const clearContainer = (): void => {
  tsyringeContainer.clearInstances();
  tsyringeContainer.reset();
};

/**
 * Resolve dependencies from the DI container
 *
 * Retrieve instances of already-registered classes.
 * Dependencies must be registered first (Service layers handle this automatically).
 *
 * @param dependencies - Array of class constructors to resolve
 * @returns Array of resolved instances in the same order
 *
 * @example
 * ```typescript
 * // Resolve services that were registered by Service layers
 * const services = resolveDependencies<Service>([UserService, ProductService]);
 * ```
 */
export const resolveDependencies = <T extends object>(
  dependencies: Array<Constructor<T>>,
): T[] => {
  return dependencies.map((dependency) =>
    tsyringeContainer.resolve<T>(dependency),
  );
};

// ============================================================================
// ADVANCED / LEGACY FUNCTIONS
// The following functions are for advanced use cases or testing.
// Most users should rely on Service layers for automatic DI registration.
// ============================================================================

/**
 * @deprecated Use Service layers for automatic registration.
 * Advanced: Register a dependency with explicit dependencies (no decorator metadata required)
 * Useful for tsx/ts-node environments or testing where decorator metadata is unavailable.
 */
export const registerWithDependencies = <T extends object>(
  serviceClass: Constructor<T>,
  dependencies: Constructor[] = [],
): void => {
  tsyringeContainer.register(serviceClass, {
    useFactory: () => {
      const resolvedDeps = dependencies.map((dep) => {
        if (!tsyringeContainer.isRegistered(dep)) {
          const depName = (dep as { name?: string }).name || "Unknown";
          const serviceName =
            (serviceClass as { name?: string }).name || "Unknown";
          throw new Error(
            `Dependency ${depName} not registered, required by ${serviceName}`,
          );
        }
        return tsyringeContainer.resolve(dep);
      });
      return new serviceClass(...resolvedDeps);
    },
  } as never);
};

/**
 * @deprecated Use Service layers for automatic registration.
 * Advanced: Register a singleton with explicit dependencies (no decorator metadata required)
 */
export const registerSingletonWithDependencies = <T extends object>(
  serviceClass: Constructor<T>,
  dependencies: Constructor[] = [],
): void => {
  let instance: T | null = null;

  tsyringeContainer.register(serviceClass, {
    useFactory: () => {
      if (instance) {
        return instance;
      }

      const resolvedDeps = dependencies.map((dep) => {
        if (!tsyringeContainer.isRegistered(dep)) {
          const depName = (dep as { name?: string }).name || "Unknown";
          const serviceName =
            (serviceClass as { name?: string }).name || "Unknown";
          throw new Error(
            `Dependency ${depName} not registered, required by ${serviceName}`,
          );
        }
        return tsyringeContainer.resolve(dep);
      });
      instance = new serviceClass(...resolvedDeps);
      return instance;
    },
  } as never);
};

/**
 * @deprecated Use Service layers for automatic registration.
 * Advanced: Register multiple dependencies at once
 */
export const registerDependencies = <T extends object>(
  dependencies: Array<Constructor<T>>,
): void => {
  for (const dependency of dependencies) {
    tsyringeContainer.register(dependency, {
      useClass: dependency,
    });
  }
};

/**
 * @deprecated Use Service layers for automatic registration.
 * Advanced: Register and resolve dependencies immediately (convenience function)
 */
export const registerAndResolve = <T extends object>(
  dependencies: Array<Constructor<T>>,
): T[] => {
  registerDependencies(dependencies);
  return resolveDependencies(dependencies);
};
