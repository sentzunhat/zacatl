import "reflect-metadata";
import { container as tsyringeContainer } from "tsyringe";
import type { DependencyContainer, InjectionToken } from "tsyringe";
import type { Constructor } from "../service/architecture/architecture";

/**
 * Track registered classes to avoid requiring decorator metadata
 */
const registeredClasses = new Set<Constructor>();

/**
 * Cache for singleton instances
 */
const singletonInstances = new Map<Constructor, object>();

/**
 * Standalone DI container decoupled from microservice architecture.
 * Automatically used by Service architecture - typically no manual registration needed.
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
 *   architecture: {
 *     domain: { providers: [CustomService] }
 *   }
 * });
 * ```
 */

/**
 * Get the global DI container instance
 */
export const getContainer = (): DependencyContainer => {
  return tsyringeContainer;
};

/**
 * Register a dependency in the container
 *
 * @param token - Unique identifier for the dependency
 * @param implementation - Class or value to register
 */
export const registerDependency = <T>(
  token: InjectionToken<T>,
  implementation: new (...args: unknown[]) => T,
): void => {
  tsyringeContainer.register(token, { useClass: implementation });
};

/**
 * Register a singleton dependency (shared instance)
 *
 * @param token - Unique identifier for the dependency
 * @param implementation - Class to register as singleton
 */
export const registerSingleton = <T>(
  token: InjectionToken<T>,
  implementation: new (...args: unknown[]) => T,
): void => {
  tsyringeContainer.registerSingleton(token, implementation);
};

/**
 * Register a value (instance) in the container
 *
 * @param token - Unique identifier for the dependency
 * @param value - Instance to register
 */
export const registerValue = <T>(token: InjectionToken<T>, value: T): void => {
  tsyringeContainer.register(token, { useValue: value });
};

/**
 * Resolve a dependency from the container
 *
 * @param token - Unique identifier for the dependency
 * @returns Resolved instance
 */
export const resolveDependency = <T>(token: InjectionToken<T>): T => {
  return tsyringeContainer.resolve(token);
};

/**
 * Register a dependency with explicit dependencies (no decorator metadata required)
 * Useful for tsx/ts-node/ESM environments where decorator metadata is not available
 *
 * @param serviceClass - Class to register
 * @param dependencies - Array of dependency classes to inject (in constructor order)
 *
 * @example
 * ```typescript
 * import { registerWithDependencies } from '@sentzunhat/zacatl';
 *
 * // Register with no deps
 * registerWithDependencies(MachineRepository, []);
 *
 * // Register with explicit deps
 * registerWithDependencies(MachineService, [MachineRepository]);
 * ```
 */
export const registerWithDependencies = <T extends object>(
  serviceClass: Constructor<T>,
  dependencies: Constructor[] = [],
): void => {
  // Track this class as registered
  registeredClasses.add(serviceClass);

  tsyringeContainer.register(serviceClass, {
    useFactory: () => {
      const resolvedDeps = dependencies.map((dep) => {
        // Check if dependency was registered
        if (!registeredClasses.has(dep)) {
          throw new Error(
            `Dependency ${dep.name} not registered. Register it before ${serviceClass.name}.`,
          );
        }
        // Resolve from container (works because we registered it)
        return tsyringeContainer.resolve(dep);
      });
      return new serviceClass(...resolvedDeps);
    },
  } as never);
};

/**
 * Register a singleton with explicit dependencies (no decorator metadata required)
 * Useful for tsx/ts-node/ESM environments where decorator metadata is not available
 *
 * @param serviceClass - Class to register as singleton
 * @param dependencies - Array of dependency classes to inject (in constructor order)
 *
 * @example
 * ```typescript
 * import { registerSingletonWithDependencies } from '@sentzunhat/zacatl';
 *
 * // Register singleton with deps
 * registerSingletonWithDependencies(MachineService, [MachineRepository]);
 * ```
 */
export const registerSingletonWithDependencies = <T extends object>(
  serviceClass: Constructor<T>,
  dependencies: Constructor[] = [],
): void => {
  // Track this class as registered
  registeredClasses.add(serviceClass);

  // Use register() with manual singleton pattern (lifecycle can't be used with factories)
  tsyringeContainer.register(serviceClass, {
    useFactory: () => {
      // Check if we already have a singleton instance
      if (singletonInstances.has(serviceClass)) {
        return singletonInstances.get(serviceClass) as T;
      }

      // Create new instance
      const resolvedDeps = dependencies.map((dep) => {
        // Check if dependency was registered
        if (!registeredClasses.has(dep)) {
          throw new Error(
            `Dependency ${dep.name} not registered. Register it before ${serviceClass.name}.`,
          );
        }
        // Resolve from container (works because we registered it)
        return tsyringeContainer.resolve(dep);
      });
      const instance = new serviceClass(...resolvedDeps);

      // Cache the singleton instance
      singletonInstances.set(serviceClass, instance);
      return instance;
    },
  } as never);
};

/**
 * Clear all registrations (useful for testing)
 */
export const clearContainer = (): void => {
  tsyringeContainer.clearInstances();
  tsyringeContainer.reset();
  singletonInstances.clear();
  registeredClasses.clear();
};
