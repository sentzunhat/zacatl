import type { LayersConfig } from './layers/types';
import type { PlatformsConfig } from './platforms/types';

/**
 * Configuration for the CLI platform (re-export).
 * See src/platforms/cli/types for details.
 */
export type { CliConfig } from './platforms/cli/types';

/**
 * Configuration for the Desktop platform (re-export).
 * See src/platforms/desktop/types for details.
 */
export type { DesktopConfig } from './platforms/desktop/types';

/**
 * Service execution context.
 *
 * - `CLI` — command-line interface execution.
 * - `DESKTOP` — desktop application execution.
 * - `SERVER` — server (HTTP) execution.
 */
export enum ServiceType {
  CLI = 'CLI',
  DESKTOP = 'DESKTOP',
  SERVER = 'SERVER',
}

/**
 * Localization configuration used by the service.
 *
 * - `locales.default` — default locale code (e.g. "en").
 * - `locales.supported` — list of supported locale codes.
 * - `locales.directories` — directories to load locale files from.
 * - `builtInLocalesDir` — override the built-in locale directory lookup.
 * - `objectNotation` — enable nested key access using dot notation.
 * - `overrideBuiltIn` — allow overriding built-in translations.
 */
export interface LocalizationConfig {
  locales?: {
    default?: string;
    supported?: string[];
    directories?: string[];
  };
  builtInLocalesDir?: string;
  objectNotation?: boolean;
  overrideBuiltIn?: boolean;
}

/**
 * Root configuration for the service module.
 *
 * - `type` — execution context, one of `ServiceType`.
 * - `layers` — layered configuration values (see `LayersConfig`).
 * - `platforms` — platform-specific configuration (see `PlatformsConfig`).
 * - `localization` — localization settings.
 * - `run.auto` — whether the service should start automatically.
 */
export interface ServiceConfig {
  type?: ServiceType;

  layers?: LayersConfig;

  platforms?: PlatformsConfig;

  localization?: LocalizationConfig;

  run?: { auto?: boolean };
}
