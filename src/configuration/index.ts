/**
 * Configuration module
 * Provides explicit YAML and JSON config loaders + legacy node-config wrapper
 */

export type { ConfigFormat, ConfigLoader, LoadedConfig } from "./types";

export { JSONLoader, createJSONLoader } from "./loaders/json-loader";
export { YAMLLoader, createYAMLLoader } from "./loaders/yaml-loader";

export { getLoader, loadConfig, loadConfigFromPaths } from "./loader";

export {
  validateConfig,
  validateLoadedConfig,
  safeValidateConfig,
} from "./validation";

// Application-wide configuration (via node-config)
export { getConfigOrThrow } from "./app-config";
