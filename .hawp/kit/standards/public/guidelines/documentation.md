# Documentation & Communication Guide

How to write comments, JSDoc, READMEs, and maintain changelogs across all projects.

## Documentation File Naming

Normal documentation files should use lowercase kebab-case.

Use:

- `file-organization.md`
- `build-and-env.md`
- `protected-routes.md`
- `audit-summary.md`

Avoid:

- `FILE_ORGANIZATION.md`
- `Build And Env.md`
- `build_and_env.md`
- `ProtectedRoutes.md`

Exceptions:

- Root and folder landing files can remain `README.md`.
- Historical changelog entries should not be renamed only for style compliance.

## Source-of-Truth Rule

- Runtime implementation in `src/` is the source of truth.
- Verify documented commands against `package.json` scripts.
- Verify routes against active route handlers.
- Verify environment variables against actual runtime/config usage.
- Keep implemented behavior separate from planned improvements.

## Table of Contents

1. [JSDoc & Docstrings](#jsdoc--docstrings)
2. [Inline Comments](#inline-comments)
3. [README Files](#readme-files)
4. [Changelog Format](#changelog-format)

---

## JSDoc & Docstrings

Include JSDoc for all **public** functions, classes, and interfaces. Skip JSDoc for private/internal helpers when the name and types are self-explanatory.

### Function

````typescript
/**
 * Creates a logger instance with a specific adapter.
 *
 * @param adapter - LoggerPort implementation (defaults to PinoLoggerAdapter)
 * @returns Logger instance ready for use
 *
 * @example
 * ```typescript
 * const logger = createLogger();
 * const cliLogger = createLogger(new ConsoleLoggerAdapter());
 * ```
 */
export const createLogger = (adapter?: LoggerPort): Logger => {
  const instance = adapter ?? new PinoLoggerAdapter();
  return {
    log: (msg, ctx) => instance.log(msg, ctx),
    error: (msg, err) => instance.error(msg, err),
  };
};
````

### Class

````typescript
/**
 * Service for managing user records.
 *
 * @example
 * ```typescript
 * const service = new UserService(repository);
 * const user = await service.findById('abc123');
 * ```
 */
@injectable()
export class UserService {
  constructor(@inject("UserRepository") private repo: UserRepositoryPort) {}

  /** Retrieves a user by ID, or null if not found. */
  async findById(id: string): Promise<UserOutput | null> {
    return this.repo.findById(id);
  }
}
````

### Interface / Type

```typescript
/**
 * Input shape for creating a new user.
 * Validated at the HTTP boundary with Zod before use.
 */
export interface CreateUserInput {
  /** Display name (1–100 characters) */
  name: string;
  /** Unique email address */
  email: string;
  /** Optional role; defaults to 'user' */
  role?: "admin" | "user";
}

/**
 * Configuration for database connections.
 * Supports both Mongoose (MongoDB) and Sequelize (SQL).
 */
export type DatabaseConfig = {
  /** Database vendor (Mongoose or Sequelize) */
  vendor: DatabaseVendor;
  /** Initialized database instance */
  instance: DatabaseInstance;
  /** Connection string (e.g., mongodb://localhost/db) */
  connectionString: string;
  /** Optional callback after successful connection */
  onDatabaseConnected?: (instance: DatabaseInstance) => Promise<void>;
};
```

### Generator Functions & Async Functions

````typescript
/**
 * Generates unique IDs for resources.
 * Yields UUID v4 strings until closed.
 *
 * @generator
 * @yields {string} Next unique ID
 *
 * @example
 * ```typescript
 * const idGen = idGenerator();
 * const id1 = idGen.next().value; // uuid...
 * const id2 = idGen.next().value; // uuid...
 * ```
 */
function* idGenerator() {
  while (true) {
    yield uuidv4();
  }
}

/**
 * Starts the server and waits for it to be ready.
 * Performs database migrations automatically.
 *
 * @async
 * @returns Promise that resolves when server is listening
 * @throws InternalServerError if database connection fails
 *
 * @example
 * ```typescript
 * await service.start();
 * console.log("Server ready!");
 * ```
 */
async function start(): Promise<void> {
  // ...
}
````

---

## Inline Comments

- Comment **why**, not **what** — the code itself shows what.
- Use `// TODO:` for known deferred work; include a brief description.
- Use `// NOTE:` for non-obvious constraints or gotchas.
- Remove commented-out code before merging — use version control for history.

```typescript
// ✅ Good — explains non-obvious behavior
// TSyringe requires reflect-metadata to be imported once before any decorators.
import "reflect-metadata";

// NOTE: Regenerate derived output when input context changes; do not reuse stale cache.
const output = await service.generate(context);

// ❌ Avoid — states the obvious
// Call findById to find user by id
const user = await repo.findById(id);
```

### Block Comments for Complex Logic

Use block comments to explain algorithms or non-obvious architectural decisions:

```typescript
/**
 * Validate circular dependencies in the service graph.
 *
 * Algorithm (simplified):
 * 1. Build dependency graph from provider declarations
 * 2. Perform DFS from each node to detect cycles
 * 3. If cycle found, throw with path details
 *
 * Time complexity: O(V + E) where V=providers, E=dependencies
 */
const validateNoCycles = (providers: Constructor[]): void => {
  // ...
};
```

### TODO & FIXME Comments

Use sparingly; prefer GitHub issues instead:

```typescript
// TODO: Add support for JSON Schema validation (issue #42)
// FIXME: Race condition in concurrent requests (issue #88)
```

---

## README Files

Every module or significant feature folder should have a `README.md`.

### Minimal README Template

```markdown
# Module Name

One-sentence description of what this module does.

## Usage

\`\`\`typescript
// Minimal working example
\`\`\`

## API

| Export    | Description           |
| --------- | --------------------- |
| `createX` | Creates an X instance |

## Notes

- Any important constraints or gotchas.
```

### Rules

- Keep READMEs factual; update them when behavior changes.
- Commands must be copy/paste-ready — test them before writing.
- Do not duplicate information that is already in the code types or JSDoc.

---

## Changelog Format

Use **[Keep a Changelog](https://keepachangelog.com/)** format:

```markdown
# Changelog

## [Unreleased]

### Added

- New feature description

### Fixed

- Bug fix description

### Changed

- Behavior change description

### Removed

- Deprecated feature removed

---

## [1.2.0] — 2026-05-04

### Added

- feat(auth): challenge-response bootstrap endpoint

### Fixed

- fix(user): empty profile query returning 500
```

### Rules

- Update `[Unreleased]` as you work; stamp it with version + date on release.
- One entry per change. Keep entries concise (1–2 sentences).
- Group by `Added`, `Changed`, `Fixed`, `Removed`, `Security`, `Deprecated`.
- Reference issue/PR numbers where applicable.
