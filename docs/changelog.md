# Release Notes

## [0.0.32] - 2026-02-07

### 📦 Release

- **Version Sync**: Bumped package version to 0.0.32

### 📚 Documentation

- **Docs & Examples**: Updated version references, test counts, and Node requirements
- **Coverage Update**: Updated all documentation to reflect current test coverage (61.6%)
- **Internal Docs**: Archived historical audit documents to `docs/archive/`

### ✅ Code Quality

- **Lint Fixes**: Added explicit TypeScript return types in `src/loader.ts`
- **Test Suite**: 178 tests passing with 61.6% coverage (61.59% statements, 43.20% branches, 62.85% functions, 61.14% lines)

---

## [0.0.31] - 2026-02-07

### 🏗️ Architecture

- **Standardized Ports & Adapters Structure**: Removed all top-level `adapters/` folders across the codebase
  - Moved `logs/adapters/*` files to `logs/` root (console-adapter.ts, pino-adapter.ts)
  - Moved `orm/adapters/*` files to `orm/` root (mongoose-adapter.ts, sequelize-adapter.ts)
  - Removed `server/adapters/` re-export folder in favor of direct feature imports
  - All adapters now live directly alongside their ports and types within feature folders
  - Simplified import paths and improved module cohesion

### ✅ Fixes

- **Import Paths**: Updated all internal imports after adapter file relocations
  - Fixed relative imports in moved adapter files
  - Updated test file imports to reference new locations
  - Updated adapter-loader dynamic imports

### 📦 Build & Tests

- All 178 tests passing after restructuring
- Build verification successful with updated import paths

---

## [0.0.28] - 2026-02-06

### ✨ Enhancements

- **Runtime Path Alias Resolution**: Integrated `tsc-alias` post-build step to transform internal path aliases (`@zacatl/*`) into relative imports
  - Enables external consumers to use the library without path alias resolution issues
  - Build script now runs `tsc && tsc-alias` for complete compilation pipeline
  - Path aliases properly replaced in CommonJS and ESM output

### ✅ Fixes

- **Export Condition Ordering**: Reordered all package.json exports to place `"types"` condition first
  - Resolves TypeScript build warnings about incorrect export condition order
  - Ensures type information is properly resolved before runtime conditions
  - Applies to all 24+ subpath exports

### 📦 Dependencies

- Added `tsc-alias@^1.8.16` to dev dependencies for runtime path alias resolution

---

## [0.0.27] - 2026-02-05

### ✨ Enhancements

- **Bun Runtime Support**: Added `"bun"` export conditions to all package.json exports
  - Bun now automatically uses TypeScript source files (`src/**/*.ts`) instead of compiled JavaScript
  - Enables native path alias resolution (`@zacatl/*`) without build-time transformation
  - Significantly improves Docker build times (no framework compilation needed)
  - Node.js/npm continue to use compiled build artifacts as before

- **Dependency Updates**: Updated to latest stable versions
  - `@fastify/static`: 8.3.0 → 9.0.0
  - `@types/bun`: 1.3.6 → 1.3.8
  - `@types/node`: 24.10.1 → 25.2.1
  - `fastify`: 5.6.2 → 5.7.4
  - `i18next`: 25.8.0 → 25.8.4
  - `knip`: 5.71.0 → 5.83.0
  - `mongodb-memory-server`: 10.4.1 → 11.0.1
  - `mongoose`: 9.0.0 → 9.1.6

### ✅ Fixes

- **Exports**: Added CommonJS-compatible `require` entry for the main export
- **DI Stability**: Fixed dependency injection error handling with `isRegistered` validation
  - Now throws proper error messages when dependencies are not registered
  - Improved error messages include class names and dependency chain information
- **Type Safety**: Fixed strict TypeScript mode violations
  - Index signature access properly typed in localization tests
  - Null safety checks in layer registration tests
  - Buffer access using globalThis for Node.js compatibility
- **Tests**: All 183 unit tests passing with updated dependencies

**Migration Guide:** [docs/migration/v0.0.26-to-v0.0.27.md](./migration/v0.0.26-to-v0.0.27.md)

---

## [0.1.0] - 2026-02-03

### 🎯 Multi-Context Architecture Support

**Major Feature:** Zacatl now supports CLI, Desktop, and Server applications from a single, unified architecture.

#### New ServiceType Enum

```typescript
import { Service, ServiceType } from "@sentzunhat/zacatl";

// CLI Application
const cli = new Service({
  type: ServiceType.CLI,
  architecture: {
    application: { entryPoints: { cli: { commands: [...] } } },
    cli: { name: "my-tool", version: "1.0.0" },
    // ... rest of config
  },
});

// Desktop Application
const desktop = new Service({
  type: ServiceType.DESKTOP,
  architecture: {
    application: { entryPoints: { ipc: { handlers: [...] } } },
    desktop: {
      window: { title: "My App", width: 1024, height: 768 },
      platform: "neutralino"
    },
    // ... rest of config
  },
});

// HTTP Server (default - backward compatible)
const server = new Service({
  type: ServiceType.SERVER, // Optional: defaults to SERVER
  architecture: {
    application: { entryPoints: { rest: { hooks: [...], routes: [...] } } },
    server: { vendor: ServerVendor.FASTIFY },
    // ... rest of config
  },
});
```

#### Breaking Changes (with Backward Compatibility)

**Property Renames** for clarity and consistency:

| Old Name                   | New Name            | Compatibility               |
| -------------------------- | ------------------- | --------------------------- |
| `hookHandlers`             | `hooks`             | ✅ Legacy getters available |
| `routeHandlers`            | `routes`            | ✅ Legacy getters available |
| `ApplicationHookHandlers`  | `ApplicationHooks`  | ✅ Type alias available     |
| `ApplicationRouteHandlers` | `ApplicationRoutes` | ✅ Type alias available     |

**Config Structure Changes:**

- `ApplicationEntryPoints` is now polymorphic (supports `cli`, `rest`, `ipc`)
- `ConfigService` now includes optional `type: ServiceType` field
- New types: `ConfigCLI`, `ConfigDesktop`

**Backward Compatibility:**

- ✅ Old property names still work via legacy getters
- ✅ `type` defaults to `ServiceType.SERVER` if not specified
- ✅ Existing HTTP server configs work without changes
- ✅ All 201 tests passing

**Migration Guide:** [docs/migration/v0.0.26-to-v0.1.0.md](./migration/v0.0.26-to-v0.1.0.md)

---

### 🏗️ Architecture Improvements

- **Type Safety**: Added validation for type-specific configurations
- **Polymorphic Entry Points**: Support for multiple application contexts
- **Cleaner API**: Shorter property names without losing clarity
- **Better Errors**: Helpful validation messages for config mismatches

---

### 📚 Documentation Updates

- Added [Multi-Context Cleanup Design](./architecture/MULTI-CONTEXT-CLEANUP-DESIGN.md)
- Added [Migration Guide v0.0.26 → v0.1.0](./migration/v0.0.26-to-v0.1.0.md)
- Updated README with multi-context examples
- Updated test count badges (201 tests at that time)

---

### 🧪 Testing

- **201 tests passing** (up from 188)
- Added tests for new validation logic
- Updated existing tests to use new property names

---

### 📦 New Exports

```typescript
// New type exports
export { ServiceType } from "@sentzunhat/zacatl";
export type { ConfigCLI, ConfigDesktop } from "@sentzunhat/zacatl";
export type { ApplicationHooks, ApplicationRoutes } from "@sentzunhat/zacatl";
```

---

### 🔮 Future Roadmap

- **v0.2.0**: CLI implementation complete (command execution, arg parsing)
- **v0.3.0**: Desktop implementation complete (IPC, window management)
- **v1.0.0**: Remove legacy getters, finalize API

---

## [0.0.23] - 2026-01-31

### 🎯 Dual ORM Import Strategy - Flexibility for All Use Cases

**New Feature:** Choose between convenience (main package) or minimal bundles (subpath imports).

#### Import Options

**Option 1 - Main Package (Convenience):**

```typescript
import { Service, mongoose, Schema, Sequelize } from "@sentzunhat/zacatl";
```

**Option 2 - Subpath Imports (Minimal Bundle):**

```typescript
import { Service } from "@sentzunhat/zacatl";
import { mongoose, Schema } from "@sentzunhat/zacatl/third-party/mongoose";
import { Sequelize, DataTypes } from "@sentzunhat/zacatl/third-party/sequelize";
```

#### Why Both Options?

- **Main Package**: Quick projects, prototypes, learning (includes both ORMs)
- **Subpath Imports**: Production apps, bundle optimization (tree-shakeable)

**No Breaking Changes:** Both import styles work - choose based on your needs.

**See:** [docs/guides/orm-import-strategies.md](./guides/orm-import-strategies.md)

---

### 🧹 Code Cleanup

- Simplified documentation comments throughout codebase
- Removed redundant explanations while keeping essential docs
- Cleaner code, same functionality

---

### 📦 Dependency Management Optimization

**Change:** Mongoose and Sequelize included as regular dependencies for version control.

**Rationale:**

- **Single Source of Truth:** All users get tested, compatible ORM versions
- **Version Control:** Zacatl manages ORM version compatibility
- **Automatic Updates:** Upgrading zacatl updates ORMs to compatible versions
- **Simpler Installation:** `npm install @sentzunhat/zacatl` includes everything

**Dependencies Structure:**

- `dependencies`: Core packages + mongoose + sequelize (guaranteed compatible)
- `peerDependencies`: Optional flexibility for advanced users to override
- `devDependencies`: Testing tools (mongodb-memory-server, etc.)

---

## [0.0.22] - 2026-01-31

### 🐛 Critical ESM Runtime Fix

#### **Issue: CommonJS `require()` in ESM Environment**

**Problem:** v0.0.21 used `require()` for lazy loading adapters, which throws `ReferenceError: require is not defined` in pure ESM environments (Bun, Node.js ESM, Vite, Next.js).

**Root Cause:**

```typescript
// v0.0.21 - BROKEN in ESM
export function loadMongooseAdapter(config) {
  const adapters = require("./adapters/mongoose-adapter"); // ❌
  return new adapters.MongooseAdapter(config);
}
```

**Solution:** Replaced `require()` with async `import()` and implemented lazy initialization pattern:

```typescript
// v0.0.22 - Works in ALL environments
export async function loadMongooseAdapter(config) {
  const adapters = await import("./adapters/mongoose-adapter"); // ✅
  return new adapters.MongooseAdapter(config);
}
```

**Implementation Details:**

- ✅ Repository constructors remain synchronous (no breaking changes)
- ✅ Adapters load lazily on first async method call
- ✅ Single initialization promise prevents race conditions
- ✅ Handles both ESM (`ERR_MODULE_NOT_FOUND`) and CommonJS (`MODULE_NOT_FOUND`) error codes

**Impact:** Framework now works in all JavaScript runtimes without `require is not defined` errors.

**Migration:** See [Migration Guide v0.0.22](./migration/v0.0.22.md) for details. Most users need no code changes.

---

### Testing

- ✅ 169 tests passing (8 new ESM adapter tests)
- ✅ Verified in Bun runtime
- ✅ Verified with Node.js ESM
- ✅ All existing tests pass without modification

---

## [0.0.21] - 2026-01-31

### 🐛 Critical Bug Fixes

#### **Issue #1: Optional ORM Dependencies (BREAKING FIX)**

**Problem:** Both Mongoose and Sequelize adapters were imported unconditionally at the top level, forcing all projects to install both ORMs even if only using one.

**Solution:** Implemented lazy loading with `require()` - adapters are now only loaded when actually used.

```typescript
// Now you can use ONLY Sequelize without installing mongoose
npm install @sentzunhat/zacatl sequelize

// Or ONLY Mongoose without installing sequelize
npm install @sentzunhat/zacatl mongoose
```

**Impact:** Projects can now install and use a single ORM without dependency conflicts.

---

#### **Issue #2: Mongoose v9 ESM Import**

**Problem:** `connection` named export doesn't exist in mongoose v9, causing `SyntaxError` in ESM environments.

**Before:**

```typescript
import { connection } from "mongoose"; // ❌ Breaks in v9
```

**After:**

```typescript
import mongoose from "mongoose";
mongoose.connection; // ✅ Works in v9
```

**Impact:** Mongoose adapter now works correctly with mongoose v9+ in ESM/tsx/Node.js runtimes.

---

### Developer Experience Improvements

#### 📦 Package Exports Map

- Added comprehensive `exports` field for better module resolution
- Shorter, cleaner import paths for better DX
- Backward compatible - all old paths still work

**New Import Shortcuts:**

```typescript
import { BaseRepository, ORMType } from "@sentzunhat/zacatl/infrastructure";
import { CustomError } from "@sentzunhat/zacatl/errors";
import { loadConfig } from "@sentzunhat/zacatl/config";
```

#### 🔧 Peer Dependencies

- Moved `mongoose` and `sequelize` to `peerDependencies` with `optional: true`
- Clearer indication of which ORMs are supported
- No forced installation of unused dependencies

#### 🧪 Bun Support

- Added `test:bun` and `test:node` scripts
- Better runtime-specific testing

#### 📚 Documentation

- Added [v0.0.21 Migration Guide](./migration/v0.0.21.md)
- Updated README with import shortcuts section
- All examples remain backward compatible

### Technical Details

**Lazy Loading Implementation:**

- Adapters use CommonJS `require()` for conditional loading
- Type safety maintained with TypeScript type assertions
- Works in both compiled JavaScript and TypeScript environments
- ORM type stored for runtime checks without instanceof

###Migration Path
No code changes required. Projects already using both ORMs will continue to work. Projects wanting to use a single ORM can now uninstall the unused one.

See [v0.0.21 Migration Guide](./migration/v0.0.21.md) for details.

---

## [0.0.20] - 2026-01-30

### Summary

Zacatl is production-ready with organized documentation, full test coverage, and verified build/publish pipelines.

## What's New

### 📚 Documentation Updates

- README optimized for npm
- Documentation split into small, focused files
- API reference, testing, examples, and getting-started guides

### ✅ Verification

- **Tests Passing**
- **Coverage** meets target
- **0 Compilation Errors**
- **0 Type Errors**
- **All npm Scripts Working**

### 🏗️ Architecture (Unchanged)

Layered/hexagonal architecture:

1. Application Layer - HTTP handlers, validation
2. Domain Layer - Business logic
3. Infrastructure Layer - Repositories, adapters
4. Platform Layer - Service orchestration, DI

## Features

✅ Fastify & Express integrations
✅ Sequelize & Mongoose adapters
✅ tsyringe DI container
✅ Zod validation
✅ 7 custom error types
✅ Pino logging
✅ i18n adapters
✅ YAML/JSON configuration
✅ Runtime detection (Node/Bun)

## No Breaking Changes

All changes are additive. Existing APIs remain unchanged.

## Quality Metrics

| Metric      | Value      | Status |
| ----------- | ---------- | ------ |
| Tests       | passing    | ✅     |
| Coverage    | target met | ✅     |
| Type Errors | 0          | ✅     |
| Lint Errors | 0          | ✅     |
| Compilation | Success    | ✅     |

## Next Steps

1. `npm run publish:latest`
2. Create GitHub release `vX.Y.Z`
3. Announce the release

---

**Status**: ✅ Ready for Release
**Version**: X.Y.Z
**Date**: YYYY-MM-DD
