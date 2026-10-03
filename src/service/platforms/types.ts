// @barrel-generated
import type { CliConfig } from './cli/types';
import type { DesktopConfig } from './desktop/types';
import type { ServerConfig } from './server/server';
import type { Optional } from '../../utils/optionals';

export interface PlatformsConfig {
  /** Server configuration (required for SERVER type) */
  server?: Optional<ServerConfig>;

  /** CLI configuration (required for CLI type) */
  cli?: Optional<CliConfig>;

  /** Desktop configuration (required for DESKTOP type) */
  desktop?: Optional<DesktopConfig>;
}
