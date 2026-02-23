import type { Optional } from '../../../utils/optionals';
import type { ConfigCLI } from '../cli/types';
import type { ConfigDesktop } from '../desktop/types';
import type { ConfigServer } from '../server/server';

export interface ConfigPlatforms {
  /** Server configuration (required for SERVER type) */
  server?: Optional<ConfigServer>;

  /** CLI configuration (required for CLI type) */
  cli?: Optional<ConfigCLI>;

  /** Desktop configuration (required for DESKTOP type) */
  desktop?: Optional<ConfigDesktop>;
}
