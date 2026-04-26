// @barrel-generated
import type { Constructor } from '../types';
import type { ProviderPort } from './ports/provider';
import type { ServicePort } from './ports/service';

/**
 * Domain providers that implement business logic and domain services.
 * Providers may optionally implement a start() method for initialization.
 */
export type DomainProviders = Array<Constructor<ProviderPort>>;
export type DomainServices = Array<Constructor<ServicePort>>;

export interface ConfigDomain {
  providers?: DomainProviders;
  services?: DomainServices;
}
