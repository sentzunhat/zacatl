import i18next from "i18next";
import type { I18nAdapter, I18nConfig, I18nInstance } from "./types";
import { FilesystemAdapter } from "./adapters";

/**
 * Create a new i18n instance with optional adapter and configuration.
 * Follows the same factory pattern as createLogger().
 *
 * @param adapter - I18nAdapter implementation (defaults to FilesystemAdapter('./src/localization/locales'))
 * @param config - I18n configuration options
 * @returns Configured I18nInstance
 *
 * @example
 * // With default filesystem adapter
 * const i18n = createI18n();
 *
 * @example
 * // With custom adapter
 * import { MemoryAdapter } from './adapters';
 * const i18n = createI18n(new MemoryAdapter({
 *   en: { translation: { greeting: 'Hello' } }
 * }));
 *
 * @example
 * // With configuration
 * const i18n = createI18n(undefined, {
 *   defaultLanguage: 'en',
 *   supportedLanguages: ['en', 'es'],
 *   i18nextOptions: { ns: ['translation', 'errors'] }
 * });
 */
export const createI18n = (
  adapter?: I18nAdapter,
  config?: I18nConfig,
): I18nInstance => {
  const finalAdapter =
    adapter ??
    new FilesystemAdapter(`${process.cwd()}/src/localization/locales`);
  const finalConfig: I18nConfig = {
    defaultLanguage: "en",
    fallbackLanguage: "en",
    supportedLanguages: ["en", "es"],
    defaultNamespace: "translation",
    ...config,
  };

  // Initialize adapter
  if (finalAdapter.init) {
    const result = finalAdapter.init();
    if (result instanceof Promise) {
      throw new Error(
        "Async adapter.init() not supported in createI18n(); use createI18nAsync() instead",
      );
    }
  }

  // Configure i18next
  const i18nInstance = i18next.createInstance();
  i18nInstance.init(
    {
      lng: finalConfig.defaultLanguage,
      fallbackLng: finalConfig.fallbackLanguage,
      ns: [finalConfig.defaultNamespace],
      defaultNS: finalConfig.defaultNamespace,
      interpolation: {
        escapeValue: false, // React/TypeScript handles escaping
      },
      resources: loadInitialResources(finalAdapter, finalConfig),
      ...finalConfig.i18nextOptions,
    } as Record<string, unknown>,
    (err: unknown) => {
      if (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        throw new Error(`i18n initialization failed: ${errorMessage}`);
      }
    },
  );

  return createI18nInstanceWrapper(i18nInstance, finalAdapter, finalConfig);
};

/**
 * Create a new async i18n instance.
 * Use this if your adapter.init() returns a Promise.
 *
 * @param adapter - I18nAdapter implementation
 * @param config - I18n configuration options
 * @returns Promise<I18nInstance>
 */
export const createI18nAsync = async (
  adapter?: I18nAdapter,
  config?: I18nConfig,
): Promise<I18nInstance> => {
  const finalAdapter =
    adapter ??
    new FilesystemAdapter(`${process.cwd()}/src/localization/locales`);
  const finalConfig: I18nConfig = {
    defaultLanguage: "en",
    fallbackLanguage: "en",
    supportedLanguages: ["en", "es"],
    defaultNamespace: "translation",
    ...config,
  };

  // Initialize adapter
  if (finalAdapter.init) {
    const result = finalAdapter.init();
    if (result instanceof Promise) {
      await result;
    }
  }

  // Configure i18next
  const i18nInstance = i18next.createInstance();
  await new Promise<void>((resolve, reject) => {
    i18nInstance.init(
      {
        lng: finalConfig.defaultLanguage,
        fallbackLng: finalConfig.fallbackLanguage,
        ns: [finalConfig.defaultNamespace],
        defaultNS: finalConfig.defaultNamespace,
        interpolation: {
          escapeValue: false,
        },
        resources: loadInitialResources(finalAdapter, finalConfig),
        ...finalConfig.i18nextOptions,
      } as Record<string, unknown>,
      (err: unknown) => {
        if (err) {
          const errorMessage = err instanceof Error ? err.message : String(err);
          reject(new Error(`i18n initialization failed: ${errorMessage}`));
        } else {
          resolve();
        }
      },
    );
  });

  return createI18nInstanceWrapper(i18nInstance, finalAdapter, finalConfig);
};

/**
 * Get or throw error if not initialized.
 * Used internally; not part of public API.
 */
let globalI18nInstance: I18nInstance | null = null;

export const setGlobalI18n = (instance: I18nInstance): void => {
  globalI18nInstance = instance;
};

export const getI18nOrThrow = (): I18nInstance => {
  if (!globalI18nInstance) {
    throw new Error(
      "i18n not initialized. Call setGlobalI18n() first or use createI18n() to create an instance.",
    );
  }
  return globalI18nInstance;
};

/**
 * Internal: Load initial resources from adapter.
 */
const loadInitialResources = (
  adapter: I18nAdapter,
  config: I18nConfig,
): Record<string, Record<string, unknown>> => {
  const resources: Record<string, Record<string, unknown>> = {};

  for (const lang of config.supportedLanguages ?? []) {
    const res = adapter.loadResources(
      lang,
      config.defaultNamespace ?? "translation",
    );
    if (res) {
      resources[lang] = {
        [config.defaultNamespace ?? "translation"]: res,
      };
    }
  }

  return resources;
};

/**
 * Internal: Create the I18nInstance wrapper.
 */
const createI18nInstanceWrapper = (
  i18nInstance: unknown,
  _adapter: I18nAdapter,
  config: I18nConfig,
): I18nInstance => {
  const inst = i18nInstance as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  return {
    t: (key: string, options?: Record<string, unknown>) =>
      inst.t(key, options) as string,

    getLanguage: () => inst.language,

    setLanguage: async (language: string) => {
      await inst.changeLanguage(language);
    },

    getSupportedLanguages: () => config.supportedLanguages ?? ["en"],

    getI18next: () => i18nInstance,

    addResources: (
      language: string,
      namespace: string,
      resources: Record<string, unknown>,
    ) => {
      inst.addResourceBundle(language, namespace, resources, true, true);
    },

    getResources: (language?: string, namespace?: string) => {
      const lang = language ?? inst.language;
      const ns = namespace ?? config.defaultNamespace ?? "translation";
      return inst.getResourceBundle(lang, ns) ?? null;
    },
  };
};
