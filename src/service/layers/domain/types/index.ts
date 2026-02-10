import type { Constructor } from "../../types";
import type { ProviderPort, ServicePort } from "../ports";

/**
 * Domain providers that implement business logic and domain services.
 * Providers may optionally implement a start() method for initialization.
 */
export type DomainProviders = Array<Constructor<ProviderPort>>;
export type DomainServices = Array<Constructor<ServicePort>>;

export type ConfigDomain = {
  providers?: DomainProviders;
  services?: DomainServices;
};
