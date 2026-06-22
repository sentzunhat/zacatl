# Task: Update unit tests to use new @zacatl/\* import paths

**Backlog ID:** TASK-003
**Type:** improvement
**Reported:** 2026-06-18
**Risk Level:** medium
**Depends on:** TASK-002 (must complete first)

---

## Input (what was reported)

After TASK-002 completes and all recursive `@zacatl/*` paths are available, audit all unit test files and update their imports to use the new full import paths (e.g., `import { x } from '@zacatl/service/layers/domain'` instead of relative imports or partial paths).

---

## Context

Currently, test files in `test/unit/` likely use:

- Relative imports: `import { x } from '../../../src/service/layers/domain'`
- Partial/limited tsconfig paths
- Mix of import styles across the codebase

After TASK-002, all modules will have dedicated `@zacatl/*` paths, enabling:

- Cleaner, more consistent test imports
- Easier refactoring (moving files doesn't break relative paths)
- Better readability of test dependencies

---

## Analysis

### Root cause (or most likely cause):

Current test imports use relative paths because limited tsconfig paths were available. Once full recursive paths exist (TASK-002), tests should be standardized to use them.

### Directly verified:

- Test directory: `test/` contains unit tests
- Current tsconfig.json extends `tsconfig.base.json`
- Test tsconfig defined in `test/tsconfig.json`

### Inferred (not yet proven):

- How many test files need updating (will discover during implementation)
- Current import patterns in test files (will assess during audit)
- Whether all imports can be converted or some must remain relative (file structure may vary)

### Scope — what else is affected:

- All test files in `test/unit/**/*.ts`
- Possibly `test/setup.ts`
- May affect future test writes (process should be documented)

---

## Work Coordination

**Owner:** agent
**Implementation status:** not-started (blocked until TASK-002 completes)
**Overlapping files:**

- `test/**/*.ts` — target of bulk import updates

**Parallel work risk:** medium (should not run in parallel with TASK-002; must run after)
**Can implement now:** no (depends on TASK-002 completion)

---

## Options

### Option A — Manual Audit + Automated Replace

1. Audit all test files to identify relative imports
2. Document patterns found
3. Use automated search/replace to convert patterns to new `@zacatl/*` paths
4. Manual verification per file

**Trade-offs:**

- ✅ Gives visibility into import patterns
- ✅ Allows for exceptions/edge cases
- ❌ Slower than full automation
- ❌ Risk of missed files

---

### Option B — Automated Regex Refactoring

Use regex patterns to automatically convert relative imports to `@zacatl/*` paths across all test files at once.

**Pattern mapping:**

- `../../../src/service/layers/domain` → `@zacatl/service/layers/domain`
- `../../../src/configuration` → `@zacatl/configuration`
- etc.

**Trade-offs:**

- ✅ Fast, consistent conversion
- ✅ Low manual effort
- ❌ May miss edge cases
- ❌ Requires careful regex validation

---

### Option C — Hybrid: Lint Rule + IDE Refactoring

1. Add ESLint rule to flag relative imports from `src/`
2. Use IDE codemod/refactoring tool to convert in batches
3. Verify and commit

**Trade-offs:**

- ✅ Most precise (IDE understands structure)
- ✅ Can apply incrementally
- ❌ More manual steps
- ❌ Slower than regex approach

---

## Recommended Fix

**Option chosen:** B (Automated Regex Refactoring)

**Rationale:**

1. Test files follow consistent structure (`test/unit/*/something.test.ts`)
2. Relative paths are predictable and consistent
3. Automated conversion scales well across many files
4. Can be safely verified with `npm run test` and type checking
5. Results can be spot-checked before committing

---

## Implementation Plan

### Phase 1: Discovery — Audit Current Imports

**Tasks:**

1. Search all test files for relative imports: `grep -r "from.*\.\." test/`
2. Document import patterns found (e.g., how many levels deep are paths?)
3. List all source modules that tests import from
4. Identify any deep file imports (not just index.ts barrels)

**Output:**

- Report of import patterns
- Mapping of relative paths to new `@zacatl/*` paths

### Phase 2: Conversion — Update Imports

**Method:** Use regex replace across all test files

**Patterns to replace:**

```
# Example patterns (to be refined based on Phase 1 discovery)
from ['"]\.\.\/\.\.\/\.\.\/src\/(.*)['"]
→ from '@zacatl/$1'

from ['"]\.\.\/\.\.\/src\/(.*)['"]
→ from '@zacatl/$1'

# And so on for varying depths
```

**Files to update:**

- `test/unit/**/*.ts` (all test files)
- `test/setup.ts` (if it imports from src/)

### Phase 3: Validation — Ensure Tests Still Pass

**Tasks:**

1. Run `npm run type:check` to verify TypeScript recognizes all new import paths
2. Run `npm run test` to ensure all tests pass
3. Run `npm run lint` to check code style compliance
4. Spot-check a few test files to verify imports look clean

**Success criteria:**

- All tests pass ✅
- Type checking passes ✅
- No linting errors ✅
- Imports are consistent ✅

### Phase 4: Documentation

- Update `docs/start-here.md` or `docs/guidelines/code-style.md` to document:
  - Test import conventions: use `@zacatl/*` paths
  - When and how to use barrel imports vs. deep imports
  - Examples of recommended import styles

---

## Files to Change (TASK-003)

1. `test/unit/**/*.ts` — update all relative imports to `@zacatl/*` paths
2. `test/setup.ts` — update imports if present
3. `docs/start-here.md` or `docs/guidelines/code-style.md` — document test import conventions

---

## Acceptance Criteria

- [ ] All relative imports in test files converted to `@zacatl/*` paths
- [ ] `npm run type:check` passes (no type errors)
- [ ] `npm run test` passes (all tests run successfully)
- [ ] `npm run lint` passes (no linting errors)
- [ ] Import statements are consistent and readable
- [ ] Documentation updated with test import guidelines
- [ ] Test coverage remains unchanged (same tests, just different imports)
- [ ] No hard-coded relative imports remain in test files

---

## Workflow

**TASK-002 → TASK-003 (sequential):**

1. Complete TASK-002: Generate tsconfig paths and update `tsconfig.base.json`
2. Verify `npm run type:check` passes with new paths
3. Begin TASK-003: Audit and convert test imports
4. Run full test suite and verify both tasks together
5. Single commit encompassing both tasks: "automate tsconfig paths and update test imports"

---

## Related Task

**Predecessor:** TASK-002 (Automate tsconfig path generation for @zacatl/\* package imports)

---

## Next Steps

1. Wait for TASK-002 to complete
2. Begin Phase 1 discovery to audit current import patterns
3. Execute Phase 2 automated conversion
4. Validate with full test suite
5. Close task once all acceptance criteria met
