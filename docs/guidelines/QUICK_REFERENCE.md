# Quick Reference Card

**Print this or bookmark for fast lookup during development.**

---

## Naming at a Glance

| Type       | Pattern            | Example                                  |
| ---------- | ------------------ | ---------------------------------------- |
| Classes    | `PascalCase`       | `GetRouteHandler`, `BadRequestError`     |
| Functions  | `camelCase`        | `createLogger`, `resolveDependency`      |
| Interfaces | `PascalCase`       | `ConfigServer`, `BadRequestErrorArgs`    |
| Files      | `kebab-case`       | `get-route-handler.ts`, `user.test.ts`   |
| Folders    | `kebab-case`       | `dependency-injection/`, `error-guards/` |
| Constants  | `UPPER_SNAKE_CASE` | `DATABASE_VENDOR`, `TIMEOUT_MS`          |

---

## File Structure

```
src/
  ├── configuration/          # Config loading & validation
  ├── dependency-injection/   # DI container wrappers
  ├── error/                  # Error classes
  ├── logs/                   # Logging abstractions
  ├── localization/           # i18n adapters
  ├── service/
  │   ├── layers/
  │   │   ├── application/    # HTTP handlers, routes
  │   │   ├── domain/         # Business logic
  │   │   └── infrastructure/ # Repositories, adapters
  │   └── platforms/          # Server, CLI, Desktop setup
  ├── third-party/            # Framework/library wrappers
  └── utils/                  # Utilities

test/unit/                     # Tests mirroring src/
```

---

## Code Style Essentials

| Rule          | Standard           |
| ------------- | ------------------ |
| Indentation   | 2 spaces           |
| Line length   | 80–100 chars       |
| Quotes        | Double (`"`)       |
| Semicolons    | Always required    |
| Imports       | Alphabetical order |
| TypeScript    | `strict: true`     |
| Module System | ESM only           |

---

## Test File Naming

- **Pattern**: `<module>.test.ts`
- **Location**: `test/unit/` mirroring `src/`
- **Example**: `test/unit/error/bad-request.test.ts` tests `src/error/bad-request.ts`

---

## Commit Message Format

```
<type>(<scope>): <subject>
```

**Types**: `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `ci`, `style`

**Examples**:

```
feat(error): add ForbiddenError class
fix(service): handle null database connections
docs(api): update endpoint documentation
```

---

## Branch Naming

```
<type>/<scope>/<description>
```

**Examples**:

```
feat/error/forbidden-error
fix/service/null-connections
docs/readme/add-examples
```

---

## Layer Dependency Rules

```
✅ Application → Domain
✅ Infrastructure → Domain
✅ Platforms → All layers
❌ Domain → anywhere else
❌ Circular dependencies
```

---

## Import Order

1. External packages (Node, npm)
2. Path aliases (`@zacatl/`)
3. Relative imports (`./`, `../`)

```typescript
import { FastifyRequest } from 'fastify';
import { Service } from '@zacatl/service';
import { handleRequest } from './utils';
```

---

## All Third-Party via Subpaths

```typescript
// ✅ Correct
import { z } from '@zacatl/third-party/zod';
import { v4 as uuidv4 } from '@zacatl/third-party/uuid';
import { container } from '@zacatl/third-party/tsyringe';

// ❌ Don't export from root
```

---

## JSDoc Template

````typescript
/**
 * Brief description of what function does.
 *
 * @param arg1 - Description of arg1
 * @param arg2 - Description of arg2 (optional)
 * @returns Description of return value
 * @throws ErrorType when X happens
 *
 * @example
 * ```typescript
 * const result = myFunction("value");
 * console.log(result);
 * ```
 */
export function myFunction(arg1: string, arg2?: string): string {
  // ...
}
````

---

## Test Template (AAA Pattern)

```typescript
it('should [expected behavior] when [condition]', () => {
  // Arrange: setup
  const input = {
    /* ... */
  };

  // Act: call code
  const result = myFunction(input);

  // Assert: verify
  expect(result).toEqual(expected);
});
```

---

## npm Scripts

| Command               | Purpose                |
| --------------------- | ---------------------- |
| `npm run build`       | Compile TypeScript     |
| `npm run build:watch` | Watch mode compilation |
| `npm test`            | Run all tests once     |
| `npm run test:watch`  | Watch mode tests       |
| `npm run lint`        | ESLint check           |
| `npm run lint:fix`    | Auto-fix lint issues   |
| `npm run type:check`  | TypeScript checking    |
| `npm run clean:build` | Clean & rebuild        |

---

## Before Committing (Checklist)

- [ ] `npm run type:check` passes
- [ ] `npm run lint` passes (or `npm run lint:fix`)
- [ ] `npm test` passes
- [ ] Tests added for new features/fixes
- [ ] JSDoc added for public APIs
- [ ] Commit message follows format
- [ ] Branch name follows convention
- [ ] No debug code or logs left behind

---

## Where to Find More Info

| Topic                 | File                               |
| --------------------- | ---------------------------------- |
| Formatting & naming   | `docs/guidelines/code-style.md`    |
| Folder structure      | `docs/guidelines/architecture.md`  |
| Test structure        | `docs/guidelines/testing.md`       |
| Comments              | `docs/guidelines/documentation.md` |
| Commits & branches    | `docs/guidelines/git-workflow.md`  |
| Contributing process  | `CONTRIBUTING.md`                  |
| Test coverage roadmap | `docs/roadmap/testing-roadmap.md`  |

---

## Common Commands Cheat Sheet

```bash
# Setup
npm install
npm run build

# Development
npm run build:watch
npm run test:watch

# Before commit
npm run type:check && npm run lint:fix && npm test

# Full validation
npm run type:check && npm run lint && npm test && npm run build

# Coverage
npm run test:coverage && open coverage/index.html
```
