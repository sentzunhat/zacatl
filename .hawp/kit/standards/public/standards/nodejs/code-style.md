# Code Style Guide

TypeScript naming conventions, formatting rules, and import/export patterns for all projects.

**Status:** Standard level - Required

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

- `strict: true` — always on
- `noImplicitAny` — no untyped code
- `exactOptionalPropertyTypes` — prevent `undefined` being silently assigned to optionals
- `strictFunctionTypes` — enforce correct function type variance
- `strictPropertyInitialization` — prevent uninitialised class properties
- `removeComments: true` — strip source comments from compiled output
- `noUnusedLocals` / `noUnusedParameters` — catch dead code early

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

Include JSDoc for public functions, classes, and methods:

````typescript
/**
 * Creates a logger instance with a specific adapter.
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
if (platforms?.server?.databases) {
  for (const dbConfig of platforms.server.databases) {
    container.register(dbConfig.vendor, { useValue: dbConfig.instance });
  }
}

// ❌ Avoid — obvious comments
// Increment count
count++;
```

---

## Import / Export Patterns

- One concept per file; barrel `index.ts` re-exports public surface
- Named exports only — avoid default exports
- Group and order imports: Node built-ins → external packages → internal modules

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

- **No `any`** unless wrapping a truly untyped third-party boundary — document the exception
- Use **Zod** for runtime schema validation at system boundaries
- Use `unknown` instead of `any` for untrusted input
- Explicit return types on all public functions and methods

```typescript
// ✅ Good
const parseConfig = (raw: unknown): AppConfig => configSchema.parse(raw);

// ❌ Avoid
const parseConfig = (raw: any) => raw as AppConfig;
```

---

## React / Frontend Specifics

- **Functional components only** — no class components
- Props typed with an interface: `interface ComponentNameProps { ... }`
- `React.memo` only when profiling confirms a render bottleneck
- No `'use client'` / `'use server'` directives unless the project uses React Server Components
- Co-locate sub-components under `components/` inside the parent route/feature folder

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

**Standard level:** Required
