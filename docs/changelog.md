# Release Notes

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
