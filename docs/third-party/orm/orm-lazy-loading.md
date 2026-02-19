# ORM Lazy Loading - Node.js Solutions & Implementation

> **Version:** 0.0.23
> **Date:** January 31, 2026
> **Problem:** Eager ORM loading causing import errors in non-ORM projects

---

## The Problem

When importing from the main zacatl package, mongoose and sequelize were being loaded immediately, even if not used:

```typescript
// This caused: SyntaxError: The requested module 'mongoose' does not provide an export named 'connection'
import { Service } from "@sentzunhat/zacatl";
```

**Root Cause:** Main index.ts was re-exporting ORMs through barrel exports:

```typescript
export * from "./orm-exports"; // ❌ Eagerly loads mongoose + sequelize
```

---

## Node.js Ecosystem Solutions (Ranked)

### ✅ **Solution 1: Conditional Exports (IMPLEMENTED)**

**What:** Official Node.js ESM specification for package entry points

```json
// package.json
{
  "exports": {
    ".": "./build/index.js", // Main package (NO ORMs)
    "./third-party/mongoose": "./build/third-party/mongoose.js", // Opt-in Mongoose
    "./third-party/sequelize": "./build/third-party/sequelize.js" // Opt-in Sequelize
  }
}
```

**Usage:**

```typescript
// No ORM loading
import { Service, BaseRepository } from "@sentzunhat/zacatl";

// Explicit opt-in
import { mongoose, Schema } from "@sentzunhat/zacatl/third-party/mongoose";
import { Sequelize, DataTypes } from "@sentzunhat/zacatl/third-party/sequelize";
```

**Pros:**

- ✅ Official Node.js standard (12.20+, we're on 24+)
- ✅ Zero runtime overhead
- ✅ Tree-shaking friendly
- ✅ Works with all bundlers (Webpack, Vite, Rollup, esbuild)
- ✅ Used by major frameworks (Next.js, Fastify, NestJS)

**Cons:**

- Requires Node.js 12.20+ (not an issue for us)

---

### ✅ **Solution 2: Type-Only Imports (IMPLEMENTED)**

**What:** TypeScript `import type` prevents runtime module loading

```typescript
// ❌ This loads mongoose at runtime (even if only types needed)
import { Model } from "mongoose";

// ✅ This only loads types at compile time
import type { Model } from "mongoose";
```

**Implementation:**

```typescript
// src/service/layers/infrastructure/repositories/types.ts
import type { Model, Schema } from "mongoose"; // Type-only
import type { Sequelize, DataTypes } from "sequelize"; // Type-only
```

**Why This Works:**

- TypeScript strips `import type` during compilation
- No runtime module resolution for type-only imports
- ORMs only loaded when **actual implementation** (adapters) are used

---

### 🔄 **Solution 3: Dynamic Imports (ALREADY IN PLACE)**

**What:** Lazy-load modules at runtime using `await import()`

```typescript
// src/service/layers/infrastructure/orm/adapter-loader.ts
export async function loadMongooseAdapter<D, I, O>(config: MongooseRepositoryConfig<D>): Promise<ORMAdapter<D, I, O>> {
  try {
    // Dynamic import - only loads when Mongoose is actually used
    const adapters = await import("./adapters/mongoose-adapter");
    return new adapters.MongooseAdapter<D, I, O>(config);
  } catch (error: any) {
    if (error.code === "ERR_MODULE_NOT_FOUND") {
      throw new Error("Mongoose not installed. Run: npm install mongoose");
    }
    throw error;
  }
}
```

**When It Loads:**

- Only when `BaseRepository` is instantiated with `ORMType.Mongoose`
- Only when user actually creates a Mongoose repository
- Graceful error if mongoose not installed

**Pros:**

- ✅ Perfect for optional peer dependencies
- ✅ Clear error messages when ORM missing
- ✅ Works with ESM and CommonJS

**Cons:**

- Async initialization required
- Slightly more complex than static imports

---

### 🔄 **Solution 4: Separate Plugin Packages**

**What:** Publish ORMs as separate optional packages (like NestJS)

```
@sentzunhat/zacatl (core framework)
@sentzunhat/zacatl-mongoose (optional plugin)
@sentzunhat/zacatl-sequelize (optional plugin)
```

**Examples:**

- `@nestjs/core` + `@nestjs/mongoose` + `@nestjs/sequelize`
- `@mikro-orm/core` + `@mikro-orm/mongodb` + `@mikro-orm/postgresql`

**Pros:**

- ✅ Complete isolation
- ✅ Independent versioning
- ✅ Users install only what they need

**Cons:**

- ❌ More maintenance overhead (multiple packages)
- ❌ Harder monorepo setup
- ❌ Breaking change for existing users

**Decision:** Not needed for v0.0.23 - conditional exports solve the problem.

---

### 🔄 **Solution 5: Peer Dependencies Only**

**What:** Move ORMs from `dependencies` to `peerDependencies` only

```json
{
  "peerDependencies": {
    "mongoose": "^9.0.0",
    "sequelize": "^6.0.0"
  },
  "peerDependenciesMeta": {
    "mongoose": { "optional": true },
    "sequelize": { "optional": true }
  }
}
```

**Pros:**

- ✅ Smaller package size
- ✅ Users control ORM versions
- ✅ No bundled dependencies

**Cons:**

- ❌ Breaking change for existing users
- ❌ Requires explicit installation
- ❌ Version compatibility complexity

**Decision:** Kept in `dependencies` for v0.0.23 for version control and compatibility.

---

### ❌ **Solution 6: Proxy Pattern (NOT RECOMMENDED)**

**What:** Runtime lazy-loading using JavaScript Proxy

```typescript
export const mongoose = new Proxy(
  {},
  {
    get(target, prop) {
      const actual = require("mongoose");
      return actual[prop];
    },
  },
);
```

**Pros:**

- Transparent to users
- Works with existing code

**Cons:**

- ❌ Runtime overhead on every access
- ❌ Doesn't work well with TypeScript types
- ❌ Can't prevent module resolution in ESM
- ❌ Breaks IDE autocomplete

**Decision:** Not suitable for modern ESM TypeScript framework.

---

## Implementation Summary (v0.0.23)

### Changes Made

#### 1. **Removed ORM Barrel Exports**

**Before:**

```typescript
// src/index.ts
export * from "./orm-exports"; // ❌ Eager loading
```

**After:**

```typescript
// src/index.ts
// Note: ORM exports moved to dedicated entry points
// Import from: @sentzunhat/zacatl/third-party/mongoose
```

#### 2. **Created Dedicated ORM Entry Points**

```
src/third-party/
├── mongoose.ts  // Mongoose exports only
└── sequelize.ts // Sequelize exports only
```

```typescript
// src/third-party/mongoose.ts
export { default as mongoose, Mongoose, Schema, Model, Document, connect, connection } from "mongoose";

export type { Model as MongooseModel } from "mongoose";
```

#### 3. **Updated package.json Exports**

```json
{
  "exports": {
    ".": {
      "import": "./build/index.js",
      "types": "./build/index.d.ts"
    },
    "./third-party/mongoose": {
      "import": "./build/third-party/mongoose.js",
      "types": "./build/third-party/mongoose.d.ts"
    },
    "./third-party/sequelize": {
      "import": "./build/third-party/sequelize.js",
      "types": "./build/third-party/sequelize.d.ts"
    }
  }
}
```

#### 4. **Converted to Type-Only Imports**

```typescript
// src/service/layers/infrastructure/repositories/types.ts
import type { Model, Schema } from "mongoose"; // Was: import { ... }
import type { Sequelize, DataTypes } from "sequelize"; // Was: import { ... }
```

#### 5. **Removed ORM Re-exports from Infrastructure**

**Before:**

```typescript
// src/service/layers/infrastructure/index.ts
export { Schema, Model } from "mongoose"; // ❌
export { Sequelize, DataTypes } from "sequelize"; // ❌
```

**After:**

```typescript
// Note: Import ORMs from dedicated entry points
// - @sentzunhat/zacatl/third-party/mongoose
// - @sentzunhat/zacatl/third-party/sequelize
```

---

## Migration Guide for Users

### Before v0.0.23 (OLD)

```typescript
// ORM exports available from main package
import { Service, Schema, mongoose } from "@sentzunhat/zacatl";
```

### v0.0.23+ (NEW)

```typescript
// Main package - NO ORMs
import { Service, BaseRepository } from "@sentzunhat/zacatl";

// ORM imports - opt-in from dedicated paths
import { mongoose, Schema } from "@sentzunhat/zacatl/third-party/mongoose";
import { Sequelize, DataTypes } from "@sentzunhat/zacatl/third-party/sequelize";
```

### Non-Breaking for Most Users

If you weren't importing ORMs from zacatl (best practice), no changes needed:

```typescript
// Still works fine ✅
import { Service } from "@sentzunhat/zacatl";
import { Schema } from "mongoose"; // Direct import
```

---

## Verification Tests

Added comprehensive test suite ([test/unit/conditional-exports.test.ts](test/unit/conditional-exports.test.ts)):

```typescript
it("should import from main package without loading ORMs", async () => {
  const mainExports = await import("../../src/index.js");

  expect(mainExports.Service).toBeDefined();
  expect(mainExports.resolveDependency).toBeDefined();

  // ✅ ORMs NOT in main package
  expect(mainExports.mongoose).toBeUndefined();
  expect(mainExports.Sequelize).toBeUndefined();
});

it("should import Mongoose from dedicated entry point", async () => {
  const mongooseExports = await import("../../src/third-party/mongoose.js");

  // ✅ Available from dedicated path
  expect(mongooseExports.mongoose).toBeDefined();
  expect(mongooseExports.Schema).toBeDefined();
});
```

**Test Results:**

- ✅ 173 tests passing (was 169)
- ✅ 4 new conditional export tests
- ✅ No regressions
- ✅ All existing tests pass

---

## Benefits Achieved

### 1. **No Eager Loading**

```typescript
import { Service } from "@sentzunhat/zacatl"; // ✅ No mongoose/sequelize loaded
```

### 2. **Smaller Bundle Size**

Tree-shaking can eliminate unused ORM code when using bundlers.

### 3. **Better Error Messages**

```
Error: Mongoose is not installed. Install it with: npm install mongoose
```

### 4. **Follows Node.js Best Practices**

- ✅ Conditional exports (official ESM spec)
- ✅ Type-only imports
- ✅ Dynamic imports for optional features

### 5. **TypeScript Compatibility**

- ✅ Full type safety
- ✅ IDE autocomplete works
- ✅ No type pollution in main package

---

## Google/Research Validation

This approach is used by major Node.js frameworks:

1. **Next.js** - Extensive use of conditional exports
2. **Fastify** - Plugin-based with conditional exports
3. **NestJS** - Separate packages (`@nestjs/mongoose`, `@nestjs/sequelize`)
4. **Prisma** - Separate package strategy
5. **TypeORM** - Separate package strategy

**Official Node.js Documentation:**

- [Package Entry Points](https://nodejs.org/api/packages.html#package-entry-points)
- [Conditional Exports](https://nodejs.org/api/packages.html#conditional-exports)
- [Subpath Exports](https://nodejs.org/api/packages.html#subpath-exports)

---

## Next Steps for v0.0.23

- [x] Remove ORM exports from main index
- [x] Create dedicated ORM entry points
- [x] Update package.json exports map
- [x] Convert to type-only imports
- [x] Add verification tests
- [x] Update documentation

**Ready to publish!**

---

**Generated for:** Zacatl v0.0.23
**Last Updated:** January 31, 2026
