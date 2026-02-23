import type { ConfigLayers } from '../layers/types';
import type { ConfigPlatforms } from '../platforms/types';

/**
 * Configuration for the CLI platform (re-export).
 * See src/platforms/cli/types for details.
 */
export type { ConfigCLI } from '../platforms/cli/types';

/**
 * Configuration for the Desktop platform (re-export).
 * See src/platforms/desktop/types for details.
 */
export type { ConfigDesktop } from '../platforms/desktop/types';

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
 * - `objectNotation` — enable nested key access using dot notation.
 * - `overrideBuiltIn` — allow overriding built-in translations.
 */
export interface ConfigLocalization {
  locales?: {
    default?: string;
    supported?: string[];
    directories?: string[];
  };
  objectNotation?: boolean;
  overrideBuiltIn?: boolean;
}

/**
 * Root configuration for the service module.
 *
 * - `type` — execution context, one of `ServiceType`.
 * - `layers` — layered configuration values (see `ConfigLayers`).
 * - `platforms` — platform-specific configuration (see `ConfigPlatforms`).
 * - `localization` — localization settings.
 * - `run.auto` — whether the service should start automatically.
 */
export interface ConfigService {
  type?: ServiceType;

  layers?: ConfigLayers;

  platforms?: ConfigPlatforms;

  localization?: ConfigLocalization;

  run?: { auto?: boolean };
}
