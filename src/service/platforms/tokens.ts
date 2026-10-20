import type { InjectionToken } from '@zacatl/third-party/dependency-injection/tsyringe';

import type { CliConfig } from './cli/types';
import type { DesktopConfig } from './desktop/types';
import type { PlatformsConfig } from './types';

// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const PlatformsConfigToken: InjectionToken<PlatformsConfig> = Symbol.for(
  '@sentzunhat/zacatl/service/platforms/config',
);

// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const CliConfigToken: InjectionToken<CliConfig> = Symbol.for(
  '@sentzunhat/zacatl/service/platforms/cli/config',
);
// eslint-disable-next-line @typescript-eslint/naming-convention -- DI token names use PascalCase like LoggerToken.
export const DesktopConfigToken: InjectionToken<DesktopConfig> = Symbol.for(
  '@sentzunhat/zacatl/service/platforms/desktop/config',
);
