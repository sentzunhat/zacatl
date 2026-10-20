import type {
  DependencyContainer,
  InjectionToken,
} from '@zacatl/third-party/dependency-injection/tsyringe';

// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const ServiceContainerToken: InjectionToken<DependencyContainer> = Symbol.for(
  '@sentzunhat/zacatl/service/container',
);
