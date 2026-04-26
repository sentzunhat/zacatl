# Internationalization (i18n)

Add multi-language support to your application using i18n-node.

## Module Structure

Zacatl's localization module:

```
src/localization/
├── i18n-node.ts    # HTTP request localization setup (configureI18nNode)
├── index.ts        # Public exports
├── locales/        # Built-in translations (en.json, es.json)
└── node/           # i18n-node helpers and types
```

## Quick Start (i18n-node)

```typescript
import { configureI18nNode } from '@sentzunhat/zacatl';
import i18n from '@sentzunhat/zacatl/third-party/i18n';

configureI18nNode({
  locales: {
    default: 'en',
    supported: ['en', 'es', 'fr'],
    directories: ['./locales', './services/billing/locales'],
  },
  objectNotation: true, // Support nested keys like "errors.notFound"
  overrideBuiltIn: true, // Your translations override Zacatl's
});

const greeting = i18n.__('greeting');
console.log(greeting); // "Hello"
```

### Locales Resolution

The localization module automatically detects Zacatl's built-in locales directory at runtime and then merges in app or service locales from the current project tree.

Built-in Zacatl locales are resolved from the first matching candidate, including:

1. **Current package runtime layout**: `src/localization/locales/` or supported build output layouts next to the executing module
2. **Installed package layouts**: `node_modules/@sentzunhat/zacatl/src/localization/locales/`, `build-src-esm/...`, `build-src-cjs/...`, `build/esm/...`, or `build/cjs/...`
3. **Project-level fallbacks**: `src/localization/locales/`, `localization/locales/`, or a top-level `locales/` directory under the consumer project root

Additional non-built-in locales are then merged from:

1. **Explicit directories** passed in `locales.directories`
2. **Auto-discovered service/app directories** named `locales` under the current working tree, such as `./locales`, `./src/locales`, `./services/orders/locales`, or `./services/billing/src/locales`

By default, app and service keys override Zacatl's built-in keys when the same translation path exists.

If automatic detection fails (rare cases), explicitly configure `builtInLocalesDir`:

```typescript
configureI18nNode({
  builtInLocalesDir: './node_modules/@sentzunhat/zacatl/src/localization/locales',
  locales: {
    default: 'en',
    supported: ['en', 'es'],
  },
});
```

## Translation Files

Zacatl ships built-in translations in its own `src/localization/locales/` directory. Consumer services can add their own translations in any discovered `locales/` directory, or point at specific folders with `locales.directories`.

Common service layouts include:

- `./locales/en.json`
- `./src/locales/en/errors/index.json`
- `./services/orders/locales/en.json`
- `./services/billing/src/locales/en/messages/welcome.json`

Example locale file:

**en.json**:

```json
{
  "greeting": "Hello {{name}}",
  "errors": {
    "notFound": "Not found",
    "validation": "Invalid input"
  },
  "messages": {
    "welcome": "Welcome to our app!"
  }
}
```

**es.json**:

```json
{
  "greeting": "Hola {{name}}",
  "errors": {
    "notFound": "No encontrado",
    "validation": "Entrada inválida"
  },
  "messages": {
    "welcome": "¡Bienvenido a nuestra aplicación!"
  }
}
```

## With Interpolation

```typescript
const message = i18n.__('greeting', { name: 'John' });
console.log(message); // "Hello John"

i18n.setLocale('es');
console.log(i18n.__('greeting', { name: 'Juan' })); // "Hola Juan"
```

## Custom Adapter (for i18n-node)

Extend i18n-node by loading translations from custom sources:

```typescript
import { configureI18nNode } from '@sentzunhat/zacatl';
import i18n from '@sentzunhat/zacatl/third-party/i18n';

// Configure with custom locale directories
configureI18nNode({
  locales: {
    default: 'en',
    supported: ['en', 'es', 'fr'],
    directories: [
      './locales',
      './services/billing/locales', // Your service-specific translations
    ],
  },
  objectNotation: true,
});

const greeting = i18n.__('greeting');
```

## Testing with i18n-node

For tests, use the same i18n instance:

```typescript
import i18n from '@sentzunhat/zacatl/third-party/i18n';

// Set language for test
i18n.setLocale('es');
expect(i18n.__('greeting')).toBe('Hola');

// Reset for next test
i18n.setLocale('en');
```

## Getting Global i18n Instance

Access i18n directly from the third-party export:

```typescript
import i18n from '@sentzunhat/zacatl/third-party/i18n';

// Use after configureI18nNode() is called
const message = i18n.__('greeting');
const localized = i18n.__('greeting', { name: 'John' });
```

## Detect User Language

```typescript
import i18n from '@sentzunhat/zacatl/third-party/i18n';

// In Express middleware or Fastify hook
app.use((req, res, next) => {
  const lang = req.headers['accept-language']?.split(',')[0] || 'en';
  i18n.setLocale(lang);
  next();
});
```

## Best Practices

- Use nested keys like `errors.notFound` and `users.welcome`.
- Use interpolation placeholders like `{{name}}`.
- Set a default locale and keep it available in all deployments.
- Keep locale key structure consistent across language files.
- Avoid hardcoded user-facing strings in handlers/services.

## Scope Notes

- Use `configureI18nNode()` and the shared `i18n` instance from
  `@sentzunhat/zacatl/third-party/i18n`.
- Adapter abstractions such as `FilesystemAdapter`/`MemoryAdapter` are not part
  of the current public localization API.

i18n-node supports multiple data sources:

| Source     | Setup                                                |
| ---------- | ---------------------------------------------------- |
| JSON files | `directories: ["./locales"]`                         |
| Built-in   | Zacatl's en.json and es.json                         |
| Combined   | Merge explicit and discovered `locales/` directories |
