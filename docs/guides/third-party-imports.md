# Third-Party Imports Pattern

## Overview

Zacatl provides **isolated third-party package exports** through dedicated subpaths to enable consumers to import only what they need. This pattern promotes:

- ✅ **Minimal bundle sizes** (tree-shakeable)
- ✅ **Lazy loading** of optional dependencies
- ✅ **Clean imports** without workarounds
- ✅ **Type safety** without bloat
- ✅ **Explicit dependency declarations**

---

## Available Third-Party Subpaths

### ESLint Integration

For ESLint configuration and TypeScript linting:

```typescript
import {
  tsEslintParser, // @typescript-eslint/parser
  tseslint, // typescript-eslint
  tsEslintPlugin, // @typescript-eslint/eslint-plugin
  importPlugin, // eslint-plugin-import
} from "@sentzunhat/zacatl/third-party/eslint";
```

**Use case:** ESLint config files that need direct access to ESLint plugins and parsers.

**Example (eslint.config.mjs):**

```javascript
import {
  tsEslintParser,
  tseslint,
} from "@sentzunhat/zacatl/third-party/eslint";

export default [
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: { project: "./tsconfig.json" },
    },
    plugins: { "@typescript-eslint": tseslint.plugin },
  },
];
```

### Mongoose (MongoDB)

For lazy-loaded Mongoose types and utilities:

```typescript
import type { Mongoose } from "@sentzunhat/zacatl/third-party/mongoose";
import { MongooseAdapter } from "@sentzunhat/zacatl/third-party/mongoose";
```

**Use case:** Repositories and database adapters that need to support Mongoose without bundling it.

**Example:**

```typescript
import type { Mongoose } from "@sentzunhat/zacatl/third-party/mongoose";
import { BaseRepository } from "@sentzunhat/zacatl/infrastructure";

class UserRepository extends BaseRepository<User, Mongoose> {
  constructor(mongoose: Mongoose) {
    super({
      type: "mongoose",
      instance: mongoose,
      name: "User",
      schema: userSchema,
    });
  }
}
```

### Sequelize (SQL Databases)

For lazy-loaded Sequelize types and utilities:

```typescript
import type { Sequelize } from "@sentzunhat/zacatl/third-party/sequelize";
import { SequelizeAdapter } from "@sentzunhat/zacatl/third-party/sequelize";
```

**Use case:** Repositories and database adapters that need to support Sequelize without bundling it.

**Example:**

```typescript
import type { Sequelize } from "@sentzunhat/zacatl/third-party/sequelize";
import { BaseRepository } from "@sentzunhat/zacatl/infrastructure";

class UserRepository extends BaseRepository<User, Sequelize> {
  constructor(sequelize: Sequelize) {
    super({
      type: "sequelize",
      instance: sequelize,
      model: UserModel,
    });
  }
}
```

---

## When to Use Each Pattern

### Direct Package Imports (Development Time)

Use direct package imports in **source files that execute at build/runtime**:

```typescript
// ✅ In application code (src/*)
import mongoose from "mongoose";
import { Sequelize } from "sequelize";

// ✅ In dev-only files
import tseslint from "typescript-eslint"; // in eslint.config.mjs
```

### Third-Party Subpath Imports (Runtime Only)

Use `@sentzunhat/zacatl/third-party/*` for **code that handles external dependencies**:

```typescript
// ✅ For exported database adapters
export { MongooseAdapter } from "@sentzunhat/zacatl/third-party/mongoose";

// ✅ For optional ORM support in repos
import type { Mongoose } from "@sentzunhat/zacatl/third-party/mongoose";

// ✅ For lazy-loaded infrastructure
const adapter = await import("@sentzunhat/zacatl/third-party/mongoose");
```

---

## Import Guidelines by File Type

### ESLint Configuration Files (.mjs)

**These run at development time** - use direct imports:

```javascript
// ✅ CORRECT - Development time, direct imports
import tseslint from "typescript-eslint";
import tsEslintParser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

export default [
  /* config */
];
```

```javascript
// ❌ INCORRECT - Will fail because built package not available during dev
import {
  tseslint,
  tsEslintParser,
} from "@sentzunhat/zacatl/third-party/eslint";
```

### TypeScript Service Code (src/\*_/_.ts)

**For type imports of optional dependencies** - use third-party subpaths:

```typescript
// ✅ CORRECT - Isolated type import, no bundle bloat
import type { Mongoose } from "@sentzunhat/zacatl/third-party/mongoose";

class UserRepository {
  constructor(mongoose: Mongoose) {
    // Works with lazy-loaded mongoose
  }
}
```

```typescript
// ❌ LESS OPTIMAL - Bundles mongoose into main package
import type { Mongoose } from "mongoose";
```

### Runtime Values (src/\*_/_.ts)

**For required core functionality** - use main package or direct imports:

```typescript
// ✅ CORRECT - Core functionality
import { BaseRepository, Service } from "@sentzunhat/zacatl";

// ✅ CORRECT - Actual mongoose usage (in code path that needs it)
import mongoose from "mongoose";
await mongoose.connect(url);
```

---

## Real-World Example: Multi-Adapter Repository

```typescript
import type { Mongoose } from "@sentzunhat/zacatl/third-party/mongoose";
import type { Sequelize } from "@sentzunhat/zacatl/third-party/sequelize";
import { BaseRepository, ORMType } from "@sentzunhat/zacatl/infrastructure";

type DatabaseInstance = Mongoose | Sequelize;

export class UserRepository extends BaseRepository<User, DatabaseInstance> {
  constructor(private db: DatabaseInstance) {
    const isMongoose = (db: DatabaseInstance): db is Mongoose => {
      return "connect" in db;
    };

    const config = isMongoose(db)
      ? {
          type: ORMType.Mongoose,
          instance: db,
          schema: userSchema,
          name: "User",
        }
      : {
          type: ORMType.Sequelize,
          instance: db,
          model: UserModel,
        };

    super(config);
  }
}
```

This approach:

- ✅ Bundles **neither** mongoose nor sequelize by default
- ✅ **Types work** regardless of which ORM is installed
- ✅ **Lazy loading** at runtime when needed
- ✅ **Clean imports** without workarounds

---

## Package Exports Reference

### Main Package

```typescript
// ✅ Always available
import { Service, BaseRepository, singleton, logger } from "@sentzunhat/zacatl";
```

### Subpath: `/eslint`

```typescript
// ✅ ESLint configurations (for config files)
import { recommended, baseConfig } from "@sentzunhat/zacatl/eslint";
```

### Subpath: `/third-party/eslint`

```typescript
// ✅ ESLint internals (re-exports)
import {
  tseslint,
  tsEslintParser,
} from "@sentzunhat/zacatl/third-party/eslint";
```

### Subpath: `/third-party/mongoose`

```typescript
// ✅ Mongoose types and adapters
import type { Mongoose } from "@sentzunhat/zacatl/third-party/mongoose";
import { MongooseAdapter } from "@sentzunhat/zacatl/third-party/mongoose";
```

### Subpath: `/third-party/sequelize`

```typescript
// ✅ Sequelize types and adapters
import type { Sequelize } from "@sentzunhat/zacatl/third-party/sequelize";
import { SequelizeAdapter } from "@sentzunhat/zacatl/third-party/sequelize";
```

---

## Tree-Shaking Benefits

When you import only what you need:

```typescript
// ✅ This import...
import type { Mongoose } from "@sentzunhat/zacatl/third-party/mongoose";

// ...is tree-shaken away if mongoose is never actually used
// Final bundle = Zero mongoose overhead
```

vs.

```typescript
// ❌ This import...
import { BaseRepository, mongooseSupport } from "@sentzunhat/zacatl";

// ...bundles ALL ORMs by default
// Final bundle = mongoose + sequelize + better-sqlite3 + types
```

---

## FAQ

### Q: Why can't I use `@sentzunhat/zacatl/third-party/eslint` in ESLint config?

**A:** ESLint config files run at **development time** before the package is built. The third-party exports only exist in the **published/built** package. During development, use direct imports instead.

### Q: When should I use `@sentzunhat/zacatl/third-party/*`?

**A:** When writing code that will be **published** or **distributed** as part of a library that wants to avoid bundling optional dependencies.

### Q: Can I use third-party imports in test files?

**A:** No, tests run locally. Use direct imports (same as dev config). The third-party pattern is for **published library code only**.

### Q: Does this affect runtime performance?

**A:** No - it's purely a bundling optimization. At runtime, all imports resolve to the same dependencies.

### Q: What's the difference between `third-party/mongoose` and plain `mongoose`?

**A:** Both reference the same package at runtime. The subpath is for:

- **Types without bundling** when you don't actually use mongoose
- **Lazy loading patterns** in optional feature code
- **Tree-shaking friendly** exports

---

## Related Guides

- [Dependencies Reference](./dependencies-reference.md) - Install/no-install decisions
- [ESLint Configuration](./eslint-configuration.md) - Configuring linting rules
- [Service Adapter Pattern](./service-adapter-pattern.md) - Building adapters

---

**Next:** [Back to Guides](./index.md) | [Main Docs](../index.md)
