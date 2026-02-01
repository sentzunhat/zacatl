import { existsSync } from "fs";
import type { ZodSchema } from "zod";
import { JSONLoader } from "./loaders/json-loader";
import { YAMLLoader } from "./loaders/yaml-loader";
import type { ConfigLoader, ConfigFormat, LoadedConfig } from "./types";
import { validateConfig } from "./validation";

/**
 * Get loader for a specific format (explicit selection)
 * Similar to ORM adapter pattern - you choose which format to use
 */
export const getLoader = <T = unknown>(
  format: ConfigFormat,
): ConfigLoader<T> => {
  switch (format) {
    case "json":
      return new JSONLoader<T>();
    case "yaml":
    case "yml":
      return new YAMLLoader<T>();
    default:
      throw new Error(`Unsupported config format: ${format}`);
  }
};

/**
 * Load configuration with explicit format selection
 * @param filePath - Path to config file
 * @param format - Config format ('json', 'yaml', or 'yml')
 * @param schema - Optional Zod schema for validation
 * @returns Loaded configuration with metadata
 */
export const loadConfig = <T = unknown>(
  filePath: string,
  format: ConfigFormat,
  schema?: ZodSchema<T>,
): LoadedConfig<T> => {
  if (!existsSync(filePath)) {
    throw new Error(`Config file not found: ${filePath}`);
  }

  const loader = getLoader<T>(format);
  const rawData = loader.load(filePath);

  const data = schema ? validateConfig(rawData, schema) : (rawData as T);

  return {
    data,
    filePath,
    format,
  };
};

/**
 * Try to load config from multiple paths with explicit format
 * Returns first found config or throws if none exist
 */
export const loadConfigFromPaths = <T = unknown>(
  paths: Array<{ path: string; format: ConfigFormat }>,
  schema?: ZodSchema<T>,
): LoadedConfig<T> => {
  for (const { path, format } of paths) {
    if (existsSync(path)) {
      return loadConfig<T>(path, format, schema);
    }
  }

  const pathsList = paths.map((p) => `${p.path} (${p.format})`).join(", ");
  throw new Error(`No config file found in any of these paths: ${pathsList}`);
};
