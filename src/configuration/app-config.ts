/**
 * Application-wide configuration via node-config
 * Loads from config/ directory with environment-specific overrides
 */

import config from "config";

type ConfigInput = {
  SERVICE_NAME: string;
  NODE_ENV: string;
  APP_VERSION: string;
  APP_ENV: string;
  CONNECTION_STRING: string;
};

/**
 * Get application configuration value from node-config
 * Reads from config/default.{json,yaml} + config/{NODE_ENV}.{json,yaml}
 * @param name - Configuration key
 * @returns Configuration value
 */
export const getConfigOrThrow = <T>(name: keyof ConfigInput): T => {
  return config.get<T>(name);
};
