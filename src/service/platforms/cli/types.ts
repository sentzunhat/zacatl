/**
 * Configuration for CLI-type services
 */
export interface ConfigCLI {
  /** CLI command name (e.g., "ujti", "zacatl") */
  name: string;

  /** CLI version (semver) */
  version: string;

  /** Description shown in help text */
  description?: string;
}
