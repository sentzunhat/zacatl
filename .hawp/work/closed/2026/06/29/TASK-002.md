# Task: Automate tsconfig path generation for @zacatl/\* package imports

**Backlog ID:** TASK-002
**Type:** improvement
**Reported:** 2026-06-18
**Risk Level:** medium

---

## Input (what was requested)

Create an automated script that generates tsconfig path mappings for all src subdirectories, similar to how `prepare-publish.ts` generates package.json exports. Goal: enable access to all src code packages and imports via the `@zacatl/*` namespace from the tsconfig, keeping path mappings in sync as new modules are added.

---

## Context

The repository currently maintains two separate path-resolution systems:

1. **tsconfig.base.json** — Manually maintained path mappings (26 explicit `@zacatl/*` entries)

   - Located at `tsconfig.base.json` under `compilerOptions.paths`
   - Hard to keep in sync when new modules are added
   - Requires manual updates for each new folder added to `src/`

2. **package.json exports** — Auto-generated on publish via `scripts/publish/prepare-publish.ts`
   - Dynamically walks the build directory and creates exports
   - Flexible and scales automatically
   - Used only during package publication

The user wants tsconfig paths to be **generated automatically**, similar to the package.json approach.

---

## Analysis

### Root cause (or most likely cause):

Manual maintenance of tsconfig paths creates friction when adding new modules or refactoring folder structure. The publishing pipeline already demonstrates how to automate export discovery; the same pattern can be applied to tsconfig generation.

### Directly verified:

- Current path mappings in `tsconfig.base.json` are manually listed (lines 47–74)
- Module structure in `src/` follows consistent patterns: each main module has an `index.ts` barrel file
- `scripts/publish/prepare-publish.ts` (lines 1–350+) demonstrates filesystem walking and dynamic mapping generation
- `scripts/dev/generate-barrels.ts` shows how to walk `src/` and apply idempotent generation with header-based ownership tracking
- Existing modules with index.ts in `src/`: `configuration/`, `dependency-injection/`, `error/`, `logs/`, `localization/`, `service/`, `third-party/`, `utils/`
- Sub-modules also have index.ts (e.g., `service/layers/`, `service/platforms/`, `third-party/orm/`)

### Inferred (not yet proven):

- Whether deep sub-paths like `@zacatl/service/layers/domain` should also be exported or only top-level `src/` folders
- Whether to generate paths for **only direct `src/` children** or **recursively all index.ts locations** (user asked for "folders in the src folder" which suggests direct children, but needs clarification)
- Whether the generated paths should be committed to `tsconfig.base.json` or kept in a separate generated file

### Scope — what else is affected:

- `tsconfig.base.json` — will be updated with generated paths
- `tsconfig.json` (extends base)
- `tsconfig.cjs.json` (extends base)
- Potentially `test/tsconfig.json` and `scripts/tsconfig*.json` if they extend base
- Development workflow: regeneration should happen automatically or on-demand during development
- Documentation: need to update any setup or contribution guidelines mentioning manual path updates

---

## Work Coordination

**Owner:** agent (with user approval on design choice)
**Implementation status:** planning
**Overlapping files:**

- `tsconfig.base.json` — target of automation
- `scripts/dev/` — location for new generation script
- `.github/scripts/` or build scripts — possible alternative location
- `package.json` — may need new npm script to trigger generation

**Parallel work risk:** low (no active work on tsconfig or scripts)
**Can implement now:** yes, after approval on design choice below

**Coordination note:**

No parallel work detected in BACKLOG.md. TASK-001 (lifecycle typing) does not touch tsconfig or scripts.

**Path discipline:**

All repo-relative paths will use forward slashes and be measured from repository root.

**Repo-root proof (required before path-sensitive edits):**

```
pwd
/Users/beltrd/Desktop/projects/sentzunhat/zacatl

git rev-parse --show-toplevel
/Users/beltrd/Desktop/projects/sentzunhat/zacatl

git rev-parse --show-prefix
(empty — working at root)

git status --short
(clean or shows only intended changes)
```

---

## Options

### Option A — Recursive Deep-Path Generation

Generate path mappings for **all subdirectories** that contain an `index.ts`, recursively from `src/`.

**Mappings would include:**

```json
"@zacatl/configuration": ["./src/configuration/index.ts"],
"@zacatl/service": ["./src/service/index.ts"],
"@zacatl/service/layers": ["./src/service/layers/index.ts"],
"@zacatl/service/layers/domain": ["./src/service/layers/domain/index.ts"],
"@zacatl/service/platforms": ["./src/service/platforms/index.ts"],
```

**Trade-offs:**

- ✅ Most flexible — enables deep imports without path fallthrough
- ✅ Aligns with TypeScript's `paths` model
- ❌ More entries to maintain, possible namespace bloat
- ❌ May not match current `@zacatl/` convention (currently only top-level and some specific deep paths)

---

### Option B — Top-Level Direct Children Only (Recommended)

Generate path mappings **only for direct children** of `src/` that have an `index.ts` (e.g., `src/configuration/`, `src/dependency-injection/`).

**Mappings would include:**

```json
"@zacatl/configuration": ["./src/configuration/index.ts"],
"@zacatl/dependency-injection": ["./src/dependency-injection/index.ts"],
"@zacatl/error": ["./src/error/index.ts"],
"@zacatl/logs": ["./src/logs/index.ts"],
"@zacatl/localization": ["./src/localization/index.ts"],
"@zacatl/service": ["./src/service/index.ts"],
"@zacatl/third-party": ["./src/third-party/index.ts"],
"@zacatl/utils": ["./src/utils/index.ts"],
```

Plus maintain **hand-curated deep paths** for intentional public API surface:

```json
"@zacatl/third-party/fastify": ["./src/third-party/fastify.ts"],
"@zacatl/infrastructure": ["./src/service/layers/infrastructure/index.ts"],
"@zacatl/domain": ["./src/service/layers/domain/index.ts"],
"@zacatl/application": ["./src/service/layers/application/index.ts"],
"@zacatl/platform": ["./src/service/platforms/index.ts"],
"@zacatl/optionals": ["./src/utils/optionals.ts"],
```

**Trade-offs:**

- ✅ Keeps path count manageable
- ✅ Aligns with current package structure and public API design
- ✅ Preserves intentional curation of deep paths
- ❌ Requires manual maintenance for deep paths; only direct children are automated
- ❌ Doesn't fully address the "enable all src packages" goal for nested modules

---

### Option C — Hybrid with Configuration File

Generate **all recursive paths** but allow an EXCLUSIONS or INCLUSIONS config (like `generate-barrels.ts` uses) to filter which paths are included.

**Trade-offs:**

- ✅ Most powerful and flexible
- ✅ Single source of truth for what's exposed
- ❌ Adds configuration maintenance burden
- ❌ More complex implementation

---

## Recommended Fix

**Option chosen:** A (Recursive Deep-Path Generation)

**Rationale (per user preference):**

1. Enables all src packages and imports to be accessible via `@zacatl/*` namespace
2. Provides maximum flexibility for imports throughout the codebase
3. Scales automatically as modules are reorganized or added
4. Simplifies import paths for all consumers (no deep import restrictions)
5. Pairs naturally with automated test update workflow (TASK-003)

---

## Implementation Plan

### Phase 1: Script Creation — Generate All Paths Recursively

**File:** `scripts/dev/generate-tsconfig-paths.ts` (new)

**Responsibilities:**

1. Recursively walk `src/` directory and discover all files and folders with `index.ts`
2. Generate path mappings for:
   - **All directories with `index.ts`**: `@zacatl/<path>` → `./src/<path>/index.ts`
   - **All `.ts` files**: `@zacatl/<path>/<file>` → `./src/<path>/<file>.ts` (without extension)
3. Build a comprehensive mapping that covers every importable module
4. Update `tsconfig.base.json` paths field with all generated mappings
5. Use idempotent generation (header-based ownership like `generate-barrels.ts`)
6. Log what was generated for verification

**Output:**

- Updated `tsconfig.base.json` with comprehensive `paths` section covering all modules

**Example generated paths:**

```json
"@zacatl": ["./src/index.ts"],
"@zacatl/configuration": ["./src/configuration/index.ts"],
"@zacatl/configuration/json": ["./src/configuration/json.ts"],
"@zacatl/dependency-injection": ["./src/dependency-injection/index.ts"],
"@zacatl/service": ["./src/service/index.ts"],
"@zacatl/service/layers": ["./src/service/layers/index.ts"],
"@zacatl/service/layers/domain": ["./src/service/layers/domain/index.ts"],
"@zacatl/service/layers/domain/validator": ["./src/service/layers/domain/validator.ts"],
// ... and so on for all files
```

### Phase 2: Integration — Make Generation Available

**npm script:** Add to `package.json`:

```json
"paths:generate": "tsx scripts/dev/generate-tsconfig-paths.ts"
```

**Integration points:**

- Can be run manually during development: `npm run paths:generate`
- Optional: add to pre-commit hook or pre-build steps
- Optional: add to CI workflow for validation

### Phase 3: Verification — Test All Imports

**File:** Create verification script (or use existing test infrastructure)

**Tasks:**

1. Run `npm run type:check` to ensure TypeScript recognizes all new paths
2. Spot-check imports from various `@zacatl/*` paths in test files
3. Verify barrel files (`index.ts`) still export correctly
4. Document the new import patterns

### Phase 4: Documentation

- Update `docs/start-here.md` or relevant guideline to document:
  - How to regenerate paths (e.g., `npm run paths:generate`)
  - New full import flexibility with `@zacatl/*`
  - When to run the script (e.g., after adding new modules)

---

## Files to Change (TASK-002)

1. `scripts/dev/generate-tsconfig-paths.ts` — **new file** (recursive walker + path generator)
2. `tsconfig.base.json` — update `paths` section with all generated mappings
3. `package.json` — add `paths:generate` npm script
4. `docs/start-here.md` — document the new import flexibility

---

## Acceptance Criteria (TASK-002)

- [ ] Script recursively walks `src/` and discovers all `.ts` files and directories with `index.ts`
- [ ] Generated paths include all levels (e.g., `@zacatl/service/layers/domain`)
- [ ] Generated paths include individual files (e.g., `@zacatl/configuration/json`)
- [ ] `tsconfig.base.json` updates successfully with all generated paths
- [ ] `npm run type:check` passes (TypeScript recognizes all new paths)
- [ ] Script is idempotent: running it twice produces identical output
- [ ] `npm run paths:generate` command works as expected
- [ ] All existing tests pass after tsconfig update
- [ ] Can import from any path: `import { x } from '@zacatl/service/layers/domain'`
- [ ] Barrel exports still work correctly

---

## Related Task: TASK-003

**Title:** Update unit tests to use new @zacatl/\* import paths

**Scope:** After TASK-002 is complete, audit and update all test files to use the new recursive `@zacatl/*` paths where appropriate.

**This will be tracked in a separate work item: `.hawp/work/active/TASK-003.md`**

---

## Next Steps

1. ✅ **Plan approved** (Option A selected)
2. **Implementation:** Create `scripts/dev/generate-tsconfig-paths.ts`
3. **Test:** Verify `npm run type:check` and existing tests pass
4. **Commit:** Single commit with script, tsconfig update, and npm script
5. **Proceed to TASK-003:** Update test imports
