import type {
  DependencyContainer,
  InjectionToken,
} from '@zacatl/third-party/dependency-injection/tsyringe';

import type { LayersConfig } from './types';

export interface LayerContainerScopes {
  infrastructure: DependencyContainer;
  domain: DependencyContainer;
  application: DependencyContainer;
}

// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const LayerContainerScopesToken: InjectionToken<LayerContainerScopes> = Symbol.for(
  '@sentzunhat/zacatl/service/layers/container-scopes',
);
// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const LayersConfigToken: InjectionToken<LayersConfig> = Symbol.for(
  '@sentzunhat/zacatl/service/layers/config',
);
