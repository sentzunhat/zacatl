import "../third-party/reflect-metadata";
import { InternalServerError } from "@zacatl/error";
import { container as tsyringeContainer } from "@zacatl/third-party/tsyringe";
import type { InjectionToken } from "@zacatl/third-party/tsyringe";

import type { Constructor } from "../service/layers/types";

export const getContainer = (): typeof tsyringeContainer => {
  return tsyringeContainer;
};

export const registerDependency = <T>(
  token: InjectionToken<T>,
  implementation: new (...args: unknown[]) => T,
): void => {
  tsyringeContainer.register(token, { useClass: implementation });
};

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
/**
 * Resolve dependencies from the DI container
 *
 * Retrieve instances of already-registered classes.
 * Dependencies must be registered first (Service layers handle this automatically).
 * This function does not auto-register unregistered classes; it will throw if a
 * dependency is not registered. Ensure classes are decorated with `@injectable()`
 * (or `@singleton()`) and are registered by Service layer composition before
 * resolving.
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
 * For classes not yet registered, auto-registers them as singletons before resolving.
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
export const resolveDependencies = <T extends object>(dependencies: Array<Constructor<T>>): T[] => {
  return dependencies.map((dependency) => {
    // Check registration before attempting to resolve
    if (!tsyringeContainer.isRegistered(dependency)) {
      const name = (dependency as { name?: string }).name ?? String(dependency);
      throw new InternalServerError({
        message: `Failed to resolve '${name}' from the DI container`,
        reason:
          "Make sure the class is decorated with @injectable() (or @singleton()) " +
          "and is registered before resolution. " +
          "If this class is a repository, ensure it is listed under 'layers.infrastructure.repositories'. " +
          "If it is a domain service, ensure it is listed under 'layers.domain.providers'.",
        component: "DIContainer",
        operation: "resolveDependencies",
        metadata: { dependencyName: name },
      });
    }

    try {
      return tsyringeContainer.resolve<T>(dependency);
    } catch (err) {
      const name = (dependency as { name?: string }).name ?? String(dependency);
      throw new InternalServerError({
        message: `Failed to resolve '${name}' from the DI container`,
        reason: err instanceof Error ? err.message : String(err),
        component: "DIContainer",
        operation: "resolveDependencies",
        metadata: { dependencyName: name },
        error: err instanceof Error ? err : undefined,
      });
    }
  });
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
export const registerAndResolve = <T extends object>(dependencies: Array<Constructor<T>>): T[] => {
  registerDependencies(dependencies);
  return resolveDependencies(dependencies);
};
