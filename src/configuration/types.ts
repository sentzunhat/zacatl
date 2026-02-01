/**
 * Configuration loader types and interfaces
 */

export type ConfigFormat = "json" | "yaml" | "yml";

export interface ConfigLoader<T = unknown> {
  /**
   * Load configuration from a file path
   * @param filePath - Absolute or relative path to config file
   * @returns Parsed configuration object
   */
  load(filePath: string): T;

  /**
   * Load configuration from a string
   * @param content - Raw configuration content
   * @returns Parsed configuration object
   */
  parse(content: string): T;

  /**
   * Supported file extensions for this loader
   */
  readonly extensions: readonly ConfigFormat[];
}

export interface LoadedConfig<T = unknown> {
  data: T;
  filePath: string;
  format: ConfigFormat;
}
