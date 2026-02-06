import type { Constructor } from "../../types";

/**
 * Domain providers that implement business logic and domain services.
 * Providers may optionally implement a start() method for initialization.
 * Use any to support custom provider/service interfaces
 */
export type DomainProviders = Array<Constructor<any>>;
export type DomainServices = Array<Constructor<any>>;

export type ConfigDomain = {
  providers?: DomainProviders;
  services?: DomainServices;
};
