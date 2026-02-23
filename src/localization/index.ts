/**
 * Localization module - i18n-node HTTP request localization
 * @module localization
 */

export {
  configureI18nNode,
  loadCatalog,
  resolveBuiltInLocalesDir,
  mergeCatalogs,
} from './i18n-node';

export type {
  I18nCatalogType,
  ConfigureI18nInput,
  LoadCatalogInput,
  MergeCatalogsInput,
} from './i18n-node';
