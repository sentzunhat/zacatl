# Documentation & Communication Guide

This guide covers how to write comments, docstrings, READMEs, and maintain changelog documentation.

## Table of Contents

1. [JSDoc & Docstrings](#jsdoc--docstrings)
2. [Inline Comments](#inline-comments)
3. [README Files](#readme-files)
4. [Changelog & Release Notes](#changelog--release-notes)
5. [Type Documentation](#type-documentation)
6. [Example Code in Docs](#example-code-in-docs)

---

## JSDoc & Docstrings

### Function Documentation

Include JSDoc for all public functions. Use `@param`, `@returns`, `@example`, and `@throws` tags.

````typescript
/**
 * Creates a logger instance with a specific adapter.
 * This is the recommended way to create loggers with custom adapters.
 *
 * @param adapter - LoggerPort implementation (defaults to PinoLoggerAdapter)
 * @returns Logger instance
 * @throws Will not throw; defaults to PinoLoggerAdapter if adapter omitted
 *
 * @example
 * ```typescript
 * // Default logger with Pino
 * const logger = createLogger();
 *
 * // Custom adapter
 * const cliLogger = createLogger(new ConsoleLoggerAdapter());
 * ```
 *
 * @see Logger for available methods
 */
export function createLogger(adapter?: LoggerPort): Logger {
  const adapterInstance = adapter ?? new PinoLoggerAdapter();
  return {
    log: (message, input) => adapterInstance.log(message, input),
    info: (message, input) => adapterInstance.info(message, input),
    // ...
  };
}
````

### Class Documentation

Document classes with purpose, constructor params, and usage:

````typescript
/**
 * Service for managing greeting records.
 * Handles creation, retrieval, and deletion of greetings from the database.
 *
 * @example
 * ```typescript
 * const service = new GreetingService(repository);
 * const greetings = await service.getAll();
 * await service.create({ message: "Hello!" });
 * ```
 */
export class GreetingService {
  /**
   * Creates a new GreetingService instance
   * @param repository - Repository for greeting persistence
   */
  constructor(private repository: GreetingRepository) {}

  /**
   * Retrieves all greetings from the database
   * @returns Promise resolving to array of greetings
   */
  async getAll(): Promise<Greeting[]> {
    return this.repository.findAll();
  }
}
````

### Interface & Type Documentation

```typescript
/**
 * Error arguments interface for BadRequest errors.
 * Used when user input validation fails.
 */
export interface BadRequestErrorArgs extends CustomErrorsArgs {
  /** Human-readable error message */
  message: string;
  /** Brief reason (e.g., "Email is required") */
  reason?: string;
  /** Structured error metadata */
  metadata?: Record<string, unknown>;
  /** Original error that caused this error */
  error?: Error;
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
  /** Connection string (e.g. mongodb://localhost/db) */
  connectionString: string;
  /** Optional callback after successful connection */
  onDatabaseConnected?: (instance: DatabaseInstance) => Promise<void>;
};
```

### Method Documentation

Document public methods with their contract:

````typescript
export class Repository<T extends BaseModel> {
  /**
   * Finds all records matching the given criteria.
   *
   * @param where - Query object (varies by ORM)
   * @returns Promise resolving to array of matching records
   *
   * @example
   * ```typescript
   * const activeUsers = await repo.findAll({ status: "active" });
   * ```
   */
  async findAll(where?: Partial<T>): Promise<T[]> {
    // ...
  }

  /**
   * Saves a new record to the database.
   *
   * @param input - Data to save
   * @returns Promise resolving to saved record with ID
   * @throws ValidationError if input is invalid
   * @throws InternalServerError if database operation fails
   */
  async save(input: Omit<T, 'id'>): Promise<T> {
    // ...
  }
}
````

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

### When to Use Inline Comments

Write comments for the **why**, not the **what**:

```typescript
// ✅ Good — explains intent/strategy
// Pre-register database instances before instantiating layers
// This ensures repositories can resolve database instances in their constructors
if (platforms?.server?.databases) {
  for (const dbConfig of platforms.server.databases) {
    container.register(dbConfig.vendor, { useValue: dbConfig.instance });
  }
}

// ✅ Good — clarifies non-obvious behavior
// Use exact optional property types to distinguish `undefined` from absent
interface Config {
  timeout?: number;  // undefined if not set
}

// ❌ Avoid — states the obvious
count++;  // Increment count
const items = [];  // Create empty array
for (const item of items) {  // Loop through items
```

### Block Comments for Complex Logic

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

### README.md Sections

Every public module should have a `README.md` with:

````markdown
# Module Name

**One-line description**: What this module does and when to use it.

## Overview

2–3 paragraphs explaining:

- Purpose and main concepts
- When/why to use this module
- Key features

## Installation

```bash
npm install @zacatl/module
```
````

## Quick Start

Minimal runnable example:

```typescript
import { MyClass } from '@zacatl/module';

const instance = new MyClass();
await instance.doSomething();
```

## API Reference

### `MyClass`

**Constructor:**

- `constructor(config: MyConfig)`

**Methods:**

- `async doSomething(): Promise<void>` — Description
- `getStatus(): string` — Description

### `createMyFunction(options: Options): Instance`

Description of function...

## Best Practices

- Item 1
- Item 2
- Item 3

## Examples

### Example 1: Basic Usage

### Example 2: Advanced Usage

### Example 3: With Custom Options

## Troubleshooting

### Issue: X doesn't work

**Cause**: ...
**Solution**: ...

## Related Modules

- [Module A](../module-a) — Related functionality
- [Module B](../module-b) — Alternative approach

## See Also

- [Architecture Guide](./framework-overview.md)
- [Code Style](../code-style.md)

````

### Root README.md

Include:
- Project name & one-line description
- Key features (bulleted list with emojis)
- Tech stack
- Quick start / minimal example
- Link to main documentation

Example:

```markdown
# Project Name

Brief description of what this project does.

## Features

- ✨ Feature 1 description
- 🚀 Feature 2 description
- 🔧 Feature 3 description

## Quick Start

\`\`\`bash
npm install @scope/package
\`\`\`

\`\`\`typescript
import { MyClass } from "@scope/package";
const instance = new MyClass();
\`\`\`

## Documentation

- [Architecture](./docs/guidelines/framework-overview.md)
- [API Reference](./docs/api.md)
- [Examples](./examples/)

## License

MIT
````

---

## Changelog & Release Notes

### Changelog Format

Use [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
# Release Notes

---

## [1.0.0] - 2026-02-17

**Status**: Stable release

### ✨ Improvements

- Feature description in past tense
- Another feature description

### 🐛 Fixes

- Bug fix description
- Another bug fix

### ⚠️ Breaking Changes

- API change description
- Migration path: old → new

### 📚 Documentation

- Doc update description
- Added examples for feature X

### 🔧 Architecture

- Architecture change description
- Internal refactoring note

---

## [0.5.0] - 2026-02-10

(Previous release...)
```

### Emoji Categories

Use consistently for visual scanning:

| Emoji | Category      | Use For                           |
| ----- | ------------- | --------------------------------- |
| ✨    | Improvements  | New features, enhancements        |
| 🐛    | Fixes         | Bug fixes, corrections            |
| ⚠️    | Breaking      | API changes, removals             |
| 🔧    | Architecture  | Refactoring, internals            |
| 📚    | Documentation | Docs, guides, examples            |
| 🗺️    | Roadmap       | In-progress work, future plans    |
| 🚀    | Performance   | Speed improvements, optimizations |
| 🎉    | Milestones    | Major milestones (v1.0.0, etc.)   |

### Version Format

Follow [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH[-prerelease]

0.0.1  - Initial release
0.1.0  - New feature (0.x allows breaking changes)
0.1.1  - Bug fix
1.0.0  - Stable release
1.1.0  - New feature (post-1.0, no breaking changes)
1.1.1  - Patch fix
2.0.0  - Major breaking change
```

### Release Entry Checklist

- [ ] Version bumped in package.json
- [ ] Changelog entry at top (below `---`)
- [ ] Format: `## [VERSION] - YYYY-MM-DD`
- [ ] Status noted (Current release, Stable, Deprecated)
- [ ] All changes categorized with emoji
- [ ] Entries in past tense ("Added", not "Adds")
- [ ] Breaking changes clearly marked
- [ ] Migration guide included if applicable

---

## Type Documentation

### Generic Types

Document type parameters clearly:

````typescript
/**
 * Repository for persisting domain models.
 *
 * @template TModel - The model type this repository manages
 * @template TInput - The create/update input type
 *
 * @example
 * ```typescript
 * interface User { id: string; name: string; }
 * interface CreateUserInput { name: string; }
 *
 * class UserRepository extends Repository<User, CreateUserInput> { }
 * ```
 */
export abstract class Repository<TModel, TInput> {
  abstract findAll(): Promise<TModel[]>;
  abstract save(input: TInput): Promise<TModel>;
}
````

### Union & Intersection Types

```typescript
/**
 * Service type — determines application context.
 *
 * - SERVER: HTTP API server (default)
 * - CLI: Command-line interface application
 * - DESKTOP: Desktop application (Electron, Tauri, etc.)
 */
type ServiceType = 'SERVER' | 'CLI' | 'DESKTOP';

/**
 * Merged configuration combining server settings and database options.
 * Use when building apps that need both HTTP and database access.
 */
type AppConfig = ServerConfig & DatabaseConfig;
```

---

## Example Code in Docs

### Syntax Highlighting

Use language identifiers in code blocks:

````markdown
```typescript
// Runnable TypeScript example
const x: number = 5;
```

```bash
# Shell example
npm run build
```

```json
// JSON configuration
{
  "name": "my-app"
}
```
````

### Runnable Examples

Make code snippets copy-paste ready:

````typescript
// ✅ Good — complete, no missing context
/**
 * @example
 * ```typescript
 * import { createLogger } from "@zacatl/logs";
 *
 * const logger = createLogger();
 * logger.info("Application started");
 * ```
 */
````

````typescript
// ❌ Avoid — incomplete
/**
 * @example
 * ```typescript
 * const logger = createLogger();
 * logger.info(...);  // Fill in the message
 * ```
 */
````

### Progressive Examples

Show basic to advanced usage:

````typescript
/**
 * @example Basic usage
 * ```typescript
 * const service = new UserService();
 * const users = await service.getAll();
 * ```
 *
 * @example With filtering
 * ```typescript
 * const active = await service.getAll({ status: "active" });
 * ```
 *
 * @example With DI container
 * ```typescript
 * container.register(UserService);
 * const service = container.resolve(UserService);
 * const users = await service.getAll();
 * ```
 */
````

---

## Summary

| Aspect          | Rule                                 |
| --------------- | ------------------------------------ |
| JSDoc           | All public functions & classes       |
| Inline Comments | Explain why, not what                |
| README Sections | Overview, Quick Start, API, Examples |
| Changelog       | Keep a Changelog format              |
| Emoji Usage     | Consistent categories                |
| Versioning      | Semantic Versioning 2.0.0            |
| Code Examples   | Complete & copy-paste ready          |
