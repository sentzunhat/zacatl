import type {
  DependencyContainer,
  InjectionToken,
} from '@zacatl/third-party/dependency-injection/tsyringe';

import type { ApiServerPort } from './api/port';
import type { DatabaseConfig } from './database/port';
import type { PageServerPort } from './page/port';
import type { ServerConfig } from './server';
import type { HttpServerConfig } from './types/server-config';

// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const ServerConfigToken: InjectionToken<ServerConfig> = Symbol.for(
  '@sentzunhat/zacatl/service/platforms/server/config',
);
// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const ApiServerConfigToken: InjectionToken<HttpServerConfig> = Symbol.for(
  '@sentzunhat/zacatl/service/platforms/server/api/config',
);
// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const ApiServerAdapterToken: InjectionToken<ApiServerPort> = Symbol.for(
  '@sentzunhat/zacatl/service/platforms/server/api/adapter',
);
// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const ApiServerContainerToken: InjectionToken<DependencyContainer> = Symbol.for(
  '@sentzunhat/zacatl/service/platforms/server/api/container',
);
// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const PageServerConfigToken: InjectionToken<ServerConfig> = Symbol.for(
  '@sentzunhat/zacatl/service/platforms/server/page/config',
);
// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const PageServerAdapterToken: InjectionToken<PageServerPort> = Symbol.for(
  '@sentzunhat/zacatl/service/platforms/server/page/adapter',
);
// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const DatabaseServiceNameToken: InjectionToken<string> = Symbol.for(
  '@sentzunhat/zacatl/service/platforms/server/database/service-name',
);
// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const DatabaseConfigsToken: InjectionToken<DatabaseConfig[]> = Symbol.for(
  '@sentzunhat/zacatl/service/platforms/server/database/configs',
);
// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const DatabaseContainerToken: InjectionToken<DependencyContainer> = Symbol.for(
  '@sentzunhat/zacatl/service/platforms/server/database/container',
);
