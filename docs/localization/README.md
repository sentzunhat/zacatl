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
import { configureI18nNode } from "@sentzunhat/zacatl";
import i18n from "@sentzunhat/zacatl/third-party/i18n";

configureI18nNode({
  locales: {
    default: "en",
    supported: ["en", "es", "fr"],
    directories: ["./locales", "./custom-locales"],
  },
  objectNotation: true, // Support nested keys like "errors.notFound"
  overrideBuiltIn: true, // Your translations override Zacatl's
});

const greeting = i18n.__("greeting");
console.log(greeting); // "Hello"
```

## Translation Files

Create translation files in `src/localization/locales/`:

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
const message = i18n.__("greeting", { name: "John" });
console.log(message); // "Hello John"

await i18n.setLocale("es");
console.log(i18n.__("greeting", { name: "Juan" })); // "Hola Juan"
```

## Custom Adapter (for i18n-node)

Extend i18n-node by loading translations from custom sources:

```typescript
import { configureI18nNode } from "@sentzunhat/zacatl";
import i18n from "@sentzunhat/zacatl/third-party/i18n";

// Configure with custom locale directories
configureI18nNode({
  locales: {
    default: "en",
    supported: ["en", "es", "fr"],
    directories: [
      "./locales",
      "./custom-locales", // Your custom translations
    ],
  },
  objectNotation: true,
});

const greeting = i18n.__("greeting");
```

## Testing with i18n-node

For tests, use the same i18n instance:

```typescript
import i18n from "@sentzunhat/zacatl/third-party/i18n";

// Set language for test
i18n.setLocale("es");
expect(i18n.__("greeting")).toBe("Hola");

// Reset for next test
i18n.setLocale("en");
```

## Getting Global i18n Instance

Access i18n directly from the third-party export:

```typescript
import i18n from "@sentzunhat/zacatl/third-party/i18n";

// Use after configureI18nNode() is called
const message = i18n.__("greeting");
const localized = i18n.__("greeting", { name: "John" });
```

## Detect User Language

````typescript
import { createI18n } from "@sentzunhat/zacatl";

const i18n = createI18n in HTTP Handlers

```typescript
import i18n from "@sentzunhat/zacatl/third-party/i18n";

// In Express middleware or Fastify hook
app.use((req, res, next) => {
  const lang = req.headers["accept-language"]?.split(",")[0] || "en";
  i18n.setLocale(lang);
  next();
}rors.notFound`, `users.welcome`
✅ **Use interpolation** - `{{name}}` for dynamic values
✅ **Set default language** - Fallback to English
✅ **Keep keys consistent** - Same structure across languages
❌ **Don't hardcode strings** - Always use translation keys

## Supported Adapters

| Adapter             | Use Case                        |
| ------------------- | ------------------------------- |
| `FilesystemAdapter` | Load from JSON files (default)  |
| `MemoryAdapter`     | In-memory for testing           |
| Custom              | API, database, or other sources |

i18n-node supports multiple data sources:

| Source          | Setup                              |
| --------------- | ---------------------------------- |
| JSON files      | `directories: ["./locales"]` |
| Built-in        | Zacatl's en.json and es.json       |
| Combined        | Merge multiple directories
````
