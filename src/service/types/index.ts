import type { ConfigLayers } from "../layers/types";
import type { ConfigPlatforms } from "../platforms/types";

export type { ConfigCLI } from "../platforms/cli/types";
export type { ConfigDesktop } from "../platforms/desktop/types";

/**
 * Service execution context: CLI | DESKTOP | SERVER
 */
export enum ServiceType {
  CLI = "CLI",
  DESKTOP = "DESKTOP",
  SERVER = "SERVER",
}

export type ConfigLocalization = {
  locales?: {
    default?: string;
    supported?: string[];
    directories?: string[];
  };
  objectNotation?: boolean;
  overrideBuiltIn?: boolean;
};

export type ConfigService = {
  type?: ServiceType;

  layers?: ConfigLayers;

  platforms?: ConfigPlatforms;

  localization?: ConfigLocalization;

  run?: { auto?: boolean };
};
