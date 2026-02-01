import "reflect-metadata";
import { container as tsyringeContainer } from "tsyringe";
import type { DependencyContainer, InjectionToken } from "tsyringe";

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
 * Clear all registrations (useful for testing)
 */
export const clearContainer = (): void => {
  tsyringeContainer.clearInstances();
  tsyringeContainer.reset();
};
