# REFACTOR-001 — Remove src/ Index Barrels and Use Direct Path Imports

**Type:** refactoring  
**Complexity:** high  
**Impact:** architectural, breaking for development imports (source-level only)  
**Status:** planning  

---

## Motivation

Currently, src/ contains 29 auto-generated `index.ts` barrel files that re-export from nested modules. While the published package prunes these (via `prune-barrels.ts`), the source tree contains indirection that complicates code navigation and maintenance.

**User insight:** Index files aren't necessary if package.json exports and TypeScript path mappings point directly to source files. Consumers can import from explicit subpaths:
- Instead of: `from '@zacatl/service'` (which imports service/index.ts)
- Use: `from '@zacatl/service/service'` (direct import)

**Benefits:**
- No re-export indirection — direct source imports
- Clearer module structure for contributors
- Simpler TypeScript resolution
- Fewer files to maintain
- Better IDE navigation (jump to source, not barrel)

**Trade-off:**
- Import paths become more explicit (development-level change)
- Published package.json exports define the public API, so consumers still see clean entry points

---

## Scope

### Phase 1: Analysis & Preparation
- [ ] Catalog all 29 index.ts files and their re-exports
- [ ] Identify which modules re-export multiple sub-modules (likely candidates for consolidation)
- [ ] Plan which modules can be removed vs. consolidated
- [ ] Update package.json exports to point to source files instead of index files

### Phase 2: Refactoring
- [ ] For simple modules (single re-export), point exports directly to source file
  - Example: `./error` → `build-src-esm/error/custom.d.ts` (main file)
- [ ] For complex modules (multiple re-exports), consolidate into a named file
  - Example: `./service` could consolidate Layers, BaseRepository, Platforms into a service-public-api.ts file
  - OR point to service/service.ts and document that consumers import submodules directly
- [ ] Update internal src/ imports to use direct paths instead of barrels
- [ ] Update examples to use new import paths
- [ ] Update tests to use new import paths
- [ ] Verify TypeScript path mappings still work

### Phase 3: Verification
- [ ] Run type checking (npm run type:check)
- [ ] Run tests (npm test)
- [ ] Run linting (npm run lint:silent)
- [ ] Verify publish dry-run still works
- [ ] Build examples successfully
- [ ] Verify no import errors

### Phase 4: Documentation
- [ ] Update docs/third-party/single-import.md with new direct-import patterns
- [ ] Add migration note in changelog
- [ ] Update README if it references barrel imports
- [ ] Document the new explicit import style in examples

---

## Current Index.ts Breakdown

### Simple Re-exports (candidates for direct file mapping):
```
src/configuration/index.ts
  → Re-exports loadJSON, loadYML from ./json, ./yml
  → Could map to: configuration/json.ts + configuration/yml.ts

src/dependency-injection/index.ts
  → Re-exports container from ./container
  → Could map directly to: dependency-injection/container.ts

src/error/index.ts
  → Re-exports from: bad-request, custom, forbidden, etc.
  → Could consolidate to: error/custom.ts (main file)
  
src/logs/index.ts
  → Re-exports from: pino (main), console, types
  → Could map to: logs/pino.ts (with cross-imports for submodules)

src/utils/index.ts
  → Re-exports utility functions
  → Could map to: utils/command-runner/runner.ts or consolidate
```

### Complex Re-exports (need consolidation):
```
src/service/index.ts
  → Re-exports: Service, Layers, BaseRepository, Platforms, types
  → Solution: Create service/service.ts that exports main API
  → Document that submodules are accessed via: 
    - @zacatl/service/service
    - @zacatl/service/layers/layers
    - @zacatl/service/platforms/platforms

src/third-party/index.ts
  → Re-exports multiple third-party wrappers
  → Solution: Keep as module facade, or point to primary wrapper
```

---

## Implementation Strategy

### Option A: Direct File Mapping (Preferred for Simple Modules)
Map package.json exports directly to source file instead of index:

**Before:**
```json
"./configuration": {
  "types": "./build-src-esm/configuration/index.d.ts",
  "import": "./build-src-esm/configuration/index.js"
}
```

**After:**
```json
"./configuration": {
  "types": "./build-src-esm/configuration/configuration.d.ts",
  "import": "./build-src-esm/configuration/configuration.js"
}
```

**Then:** Remove `src/configuration/index.ts`

### Option B: Consolidation File (For Complex Modules)
Create a module-level public API file:

**Before:**
```
src/service/index.ts (re-exports Service, Layers, BaseRepository, etc.)
```

**After:**
```
src/service/service.ts (exports Service class, re-exports key types/components)
// Other modules accessed via subpaths:
// - import { Layers } from '@zacatl/service/layers/layers'
// - import { BaseRepository } from '@zacatl/service/layers/infrastructure/repositories/abstract'
```

---

## Package.json Exports Changes

### Current (with index.ts):
```json
"exports": {
  "./service": {
    "types": "./build-src-esm/service/index.d.ts",
    "import": "./build-src-esm/service/index.js",
    "require": "./build-src-cjs/service/index.js"
  },
  "./service/layers/layers": { ... },
  "./service/platforms/platforms": { ... }
}
```

### Proposed (without index.ts, explicit subpaths):
```json
"exports": {
  "./service": {
    "types": "./build-src-esm/service/service.d.ts",
    "import": "./build-src-esm/service/service.js",
    "require": "./build-src-cjs/service/service.js"
  },
  "./service/layers/layers": { ... },
  "./service/platforms/platforms": { ... }
}
```

**Result:** 
- `from '@zacatl/service'` → imports service/service.ts (public API)
- `from '@zacatl/service/layers'` → imports service/layers/index.ts (if needed) or layers.ts directly
- `from '@zacatl/service/layers/layers'` → imports service/layers/layers.ts (fully explicit)

---

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| Breaks internal imports | Run full test suite, type checking |
| TypeScript path resolution fails | Verify tsconfig.json paths match new structure |
| Examples import incorrectly | Update all examples to new paths, test each one |
| Publish package is invalid | Run `npm run publish:dry:ci`, verify exports work |
| Consumers' imports fail (source-level only) | Only affects development imports, published API stays clean |

---

## Success Criteria

- [ ] All 29 src/ index.ts files removed
- [ ] No circular import errors
- [ ] TypeScript type checking passes (0 errors)
- [ ] All 496 tests pass
- [ ] All 8 examples build without import errors
- [ ] Publish dry-run succeeds (tarball is valid)
- [ ] ESLint passes (import-order warnings acceptable)
- [ ] Documentation updated with new import patterns

---

## Estimated Effort

- **Phase 1 (Analysis):** 2 hours
- **Phase 2 (Refactoring):** 4-6 hours
- **Phase 3 (Verification):** 2 hours
- **Phase 4 (Documentation):** 1 hour
- **Total:** ~9-11 hours

---

## Alternative Approaches Considered

### ❌ Keep index.ts in source, only prune at publish (current approach)
- Pro: Convenience for development imports
- Con: Indirection, maintenance burden, code navigation noise
- Verdict: User prefers explicit imports for clarity

### ✅ Remove index.ts, use direct/subpath imports (proposed)
- Pro: Explicit structure, clearer code navigation, simpler
- Con: Slightly longer import paths for development
- Verdict: Chosen approach aligns with architectural clarity goal

### ❌ Merge all modules into single export file
- Pro: Minimal barrel files
- Con: Massive public API file, hard to maintain
- Verdict: Not viable for complex modules like service, infrastructure

---

## Dependencies & Blockers

- None at this time
- Can proceed independently of Docker optimization (STAB-020)

---

## Next Steps

1. **Schedule planning session** to review module structure and categorize
2. **Create detailed mapping** of which files to remove vs. consolidate
3. **Start Phase 1** with analysis of service, error, logs, utils modules
4. **Coordinate with team** on public API changes (if any)
5. **Execute refactoring** phase by phase with verification at each step

---

**Owner:** TBD  
**Target:** Post-0.0.56 (separate refactoring branch)  
**Complexity:** Medium-High (architectural change)
