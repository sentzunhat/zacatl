/**
 * Core functions for i18n-node integration.
 * @module localization/i18n-node/core
 */

import fs from "fs";
import path from "path";

import { readJsonFile, deepMerge, findExistingDir } from "./helpers";
import type {
  I18nStaticCatalogType,
  LoadStaticCatalogInput,
  MergeStaticCatalogsInput,
} from "./types";
import { NotFoundError } from "../../error/index";

/**
 * Load a static catalog from JSON files in a locales directory.
 *
 * Expected structure: `localesDir/<locale>.json`
 *
 * @example
 * const catalog = loadStaticCatalog({
 *   localesDir: './locales',
 *   supportedLocales: ['en', 'es']
 * });
 */
export const loadStaticCatalog = (input: LoadStaticCatalogInput): I18nStaticCatalogType => {
  const { localesDir, supportedLocales } = input;

  const catalog: I18nStaticCatalogType = {};

  for (const locale of supportedLocales) {
    const filePath = path.join(localesDir, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    catalog[locale] = readJsonFile(filePath);
  }

  return catalog;
};

/**
 * Resolve Zacatl's built-in locales directory at runtime.
 *
 * Works in:
 * - Development via `tsx` (src/..)
 * - Compiled output (build/..) where package ships `src/` in npm
 *
 * @throws {Error} If the locales directory cannot be found
 */
const getHere = (): string => {
  if (typeof __dirname !== "undefined") return __dirname;
  if (
    typeof process !== "undefined" &&
    Array.isArray(process.argv) &&
    typeof process.argv[1] === "string" &&
    process.argv[1].length > 0
  ) {
    return path.dirname(process.argv[1]);
  }
  return process.cwd();
};

export const resolveBuiltInLocalesDir = (): string => {
  const here = getHere();

  const candidates = [
    path.resolve(here, "../locales"),
    path.resolve(here, "../../../src/localization/locales"),
    path.resolve(process.cwd(), "src/localization/locales"),
  ];

  const found = findExistingDir(candidates);
  if (found == null) {
    throw new NotFoundError({
      message: `Unable to locate Zacatl built-in locales directory. Tried: ${candidates.join(", ")}`,
      reason: "Built-in locales directory not found in expected paths",
      component: "I18nNode",
      operation: "getBuiltInLocalesDir",
      metadata: { candidates },
    });
  }

  return found;
};

/**
 * Merge multiple static catalogs per-locale.
 *
 * When `overrideBuiltIn=true`, app/service keys override Zacatl keys.
 * When `overrideBuiltIn=false`, Zacatl keys take precedence.
 *
 * @example
 * const merged = mergeStaticCatalogs({
 *   base: zacatlCatalog,
 *   additions: [appCatalog, customCatalog],
 *   overrideBuiltIn: true
 * });
 */
export const mergeStaticCatalogs = (input: MergeStaticCatalogsInput): I18nStaticCatalogType => {
  const { base, additions, overrideBuiltIn } = input;

  const out: I18nStaticCatalogType = {};

  const locales = new Set<string>([
    ...Object.keys(base),
    ...additions.flatMap((a: Record<string, unknown>) => Object.keys(a)),
  ]);

  for (const locale of locales) {
    const baseLocale = base[locale] ?? ({} as Record<string, unknown>);

    const additionsLocale = additions.reduce<Record<string, unknown>>(
      (acc: Record<string, unknown>, addition: Record<string, unknown>) => {
        const addLocale = addition[locale];
        if (addLocale == null) {
          return acc;
        }

        return deepMerge(acc, addLocale as Record<string, unknown>);
      },
      {} as Record<string, unknown>,
    );

    out[locale] = overrideBuiltIn
      ? deepMerge(baseLocale, additionsLocale)
      : deepMerge(additionsLocale, baseLocale);
  }

  return out;
};
