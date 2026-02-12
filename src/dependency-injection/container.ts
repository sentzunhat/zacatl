import "../third-party/reflect-metadata";
import { container as tsyringeContainer } from "@zacatl/third-party/tsyringe";
import type {
  DependencyContainer,
  InjectionToken,
} from "@zacatl/third-party/tsyringe";

import type { Constructor } from "../service/layers/types";

/**
 * Standalone DI container decoupled from microservice architecture.
 * Automatically used by Service layers - typically no manual registration needed.
 *
 * For advanced use cases, you can register dependencies manually:
 *
 * @example
 * ```typescript
 * import { registerDependency, resolveDependency } from '@zacatl';
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

/**
 * Register multiple dependencies at once
 *
 * Batch register classes with the DI container.
 * Typically used by Service layers for layer composition.
 *
 * @param dependencies - Array of class constructors to register
 *
 * @example
 * ```typescript
 * registerDependencies([UserRepository, ProductRepository]);
 * ```
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
 * Register and resolve dependencies immediately (convenience function)
 *
 * Combines registration and resolution in a single call.
 * Useful for quick initialization patterns.
 *
 * @param dependencies - Array of class constructors to register and resolve
 * @returns Array of resolved instances in the same order
 *
 * @example
 * ```typescript
 * const services = registerAndResolve([UserService, ProductService]);
 * ```
 */
export const registerAndResolve = <T extends object>(
  dependencies: Array<Constructor<T>>,
): T[] => {
  registerDependencies(dependencies);
  return resolveDependencies(dependencies);
};
