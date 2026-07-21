// @barrel-generated
import type { ApplicationConfig } from './application/types';
import type { ProviderPort } from './domain/ports/provider';
import type { DomainConfig } from './domain/types';
import type { InfrastructureConfig } from './infrastructure/types';
import type { Optional } from '../../utils/optionals';

export interface LayersConfig {
  /** Application layer: Entry points for different contexts */
  application?: Optional<ApplicationConfig>;

  /** Domain layer: Business logic providers (always required) */
  domain?: Optional<DomainConfig>;

  /** Infrastructure layer: Data access repositories (always required) */
  infrastructure?: Optional<InfrastructureConfig>;
}

/**
 * Constructor type that accepts classes with arbitrary parameter signatures
 * Uses contravariant any[] to allow flexibility in DI container
 * Supports both manual instantiation and automatic DI resolution
 * Note: any[] is intentional here for constructor signature compatibility
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Constructor<T = object> = new (...args: any[]) => T;

/**
 * Domain layer provider - business logic service
 * Consistent naming with HookHandler, RouteHandler, and Repository types
 */
export type Provider = Constructor<ProviderPort>;

export interface DependencyInjection<T> {
  register: (dependency: Constructor<T>) => void;
  resolve: (dependency: Constructor<T>) => T;
}
