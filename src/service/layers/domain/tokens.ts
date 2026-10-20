import type {
  DependencyContainer,
  InjectionToken,
} from '@zacatl/third-party/dependency-injection/tsyringe';

import type { DomainConfig } from './types';

// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const DomainContainerToken: InjectionToken<DependencyContainer> = Symbol.for(
  '@sentzunhat/zacatl/service/layers/domain/container',
);
// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const DomainConfigToken: InjectionToken<DomainConfig> = Symbol.for(
  '@sentzunhat/zacatl/service/layers/domain/config',
);
