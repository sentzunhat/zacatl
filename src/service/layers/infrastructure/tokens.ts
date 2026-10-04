import type {
  DependencyContainer,
  InjectionToken,
} from '@zacatl/third-party/dependency-injection/tsyringe';

import type { InfrastructureConfig } from './types';

// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const InfrastructureContainerToken: InjectionToken<DependencyContainer> = Symbol.for(
  '@sentzunhat/zacatl/service/layers/infrastructure/container',
);
// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const InfrastructureConfigToken: InjectionToken<InfrastructureConfig> = Symbol.for(
  '@sentzunhat/zacatl/service/layers/infrastructure/config',
);
