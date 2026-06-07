# Code Style Guide

TypeScript naming conventions, formatting rules, and import/export patterns for all projects.

## Table of Contents

1. [Language & Environment](#language--environment)
2. [Naming Conventions](#naming-conventions)
3. [Code Formatting](#code-formatting)
4. [Comments & Docstrings](#comments--docstrings)
5. [Import / Export Patterns](#import--export-patterns)
6. [Type Safety](#type-safety)
7. [React / Frontend Specifics](#react--frontend-specifics)

---

## Language & Environment

### TypeScript Configuration (Baseline)

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
    "removeComments": true,
  },
}
```

Key rules:

- `strict: true` — always on.
- `noImplicitAny` — no untyped code.
- `exactOptionalPropertyTypes` — prevent `undefined` being silently assigned to optionals.
- `strictFunctionTypes` — enforce correct function type variance.
- `strictPropertyInitialization` — prevent uninitialised class properties.
- `removeComments: true` — strip source comments from compiled output.
- `noUnusedLocals` / `noUnusedParameters` — catch dead code early.

### Runtime

- **Node.js**: 24.14.0 LTS+ minimum (required for `node:sqlite`, `AsyncLocalStorage` improvements, and native subpath imports).
- **Package Manager**: npm 11.0.0+.
- **Module System**: ESM source; dual ESM/CJS build outputs for distributed packages.

> **Upgrade note**: run `nvm install 24.14.0 && nvm use 24.14.0` (or equivalent) if your local Node is below 24.14.0.

### Build Pipeline

**No bundler** (Vite, esbuild, Rollup) — direct TypeScript compilation for cleaner, more transparent output.

```bash
# Pipeline: TypeScript Compiler (ESM + CJS) → Path Alias Resolution → ESM Fixing
npm run build            # build:src (esm+cjs) + build:scripts (esm+cjs)
npm run build:watch      # watch mode compilation
```

Steps in order:

1. `build:src:esm` — compiles TypeScript, resolves path aliases (`tsc-alias`), then runs `fix-esm.ts` to add `.js` extensions.
2. `build:src:cjs` — compiles CommonJS output.
3. `build:scripts` — compiles tooling/script outputs for esm+cjs.

### Validation Workflow

Run in this order before any commit or PR:

```bash
npm run type:check
npm run lint
npm run test
npm run build      # for library/service projects
```

Or combined: `npm run validate` (if configured).

---

## Naming Conventions

| Construct               | Convention         | Example                                      |
| ----------------------- | ------------------ | -------------------------------------------- |
| Classes                 | `PascalCase`       | `UserService`, `BadRequestError`             |
| Interfaces              | `PascalCase`       | `UserRepositoryPort`, `ConfigServerOptions`  |
| Type aliases            | `PascalCase`       | `CreateUserInput`, `UserOutput`              |
| Enums (type)            | `PascalCase`       | `HttpMethod`                                 |
| Enum values             | `UPPER_SNAKE_CASE` | `HttpMethod.GET`, `Status.ACTIVE`            |
| Functions / methods     | `camelCase`        | `createLogger`, `validateInput`              |
| Variables               | `camelCase`        | `userId`, `isAuthenticated`                  |
| Constants               | `UPPER_SNAKE_CASE` | `MAX_FILE_SIZE`, `DEFAULT_TIMEOUT`           |
| Files                   | `kebab-case`       | `user-repository.ts`, `bad-request-error.ts` |
| Folders                 | `kebab-case`       | `dependency-injection/`, `route-handlers/`   |
| React components (file) | `PascalCase.tsx`   | `BrandButton.tsx`, `UserCard.tsx`            |
| Hooks (file)            | `use-[name].ts`    | `use-auth.ts`, `use-theme.ts`                |

### Naming Patterns by Layer

- **Ports (domain interfaces)**: suffix `Port` — `UserRepositoryPort`, `LoggerPort`
- **Adapters (implementations)**: suffix `Adapter` — `MongoUserRepositoryAdapter`, `PinoLoggerAdapter`
- **Repositories**: `[Feature]RepositoryAdapter` implements `[Feature]RepositoryPort`
- **Route handlers**: `[Action][Resource]Handler` — `GetUserHandler`, `CreateOrderHandler`
- **Errors**: `[Type]Error` — `BadRequestError`, `ForbiddenError`, `NotFoundError`

---

## Code Formatting

| Rule            | Standard                          |
| --------------- | --------------------------------- |
| Indentation     | 2 spaces                          |
| Line length     | 80–100 characters                 |
| Quotes          | Single (`'`)                      |
| Semicolons      | Always required                   |
| Trailing commas | ES5-style (objects, arrays, etc.) |
| Import order    | Alphabetical within groups        |

Use **ESLint** (flat config, `eslint.config.mjs`) for enforcement. No Prettier — ESLint handles formatting rules.

### Functions: Prefer Arrow Functions

```typescript
// ✅ Preferred for declarations and callbacks
const createUser = async (input: CreateUserInput): Promise<UserOutput> => {
  return userRepo.save(input);
};

const ids = users.map((u) => u.id);

// Class methods remain regular methods
class UserService {
  async findById(id: string): Promise<UserOutput | null> {
    return this.repo.findById(id);
  }
}
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

/**
 * User domain entity.
 * Represents a registered user with basic profile information.
 *
 * @property id - Unique user identifier
 * @property email - Email address (must be unique)
 * @property role - User role (admin, user)
 */
export class User {
  id: string;
  email: string;
  role: "admin" | "user";
}
````

### Inline Comments

Keep inline comments brief and explain **why**, not **what**:

```typescript
// ✅ Good — explains the reason
// Pre-register database instances before instantiating layers
// This ensures repositories can resolve database instances in constructors
if (platforms?.server?.databases) {
  for (const dbConfig of platforms.server.databases) {
    container.register(dbConfig.vendor, { useValue: dbConfig.instance });
  }
}

// ❌ Avoid — obvious comments
// Increment count
count++;

// Loop through items
for (const item of items) {
}
```

---

## Import / Export Patterns

- One concept per file; barrel `index.ts` re-exports public surface.
- Named exports only — avoid default exports (hurts refactoring and discoverability).
- Group and order imports: Node built-ins → external packages → internal modules.

```typescript
// ✅ Good
import { readFile } from 'node:fs/promises';
import { injectable, inject } from 'tsyringe';
import { UserRepositoryPort } from '@/domain/providers/user-repository.port';

// ❌ Avoid — default exports
export default class UserService { ... }
```

---

## Type Safety

- **No `any`** unless wrapping a truly untyped third-party boundary — document the exception.
- Use **Zod** for runtime schema validation at system boundaries (HTTP input, config loading, external API responses).
- Use `unknown` instead of `any` for untrusted input, then narrow with Zod or type guards.
- Explicit return types on all public functions and methods.

```typescript
// ✅ Good
const parseConfig = (raw: unknown): AppConfig => configSchema.parse(raw);

// ❌ Avoid
const parseConfig = (raw: any) => raw as AppConfig;
```

---

## React / Frontend Specifics

- **Functional components only** — no class components.
- Props typed with an interface: `interface ComponentNameProps { ... }`.
- `React.memo` only when profiling confirms a render bottleneck.
- No `'use client'` / `'use server'` directives unless the project uses React Server Components (opt-in, document when used).
- Co-locate sub-components under `components/` inside the parent route/feature folder.

```typescript
// ✅ Good
interface UserCardProps {
  userId: string;
  displayName: string;
  className?: string;
}

const UserCard = ({ userId, displayName, className }: UserCardProps) => (
  <div className={className}>{displayName}</div>
);
```
