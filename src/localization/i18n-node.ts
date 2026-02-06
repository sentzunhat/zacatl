import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { NotFoundError, BadRequestError } from "@zacatl/error";
import i18n from "@zacatl/third-party/i18n";

export type I18nCatalogType = Record<string, Record<string, unknown>>;

export type ConfigureI18nInput = {
  locales?: {
    default?: string;
    supported?: string[];
    directories?: string[];
  };
  objectNotation?: boolean;
  overrideBuiltIn?: boolean;
};

export type LoadCatalogInput = {
  localesDir: string;
  supportedLocales: string[];
};

export type MergeCatalogsInput = {
  base: I18nCatalogType;
  additions: I18nCatalogType[];
  overrideBuiltIn: boolean;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === "[object Object]"
  );
};

const deepMerge = (
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> => {
  const out: Record<string, unknown> = { ...base };

  for (const [key, overrideValue] of Object.entries(override)) {
    const baseValue = out[key];

    if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
      out[key] = deepMerge(baseValue, overrideValue);
      continue;
    }

    out[key] = overrideValue;
  }

  return out;
};

const readJsonFile = (filePath: string): Record<string, unknown> => {
  const content = fs.readFileSync(filePath, "utf-8");
  const parsed: unknown = JSON.parse(content);

  if (!isPlainObject(parsed)) {
    throw new BadRequestError({
      message: `Invalid locale JSON shape in ${filePath}`,
      reason: "Locale file must contain a plain JSON object",
      component: "I18nNode",
      operation: "readJsonFile",
      metadata: { filePath },
    });
  }

  return parsed;
};

const findExistingDir = (candidates: string[]): string | null => {
  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        return candidate;
      }
    } catch {
      continue;
    }
  }

  return null;
};

export const loadCatalog = (input: LoadCatalogInput): I18nCatalogType => {
  const { localesDir, supportedLocales } = input;
  const catalog: I18nCatalogType = {};

  for (const locale of supportedLocales) {
    const filePath = path.join(localesDir, `${locale}.json`);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    catalog[locale] = readJsonFile(filePath);
  }

  return catalog;
};

export const resolveBuiltInLocalesDir = (): string => {
  const here = path.dirname(fileURLToPath(import.meta.url));

  const candidates = [
    path.resolve(here, "locales"),
    path.resolve(here, "../src/localization/locales"),
    path.resolve(process.cwd(), "src/localization/locales"),
  ];

  const found = findExistingDir(candidates);
  if (!found) {
    throw new NotFoundError({
      message: `Unable to locate built-in locales directory. Tried: ${candidates.join(", ")}`,
      reason: "Built-in locales directory not found in expected paths",
      component: "I18nNode",
      operation: "resolveBuiltInLocalesDir",
      metadata: { candidates },
    });
  }

  return found;
};

export const mergeCatalogs = (input: MergeCatalogsInput): I18nCatalogType => {
  const { base, additions, overrideBuiltIn } = input;
  const out: I18nCatalogType = {};

  const locales = new Set<string>([
    ...Object.keys(base),
    ...additions.flatMap((a) => Object.keys(a)),
  ]);

  for (const locale of locales) {
    const baseLocale = base[locale] ?? {};

    const additionsLocale = additions.reduce<Record<string, unknown>>(
      (acc, addition) => {
        const addLocale = addition[locale];
        if (!addLocale) {
          return acc;
        }

        return deepMerge(acc, addLocale);
      },
      {},
    );

    out[locale] = overrideBuiltIn
      ? deepMerge(baseLocale, additionsLocale)
      : deepMerge(additionsLocale, baseLocale);
  }

  return out;
};

/**
 * Configure i18n - merges built-in translations with app-specific locales
 */
export const configureI18nNode = (
  input: ConfigureI18nInput = {},
): typeof i18n => {
  const defaultLocale = input.locales?.default ?? "en";
  const supportedLocales = input.locales?.supported ?? ["en", "es"];
  const objectNotation = input.objectNotation ?? true;
  const overrideBuiltIn = input.overrideBuiltIn ?? true;

  const builtInLocalesDir = resolveBuiltInLocalesDir();
  const builtInCatalog = loadCatalog({
    localesDir: builtInLocalesDir,
    supportedLocales,
  });

  const additionalCatalogs = (input.locales?.directories ?? [])
    .filter((dir): dir is string => dir.length > 0)
    .map((localesDir) => loadCatalog({ localesDir, supportedLocales }));

  const staticCatalog = mergeCatalogs({
    base: builtInCatalog,
    additions: additionalCatalogs,
    overrideBuiltIn,
  });

  i18n.configure({
    locales: supportedLocales,
    defaultLocale,
    objectNotation,
    staticCatalog: staticCatalog as unknown as i18n.GlobalCatalog,
    updateFiles: false,
    syncFiles: false,
    autoReload: false,
  });

  return i18n;
};
