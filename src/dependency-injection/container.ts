import '@zacatl/third-party/dependency-injection/reflect-metadata';
import { InternalServerError } from '@zacatl/error';
import { container as tsyringeContainer } from '@zacatl/third-party/dependency-injection/tsyringe';
import type { DependencyContainer, InjectionToken } from '@zacatl/third-party/dependency-injection/tsyringe';

import type { Constructor } from '../service/layers/types';

export const getContainer = (): typeof tsyringeContainer => {
  return tsyringeContainer;
};

/**
 * Create a child container that inherits registrations from a parent.
 *
 * Resolutions in the child container fall back to the parent when the token
 * is not registered locally, allowing scoped overrides without polluting the
 * global container.
 *
 * @param parent - Parent container; defaults to the global tsyringe container
 * @returns A new child DependencyContainer
 */
export const createChildContainer = (parent?: DependencyContainer): DependencyContainer => {
  return (parent ?? tsyringeContainer).createChildContainer();
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

/**
 * Register a class as a singleton unless it is already registered.
 *
 * The single source of truth for the guard used by the Application, Domain,
 * and Infrastructure layers: classes decorated with `@singleton()` register
 * themselves on module load, and re-registering would silently clobber the
 * existing (possibly already-resolved) registration.
 *
 * @param dependency - Class constructor to register
 * @param container - Container to register into; defaults to the global container
 */
export const ensureRegisteredSingleton = <T extends object>(
  dependency: Constructor<T>,
  container: DependencyContainer = tsyringeContainer,
): void => {
  if (!container.isRegistered(dependency)) {
    container.registerSingleton(dependency as InjectionToken<T>, dependency);
  }
};

/**
 * Register a value token in the DI container.
 *
 * @param token - Injection token to register
 * @param value - Value to bind to the token
 * @param container - Container to register into; defaults to the global container
 */
export const registerValue = <T>(
  token: InjectionToken<T>,
  value: T,
  container: DependencyContainer = tsyringeContainer,
): void => {
  container.register(token, { useValue: value });
};

export const resolveDependency = <T>(token: InjectionToken<T>): T => {
  return tsyringeContainer.resolve(token);
};

/**
 * Clear all instances (and optionally reset) a container.
 *
 * @param container - Container to clear; defaults to the global container
 */
export const clearContainer = (container: DependencyContainer = tsyringeContainer): void => {
  container.clearInstances();
  container.reset();
};

/**
 * Resolve dependencies from the DI container
 *
 * Retrieve instances of already-registered classes.
 * Dependencies must be registered first (Service layers handle this
 * automatically). This function does not auto-register unregistered classes;
 * it throws if a dependency is not registered. Ensure classes are decorated
 * with `@injectable()` (or `@singleton()`) and are registered by Service
 * layer composition before resolving.
 *
 * @param dependencies - Array of class constructors to resolve
 * @param container - Container to resolve from; defaults to the global container
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
  container: DependencyContainer = tsyringeContainer,
): T[] => {
  return dependencies.map((dependency) => {
    // Check registration before attempting to resolve
    if (!container.isRegistered(dependency)) {
      const name = (dependency as { name?: string }).name ?? String(dependency);
      throw new InternalServerError({
        message: `Failed to resolve '${name}' from the DI container`,
        reason:
          'Make sure the class is decorated with @injectable() (or @singleton()) ' +
          'and is registered before resolution. ' +
          "If this class is a repository, ensure it is listed under 'layers.infrastructure.repositories'. " +
          "If it is a domain service, ensure it is listed under 'layers.domain.providers'.",
        component: 'DIContainer',
        operation: 'resolveDependencies',
        metadata: { dependencyName: name },
      });
    }

    try {
      return container.resolve<T>(dependency);
    } catch (err) {
      const name = (dependency as { name?: string }).name ?? String(dependency);
      throw new InternalServerError({
        message: `Failed to resolve '${name}' from the DI container`,
        reason: err instanceof Error ? err.message : String(err),
        component: 'DIContainer',
        operation: 'resolveDependencies',
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
 * @param container - Container to register into; defaults to the global container
 *
 * @example
 * ```typescript
 * registerDependencies([UserRepository, ProductRepository]);
 * ```
 */
export const registerDependencies = <T extends object>(
  dependencies: Array<Constructor<T>>,
  container: DependencyContainer = tsyringeContainer,
): void => {
  for (const dependency of dependencies) {
    container.register(dependency, {
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
