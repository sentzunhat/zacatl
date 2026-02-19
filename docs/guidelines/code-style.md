# Code Style Guide

This guide covers formatting, naming conventions, and language-specific rules for a modern TypeScript/Node.js project.

## Table of Contents

1. [Language & Environment](#language--environment)
2. [Naming Conventions](#naming-conventions)
3. [Code Formatting](#code-formatting)
4. [Import/Export Patterns](#importexport-patterns)
5. [Type Safety](#type-safety)
6. [Comments & Docstrings](#comments--docstrings)
7. [Editor Configuration](#editor-configuration)
8. [Linting & Format Checking](#linting--format-checking)

---

## Language & Environment

### TypeScript Configuration

```jsonc
{
  "compilerOptions": {
    "target": "ESNext",
    "lib": ["ESNext"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictPropertyInitialization": true,
    "exactOptionalPropertyTypes": true,
    "declaration": true,
    "sourceMap": true,
    "outDir": "./build",
    "rootDir": "./src",
    "removeComments": true,
  },
}
```

**Key Settings:**

- ✅ `strict: true` — Enforce strict type checking
- ✅ `noUnusedLocals` / `noUnusedParameters` — Catch unused code
- ✅ `noImplicitAny` — Require explicit types
- ✅ `exactOptionalPropertyTypes` — Prevent undefined from being assigned to optionals
- ✅ `declaration: true` — Generate `.d.ts` files for type safety
- ✅ `sourceMap: true` — Enable debugging with original source

### Runtime Requirements

- **Node.js**: 24+ (supports native ES modules and latest APIs)
- **Package Manager**: npm 10.9.0+
- **Module System**: ES Modules (ESM) only — no CommonJS

### Build Process

**Pipeline**: TypeScript Compiler → Path Alias Resolution → ESM Fixing

```bash
# Development
npm run build:watch       # Watch mode compilation

# Production build
npm run build            # tsc + tsc-alias + fix-esm.mjs

# Steps:
# 1. tsc compiles TS to JS (ESNext target)
# 2. tsc-alias resolves path aliases
# 3. fix-esm.mjs fixes ESM module exports for Node.js
```

**No bundler** (Vite, esbuild, Rollup) — direct TypeScript compilation for cleaner, more transparent output.

---

## Naming Conventions

### Classes

**Pattern:** `PascalCase`

```typescript
// ✅ Good
class GetRouteHandler {}
class BadRequestError {}
class UserRepository {}
class ConfigService {}

// ❌ Avoid
class get_route_handler {} // snake_case
class getRouteHandler {} // camelCase
```

**Guidance:**

- Name classes after their primary responsibility (e.g., `GetRouteHandler` for HTTP GET handlers)
- Use descriptive suffixes: `Handler`, `Service`, `Repository`, `Adapter`, `Port`
- Abstract classes can prefix with `Abstract`: `AbstractRouteHandler`

### Functions & Methods

**Pattern:** `camelCase`

```typescript
// ✅ Good
function createLogger() { }
function resolveDependency(token) { }
async function loadConfiguration() { }
method.parseRequest() { }

// ❌ Avoid
function CreateLogger() { }  // PascalCase (for functions)
function parse_request() { }  // snake_case
```

### Interfaces & Type Aliases

**Pattern:** `PascalCase`

```typescript
// ✅ Good
interface BadRequestErrorArgs { }
interface ConfigServer { }
type Constructor<T> = new (...args: any[]) => T;
type LoggerPort = { log(...): void };

// ❌ Avoid
interface badRequest_Args { }
type constructor<T> = ...;
```

### Variables & Constants

**Pattern:**

- Regular variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE` (for module-level constants)

```typescript
// ✅ Good
const userCount = 0;
const getDatabaseVendor = () => "MONGOOSE";
const TIMEOUT_MS = 5000;
const DATABASE_VENDOR = "MONGODB";
let currentUser = null;

// ❌ Avoid
const UserCount = 0;
const timeout_ms = 5000;
const timeoutMs = 5000; // Avoid PascalCase for variables
```

**Guidance:**

- Use descriptive variable names that convey intent
- Avoid abbreviations unless universally known (e.g., `url`, `id`)
- Single-letter variables are acceptable only in loops or mathematical contexts

### Files & Folders

**Pattern:** `kebab-case` (lowercase with hyphens)

```
src/
  dependency-injection/
  error-guards/
  get-route-handler.ts
  user-repository.ts
  create-logger.ts
  user.test.ts
```

**Guidance:**

- File name should match primary export (e.g., `get-route-handler.ts` exports `GetRouteHandler`)
- Test files: `<module>.test.ts`
- Type definition files (if separate): `<module>.types.ts` or `types/`
- Index files: `index.ts` for barrel exports

### Enums

**Pattern:** `PascalCase` for enum name, `UPPER_SNAKE_CASE` for values

```typescript
// ✅ Good
enum ServerVendor {
  FASTIFY = "FASTIFY",
  EXPRESS = "EXPRESS",
}

enum DatabaseVendor {
  MONGOOSE = "MONGOOSE",
  SEQUELIZE = "SEQUELIZE",
}

// ❌ Avoid
enum serverVendor {
  fastify = "fastify",
}
enum DATABASE_VENDOR {
  Mongoose = "mongodb",
}
```

---

## Code Formatting

### Indentation & Whitespace

- **Indentation**: 2 spaces
- **Line Length**: 80–100 characters (wrap longer lines)
- **Trailing Commas**: Required in multiline objects/arrays
- **Whitespace**: No tabs; spaces only

```typescript
// ✅ Good
const config = {
  name: "my-service",
  port: 3000,
  debug: true,
};

const items = ["item1", "item2", "item3"];

// ❌ Avoid
const config = { name: "my-service", port: 3000, debug: true }; // Too long
const items = ["item1", "item2", "item3"]; // Missing trailing comma
```

### Quotes

- **Strings**: Double quotes (`"`)
- **Template Literals**: Backticks (`` ` ``) for interpolation

```typescript
// ✅ Good
const message = "Hello, world!";
const greeting = `Hello, ${name}!`;
const path = "src/services/index.ts";

// ❌ Avoid
const message = "Hello, world!"; // Single quotes
const path = "src/services/index.ts";
```

### Semicolons

- **Yes**: Include semicolons on every statement

```typescript
// ✅ Good
const x = 5;
function doSomething() {}
export { MyClass };

// ❌ Avoid
const x = 5; // Missing semicolon
function doSomething() {}
```

### Arrow Functions

- Use arrow functions for callbacks, anonymous functions
- Use named functions for exported/public APIs

```typescript
// ✅ Good
const doubled = numbers.map((n) => n * 2);
const filtered = items.filter((item) => item.active);
export function createLogger() {}

// ❌ Avoid
const doubled = numbers.map((n) => n * 2); // Missing parens when multiline
const doubled = numbers.map(function (n) {
  return n * 2;
});
```

### Type Annotations

- Always annotate function parameters and return types
- Most variables can use type inference

```typescript
// ✅ Good
function getUserById(id: string): Promise<User> {}
const count: number = getCount();
const items = [1, 2, 3]; // Inferred as number[]

// ❌ Avoid
function getUserById(id) {} // No param type
function getUserById(id: string) {} // No return type
const items: Array<number> = [1, 2, 3]; // Unnecessary annotation
```

---

## Import/Export Patterns

### Module Organization

**Use ES Module syntax only:**

```typescript
// ✅ Good — imports from root and subpaths
import { Service } from "@zacatl/zacatl";
import { BadRequestError } from "@zacatl/error";
import { GetRouteHandler } from "@zacatl/service";

// ✅ Good — framework/library imports via subpaths
import { z } from "@zacatl/third-party/zod";
import { v4 as uuidv4 } from "@zacatl/third-party/uuid";
import { container } from "@zacatl/third-party/tsyringe";
import FastifyClass from "@zacatl/third-party/fastify";

// ✅ Good — namespace import (for large modules)
import * as utils from "./utils";
const result = utils.encode(input);

// ✅ Good — default export (for single primary export)
export default class Service {}
import Service from "./service";

// ❌ Avoid
const { GetRouteHandler } = require("./handlers"); // CommonJS
module.exports = Service; // CommonJS
```

### Export Organization

**Barrel Exports (index.ts):**

```typescript
// src/error/index.ts
export * from "./bad-request";
export * from "./unauthorized";
export * from "./custom";
export type { CustomErrorsArgs } from "./custom";
```

**All Dependencies via Subpaths:**

All third-party dependencies (frameworks, ORMs, utilities) are exported via library subpaths for consistency and single source of truth:

```json
{
  "exports": {
    "./third-party/express": {
      "types": "./build/third-party/express.d.ts",
      "import": "./build/third-party/express.js"
    },
    "./third-party/mongoose": {
      "types": "./build/third-party/mongoose.d.ts",
      "import": "./build/third-party/mongoose.js"
    },
    "./third-party/zod": {
      "types": "./build/third-party/zod.d.ts",
      "import": "./build/third-party/zod.js"
    },
    "./third-party/uuid": {
      "types": "./build/third-party/uuid.d.ts",
      "import": "./build/third-party/uuid.js"
    }
  }
}
```

**Benefits:**

- Single source of truth for all dependency versions
- Easier version management and updates
- Prevents inconsistent usage patterns

---

## Type Safety

### Interfaces vs. Types

- **Interfaces**: For object contracts, class implementations
- **Types**: For unions, primitives, tuples, generics

```typescript
// ✅ Good — interface for contract
interface RouteHandler {
  handle(req: Request): Response;
}

class GetHandler implements RouteHandler {
  handle(req: Request): Response { }
}

// ✅ Good — type for union/literal
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE";
type ConfigValue = string | number | boolean;

// ❌ Avoid
type RouteHandler = {  // Should be interface
  handle(req: Request): Response;
};
interface HTTPMethod = "GET" | "POST";  // Should be type
```

### Error Handling

- Always define typed error classes
- Extend the project's base error class (if one exists)

```typescript
// ✅ Good
class BadRequestError extends CustomError {
  constructor(args: BadRequestErrorArgs) {
    super({
      message: args.message,
      code: 400,
      reason: args.reason,
    });
  }
}

// ❌ Avoid
throw new Error("Bad request");
throw "Bad request";
```

### Generics

- Use descriptive type variables (not single-letter unless context is clear)

```typescript
// ✅ Good
class Repository<TModel extends BaseModel> {}
function mapArray<T, U>(arr: T[], fn: (item: T) => U): U[] {}
type Handler<TRequest, TResponse> = (req: TRequest) => TResponse;

// ❌ Avoid
class Repository<T> {} // Unclear what T is
function mapArray<A, B>(arr: A[], fn: (item: A) => B): B[] {}
```

---

## Comments & Docstrings

### JSDoc for Public APIs

Include JSDoc comments for public functions, classes, and methods:

````typescript
/**
 * Creates a logger instance with a specific adapter.
 * This is the recommended way to create loggers with custom adapters.
 *
 * @param adapter - LoggerPort implementation (defaults to PinoLoggerAdapter)
 * @returns Logger instance
 *
 * @example
 * ```typescript
 * const logger = createLogger();
 * const cliLogger = createLogger(new ConsoleLoggerAdapter());
 * ```
 */
export function createLogger(adapter?: LoggerPort): Logger {}
````

> Inferred from codebase documentation patterns

### Inline Comments

- Keep inline comments brief and explain _why_, not _what_
- Avoid obvious comments

```typescript
// ✅ Good
// Pre-register database instances before instantiating layers
// This ensures repositories can resolve database instances in constructors
if (platforms?.server?.databases) {
  for (const dbConfig of platforms.server.databases) {
    container.register(dbConfig.vendor, { useValue: dbConfig.instance });
  }
}

// ❌ Avoid
// Increment count  (obvious)
count++;
// Loop through items  (obvious)
for (const item of items) {
}
```

### File-Level Comments

Use block comments at the top of files to describe purpose:

```typescript
/**
 * Simple JSON and YAML configuration loader with Zod schema validation
 *
 * @example
 * import { loadJSON } from '@zacatl/configuration';
 * const config = loadJSON('./config.json', serverSchema);
 */
```

---

## Editor Configuration

### VS Code

Create or update `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "editor.insertSpaces": true,
  "editor.trimAutoWhitespace": true,
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  }
}
```

### .editorconfig

Create `.editorconfig` for cross-editor consistency:

```ini
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

---

## Linting & Format Checking

### ESLint Configuration

Use [ESLint flat config format](https://eslint.org/docs/latest/use/configure/configuration-files-new):

```javascript
import js from "@eslint/js";
import tsPlugin from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: ["build/**/*", "dist/**/*", "node_modules/**/*"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parserOptions: { ecmaVersion: "latest" },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": "error",
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];
```

### Prettier Configuration

Add `.prettierrc.json` or `prettier` key in `package.json`:

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### npm Scripts

```json
{
  "scripts": {
    "lint": "eslint src/ test/",
    "lint:fix": "eslint src/ test/ --fix",
    "format": "prettier --write .",
    "type:check": "tsc --noEmit",
    "validate": "npm run type:check && npm run lint"
  }
}
```

---

## Summary

| Aspect           | Rule           |
| ---------------- | -------------- |
| Classes          | `PascalCase`   |
| Functions        | `camelCase`    |
| Interfaces/Types | `PascalCase`   |
| Files/Folders    | `kebab-case`   |
| Indentation      | 2 spaces       |
| Line Length      | 80–100 chars   |
| Quotes           | Double (`"`)   |
| Semicolons       | Always         |
| Type Safety      | `strict: true` |
| Modules          | ESM only       |
