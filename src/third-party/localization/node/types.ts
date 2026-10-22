/**
 * Type definitions for i18n-node integration
 * @module localization/i18n-node/types
 */

/**
 * Static catalog type - maps locale codes to translation objects
 */
export type I18nStaticCatalogType = Record<string, Record<string, unknown>>;

/**
 * Input for loading a static catalog from disk
 */
export interface LoadStaticCatalogInput {
  localesDir: string;
  supportedLocales: string[];
}

/**
 * Input for merging multiple static catalogs
 */
export interface MergeStaticCatalogsInput {
  base: I18nStaticCatalogType;
  additions: I18nStaticCatalogType[];
  overrideBuiltIn: boolean;
}
