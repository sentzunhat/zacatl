// @barrel-generated
import type { Logger } from '@zacatl/logs';

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

  /**
   * Logger for platform-level logs. The Service fills this from
   * `ServiceConfig.logger`; it is handed on to platforms that do not set
   * their own (e.g. `server.logger`).
   */
  logger?: Logger;
}
