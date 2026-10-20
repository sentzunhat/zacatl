import type {
  DependencyContainer,
  InjectionToken,
} from '@zacatl/third-party/dependency-injection/tsyringe';

import type { ApplicationConfig } from './types';

// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const ApplicationContainerToken: InjectionToken<DependencyContainer> = Symbol.for(
  '@sentzunhat/zacatl/service/layers/application/container',
);
// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const ApplicationConfigToken: InjectionToken<ApplicationConfig> = Symbol.for(
  '@sentzunhat/zacatl/service/layers/application/config',
);
