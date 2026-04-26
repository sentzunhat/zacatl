# Internationalization API Reference

Zacatl localization is built around `i18n-node` with catalog loading and merge helpers.

## Import

```typescript
import {
  configureI18nNode,
  loadCatalog,
  mergeCatalogs,
  resolveBuiltInLocalesDir,
} from '@sentzunhat/zacatl';

import type {
  ConfigureI18nInput,
  I18nCatalogType,
  LoadCatalogInput,
  MergeCatalogsInput,
} from '@sentzunhat/zacatl';

import i18n from '@sentzunhat/zacatl/third-party/i18n';
```

## `configureI18nNode(input?)`

Configures the shared i18n instance by merging built-in catalogs with optional
project catalogs.

```typescript
const i18nInstance = configureI18nNode({
  locales: {
    default: 'en',
    supported: ['en', 'es'],
    directories: ['./locales', './services/orders/locales'],
  },
  objectNotation: true,
  overrideBuiltIn: true,
});

i18nInstance.__('greeting');
```

### `ConfigureI18nInput`

```typescript
type ConfigureI18nInput = {
  locales?: {
    default?: string;
    supported?: string[];
    directories?: string[]; // Explicit locale roots to merge before auto-discovered locales/ folders
  };
  builtInLocalesDir?: string; // Override Zacatl built-in locale lookup for custom runtime layouts
  objectNotation?: boolean;
  overrideBuiltIn?: boolean;
};
```

Notes:

- Built-in Zacatl locales are resolved from the package runtime, installed package paths under `node_modules/@sentzunhat/zacatl`, or project-level fallback paths.
- Additional app or service locales are loaded from `locales.directories` and from auto-discovered `locales/` directories under the current working tree.
- With the default `overrideBuiltIn: true`, app and service translations win over built-in keys.

## `loadCatalog(input)`

Loads locale JSON files from a single directory.

```typescript
const catalog = loadCatalog({
  localesDir: './locales',
  supportedLocales: ['en', 'es'],
});
```

### `LoadCatalogInput`

```typescript
type LoadCatalogInput = {
  localesDir: string;
  supportedLocales: string[];
};
```

## `mergeCatalogs(input)`

Merges a base catalog with additional catalogs.

```typescript
const merged = mergeCatalogs({
  base: builtInCatalog,
  additions: [appCatalog],
  overrideBuiltIn: true,
});
```

### `MergeCatalogsInput`

```typescript
type MergeCatalogsInput = {
  base: I18nCatalogType;
  additions: I18nCatalogType[];
  overrideBuiltIn: boolean;
};
```

## `resolveBuiltInLocalesDir()`

Finds the built-in locales directory across supported runtime layouts.

```typescript
const builtInDir = resolveBuiltInLocalesDir();
```

If your runtime layout is custom, set `builtInLocalesDir` in
`configureI18nNode()`.

This helper resolves Zacatl's own packaged locale files only. Consumer service locales are loaded separately through `locales.directories` and auto-discovery of `locales/` folders in the current project tree.

## Usage

```typescript
configureI18nNode({
  locales: {
    default: 'en',
    supported: ['en', 'es'],
  },
});

i18n.setLocale('es');
const message = i18n.__('errors.notFound');
```

## Locale File Shape

`locales/<language>.json`

Nested JSON files under `locales/<language>/...` are also supported and merged into dot-notation keys.

```json
{
  "greeting": "Hello {{name}}",
  "errors": {
    "notFound": "Not found"
  }
}
```
