import fs from 'fs';
import path from 'path';

import { NotFoundError, BadRequestError } from '@zacatl/error';
import i18n from '@zacatl/third-party/i18n';

export type I18nCatalogType = Record<string, Record<string, unknown>>;

export interface ConfigureI18nInput {
  locales?: {
    default?: string;
    supported?: string[];
    directories?: string[];
  };
  builtInLocalesDir?: string;
  objectNotation?: boolean;
  overrideBuiltIn?: boolean;
}

export interface LoadCatalogInput {
  localesDir: string;
  supportedLocales: string[];
}

export interface MergeCatalogsInput {
  base: I18nCatalogType;
  additions: I18nCatalogType[];
  overrideBuiltIn: boolean;
}

const LOCALES_DIRNAME = 'locales';
const LOCALE_FILE_EXTENSION = '.json';
const DEFAULT_IGNORED_DIRECTORIES = new Set<string>([
  '.git',
  'node_modules',
  'dist',
  'build',
  'build-src-esm',
  'build-src-cjs',
  'coverage',
  '.turbo',
]);

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.prototype.toString.call(value) === '[object Object]'
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
  const content = fs.readFileSync(filePath, 'utf-8');
  const parsed: unknown = JSON.parse(content);

  if (!isPlainObject(parsed)) {
    throw new BadRequestError({
      message: `Invalid locale JSON shape in ${filePath}`,
      reason: 'Locale file must contain a plain JSON object',
      component: 'I18nNode',
      operation: 'readJsonFile',
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

const findAllExistingDirs = (candidates: string[]): string[] => {
  const found = new Set<string>();

  for (const candidate of candidates) {
    try {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isDirectory()) {
        found.add(path.resolve(candidate));
      }
    } catch {
      continue;
    }
  }

  return [...found];
};

const listJsonFilesRecursively = (directory: string): string[] => {
  const files: string[] = [];
  const stack = [directory];

  while (stack.length > 0) {
    const current = stack.pop();
    if (current == null) {
      continue;
    }

    let entries: fs.Dirent[] = [];

    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const fullPath = path.join(current, entry.name);

      if (entry.isDirectory()) {
        stack.push(fullPath);
        continue;
      }

      if (entry.isFile() && entry.name.endsWith(LOCALE_FILE_EXTENSION)) {
        files.push(fullPath);
      }
    }
  }

  return files.sort((a, b) => a.localeCompare(b));
};

const assignNestedValue = (
  target: Record<string, unknown>,
  keys: string[],
  value: Record<string, unknown>,
): Record<string, unknown> => {
  if (keys.length === 0) {
    return deepMerge(target, value);
  }

  const head = keys[0];
  if (head == null) {
    return deepMerge(target, value);
  }

  const rest = keys.slice(1);
  const currentNode = target[head];
  const nextNode = isPlainObject(currentNode) ? currentNode : ({} as Record<string, unknown>);

  target[head] = assignNestedValue(nextNode, rest, value);
  return target;
};

const getParentDirectories = (directory: string, levels: number): string[] => {
  const out: string[] = [];
  let current = path.resolve(directory);

  for (let i = 0; i <= levels; i += 1) {
    out.push(current);
    const parent = path.dirname(current);
    if (parent === current) {
      break;
    }
    current = parent;
  }

  return out;
};

const findLocalesDirectoriesInTree = (
  rootDirectory: string,
  maxDepth = 6,
  maxDirectories = 5000,
): string[] => {
  const resolvedRoot = path.resolve(rootDirectory);
  const queue: Array<{ dir: string; depth: number }> = [
    {
      dir: resolvedRoot,
      depth: 0,
    },
  ];
  const visited = new Set<string>();
  const discovered = new Set<string>();
  let scannedDirectories = 0;

  while (queue.length > 0 && scannedDirectories < maxDirectories) {
    const current = queue.shift();
    if (current == null) {
      continue;
    }

    const normalized = path.resolve(current.dir);
    if (visited.has(normalized)) {
      continue;
    }
    visited.add(normalized);
    scannedDirectories += 1;

    if (path.basename(normalized) === LOCALES_DIRNAME) {
      discovered.add(normalized);
      continue;
    }

    if (current.depth >= maxDepth) {
      continue;
    }

    let entries: fs.Dirent[] = [];
    try {
      entries = fs.readdirSync(normalized, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      if (DEFAULT_IGNORED_DIRECTORIES.has(entry.name)) {
        continue;
      }

      queue.push({
        dir: path.join(normalized, entry.name),
        depth: current.depth + 1,
      });
    }
  }

  return [...discovered].sort((a, b) => a.localeCompare(b));
};

const getBuiltInLocaleDirCandidates = (): string[] => {
  const here = getHere();
  const searchRoots = getParentDirectories(process.cwd(), 3);
  const candidates = [
    // Locales shipped next to this module (src/localization/locales or build/localization/locales)
    path.resolve(here, LOCALES_DIRNAME),
    // If running from build output, try package build output paths
    path.resolve(here, '../../build/localization/locales'),
    path.resolve(here, '../../build/esm/localization/locales'),
    path.resolve(here, '../../build/cjs/localization/locales'),
    // Fallback to source layout relative to package root
    path.resolve(here, '../../src/localization/locales'),
  ];

  for (const root of searchRoots) {
    candidates.push(
      path.resolve(root, 'node_modules/@sentzunhat/zacatl/build-src-esm/localization/locales'),
      path.resolve(root, 'node_modules/@sentzunhat/zacatl/build-src-cjs/localization/locales'),
      path.resolve(root, 'node_modules/@sentzunhat/zacatl/build/esm/localization/locales'),
      path.resolve(root, 'node_modules/@sentzunhat/zacatl/build/cjs/localization/locales'),
      path.resolve(root, 'node_modules/@sentzunhat/zacatl/src/localization/locales'),
      path.resolve(root, 'src/localization/locales'),
      path.resolve(root, 'localization/locales'),
      path.resolve(root, LOCALES_DIRNAME),
    );
  }

  return candidates;
};

const getDiscoveredLocalesDirectories = (explicitDirectories: string[]): string[] => {
  const explicitResolved = explicitDirectories
    .filter((dir): dir is string => dir != null && dir.length > 0)
    .map((dir) => path.resolve(dir));

  const discoveredFromTree = findLocalesDirectoriesInTree(process.cwd());

  const explicitSet = new Set(explicitResolved);
  const treeOnly = discoveredFromTree.filter((dir) => !explicitSet.has(dir));

  return [...explicitResolved, ...treeOnly];
};

export const loadCatalog = (input: LoadCatalogInput): I18nCatalogType => {
  const { localesDir, supportedLocales } = input;
  const catalog: I18nCatalogType = {};

  for (const locale of supportedLocales) {
    const filePath = path.join(localesDir, `${locale}.json`);
    let localeCatalog: Record<string, unknown> = {};

    if (fs.existsSync(filePath)) {
      localeCatalog = readJsonFile(filePath);
    }

    const localeNestedDir = path.join(localesDir, locale);
    if (fs.existsSync(localeNestedDir) && fs.statSync(localeNestedDir).isDirectory()) {
      const nestedJsonFiles = listJsonFilesRecursively(localeNestedDir);

      for (const nestedFile of nestedJsonFiles) {
        const relativePath = path.relative(localeNestedDir, nestedFile);
        const withoutExtension = relativePath.replace(/\.json$/i, '');
        const pathParts = withoutExtension
          .split(path.sep)
          .filter((segment) => segment.length > 0 && segment !== 'index');
        const nestedObject = readJsonFile(nestedFile);

        localeCatalog = assignNestedValue(localeCatalog, pathParts, nestedObject);
      }
    }

    if (Object.keys(localeCatalog).length > 0) {
      catalog[locale] = localeCatalog;
    }
  }

  return catalog;
};

const getHere = (): string => {
  // CommonJS: __dirname is available
  if (typeof __dirname !== 'undefined') return __dirname;

  // Fallback: Try to extract from process.argv[1]
  if (
    typeof process !== 'undefined' &&
    Array.isArray(process.argv) &&
    typeof process.argv[1] === 'string' &&
    process.argv[1].length > 0
  ) {
    return path.dirname(process.argv[1]);
  }

  return process.cwd();
};

export const resolveBuiltInLocalesDir = (): string => {
  const candidates = getBuiltInLocaleDirCandidates();

  const found = findExistingDir(candidates);
  if (found == null) {
    throw new NotFoundError({
      message: `Unable to locate built-in locales directory. Tried: ${candidates.join(', ')}`,
      reason: 'Built-in locales directory not found in expected paths',
      component: 'I18nNode',
      operation: 'resolveBuiltInLocalesDir',
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

    const additionsLocale = additions.reduce<Record<string, unknown>>((acc, addition) => {
      const addLocale = addition[locale];
      if (addLocale == null) {
        return acc;
      }

      return deepMerge(acc, addLocale);
    }, {});

    out[locale] = overrideBuiltIn
      ? deepMerge(baseLocale, additionsLocale)
      : deepMerge(additionsLocale, baseLocale);
  }

  return out;
};

/**
 * Configure i18n - merges built-in translations with app-specific locales
 */
export const configureI18nNode = (input: ConfigureI18nInput = {}): typeof i18n => {
  const defaultLocale = input.locales?.default ?? 'en';
  const supportedLocales = input.locales?.supported ?? ['en', 'es'];
  const objectNotation = input.objectNotation ?? true;
  const overrideBuiltIn = input.overrideBuiltIn ?? true;

  const builtInLocalesDirCandidates =
    input.builtInLocalesDir != null && input.builtInLocalesDir !== ''
      ? [path.resolve(input.builtInLocalesDir)]
      : getBuiltInLocaleDirCandidates();
  const builtInLocalesDir = findExistingDir(builtInLocalesDirCandidates);

  const builtInCatalog =
    builtInLocalesDir == null
      ? {}
      : loadCatalog({
          localesDir: builtInLocalesDir,
          supportedLocales,
        });

  const additionalDirectories = getDiscoveredLocalesDirectories(input.locales?.directories ?? []);
  const additionalCatalogs = findAllExistingDirs(additionalDirectories)
    .filter(
      (localesDir) => builtInLocalesDir == null || path.resolve(localesDir) !== builtInLocalesDir,
    )
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
