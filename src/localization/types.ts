/**
 * I18n adapter interface for pluggable i18n backends.
 * Implementations define where translations are loaded from (filesystem, API, memory, etc.).
 */
export interface I18nAdapter {
  /**
   * Initialize the adapter with optional configuration.
   */
  init?(config?: Record<string, unknown>): Promise<void> | void;

  /**
   * Load translations for a specific language and namespace.
   * Returns the loaded resources object.
   */
  loadResources(
    language: string,
    namespace: string,
  ): Promise<Record<string, unknown> | null> | Record<string, unknown> | null;

  /**
   * Optional: Save translations (useful for some backends).
   */
  saveResources?(
    language: string,
    namespace: string,
    resources: Record<string, unknown>,
  ): Promise<void> | void;
}

/**
 * I18n configuration options.
 */
export interface I18nConfig {
  /**
   * Default language for translations.
   * @default 'en'
   */
  defaultLanguage?: string;

  /**
   * Fallback language if translation not found.
   * @default 'en'
   */
  fallbackLanguage?: string;

  /**
   * List of supported languages.
   * @default ['en']
   */
  supportedLanguages?: string[];

  /**
   * Default namespace for translations.
   * @default 'translation'
   */
  defaultNamespace?: string;

  /**
   * Additional i18next options to merge with defaults.
   */
  i18nextOptions?: Record<string, unknown>;
}

/**
 * I18n instance returned by createI18n().
 * Provides translation, language switching, and management methods.
 */
export interface I18nInstance {
  /**
   * Translate a key with optional interpolation.
   */
  t(key: string, options?: Record<string, unknown>): string;

  /**
   * Get the current language.
   */
  getLanguage(): string;

  /**
   * Change the current language.
   */
  setLanguage(language: string): Promise<void>;

  /**
   * Get all supported languages.
   */
  getSupportedLanguages(): string[];

  /**
   * Get the raw i18next instance for advanced usage.
   */
  getI18next(): unknown;

  /**
   * Add resources programmatically.
   */
  addResources(
    language: string,
    namespace: string,
    resources: Record<string, unknown>,
  ): void;

  /**
   * Get resource bundles for a language/namespace.
   */
  getResources(
    language?: string,
    namespace?: string,
  ): Record<string, unknown> | null;
}
