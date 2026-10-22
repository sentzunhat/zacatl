import { InternalServerError } from '@zacatl/error';
import { getContainer, registerValue } from '@zacatl/third-party/dependency-injection';
import { createChildContainer } from '@zacatl/third-party/dependency-injection/container';
import {
  inject,
  injectable,
  type DependencyContainer,
} from '@zacatl/third-party/dependency-injection/tsyringe';

import { Application } from './application/application';
import { ApplicationConfigToken, ApplicationContainerToken } from './application/tokens';
import { DomainConfigToken, DomainContainerToken } from './domain/tokens';
import { withOrmConstructionScope } from './infrastructure/orm/scope';
import { LayerContainerScopesToken, LayersConfigToken, type LayerContainerScopes } from './tokens';
import { ServiceContainerToken } from '../tokens/service';
import { Domain } from './domain/domain';
import { Infrastructure } from './infrastructure/infrastructure';
import { InfrastructureConfigToken, InfrastructureContainerToken } from './infrastructure/tokens';
import type { LayersConfig } from './types';

@injectable()
export class Layers {
  private readonly infrastructure: Infrastructure | undefined;

  constructor(
    @inject(LayersConfigToken) config: LayersConfig,
    @inject(ServiceContainerToken) parentContainer?: DependencyContainer,
    @inject(LayerContainerScopesToken) registeredContainers?: LayerContainerScopes,
  ) {
    const standalone = parentContainer == null && registeredContainers == null;

    // Keep the public `new Layers(config, parentContainer)` form working. The
    // Service-managed path supplies the complete graph through DI; direct
    // callers can still provide a parent and let Layers derive its children.
    if (parentContainer == null && registeredContainers != null) {
      throw new InternalServerError({
        message: 'Layers requires a Service container when layer scopes are provided',
        reason: 'Layer container scopes cannot be attached without their Service parent',
        component: 'Layers',
        operation: 'constructor',
      });
    }

    const serviceContainer = parentContainer ?? createChildContainer(getContainer());
    if (standalone) {
      registerValue(ServiceContainerToken, serviceContainer, serviceContainer);
    }

    // The scopes intentionally form a chain, not siblings: Domain can resolve
    // Infrastructure registrations, and Application can resolve both Domain
    // and Infrastructure. The reverse direction stays unavailable, preserving
    // the dependency flow without putting layer registrations in global DI.
    const infraContainer =
      registeredContainers?.infrastructure ?? createChildContainer(serviceContainer);
    const domainContainer = registeredContainers?.domain ?? createChildContainer(infraContainer);
    const appContainer = registeredContainers?.application ?? createChildContainer(domainContainer);
    if (registeredContainers == null) {
      if (!serviceContainer.isRegistered(ServiceContainerToken, false)) {
        registerValue(ServiceContainerToken, serviceContainer, serviceContainer);
      }
      registerValue(InfrastructureContainerToken, infraContainer, infraContainer);
      registerValue(DomainContainerToken, domainContainer, domainContainer);
      registerValue(ApplicationContainerToken, appContainer, appContainer);
    }

    // 1. Infrastructure (repositories) - no dependencies
    if (config.infrastructure) {
      registerValue(InfrastructureConfigToken, config.infrastructure, infraContainer);
      // Direct Layers consumers historically register ORM instances in the
      // global container, including when they supply a parent for layer DI.
      // Service-managed Layers keep ORM resolution strictly inside their
      // owning Infrastructure container.
      this.infrastructure = registeredContainers == null
        ? withOrmConstructionScope(
          getContainer(),
          () => infraContainer.resolve(Infrastructure),
        )
        : infraContainer.resolve(Infrastructure);
    }

    // 2. Domain (services) - depends on repositories
    if (config.domain) {
      registerValue(DomainConfigToken, config.domain, domainContainer);
      domainContainer.resolve(Domain);
    }

    // 3. Application (handlers) - depends on services
    if (config.application) {
      registerValue(ApplicationConfigToken, config.application, appContainer);
      appContainer.resolve(Application);
    }
  }

  public async start(): Promise<void> {
    await this.infrastructure?.start();
  }

}
