# Work Intake — Plan

## Bug / Task: Fix repository lifecycle typing and node:sqlite adapter type errors

**Backlog ID:** TASK-001
**Type:** improvement
**Reported:** 2026-06-08
**Risk Level:** medium

---

### Input (what was reported)

> what are some improvements to do to fix the type errors or typescript errors please read them audit think and plan a fix, like for example the repo not matching the interface we can make a public initialize function instead of model function for the abstracts and do we need is ready function can't we do if the token is there register from the get container

---

### Context

TypeScript fails in repository abstractions and tests because the shared repository contract currently inherits adapter lifecycle members. The current node:sqlite adapter also trips strict TS4111 property-access checks while validating the DI-resolved database instance.

---

### Analysis

**Root cause (or most likely cause):**
`src/service/layers/infrastructure/repositories/types.ts` makes `RepositoryPort` extend `ORMPort`, which requires `initialize()` and optionally exposes `isReady()`. That couples adapter lifecycle concerns to every repository implementation, including provider-specific abstract repositories and test doubles that only need CRUD methods. Separately, `src/service/layers/infrastructure/orm/nodesqlite/adapter.ts` validates a widened object using dot-property access (`prepare`, `exec`), which violates `noPropertyAccessFromIndexSignature` under strict settings.

**Directly verified:**

- `npm run type:check` fails in `src/service/layers/infrastructure/repositories/mongoose/repository.ts`, `src/service/layers/infrastructure/repositories/nodesqlite/repository.ts`, and `src/service/layers/infrastructure/repositories/sequelize/repository.ts` because `initialize` is missing.
- `npm run type:check` also fails in `test/unit/dependency-injection/auto-registration.test.ts` and `test/unit/service/layers/infrastructure/infrastructure.test.ts` for the same contract reason on dummy repositories.
- `src/service/layers/infrastructure/repositories/mongoose/repository.ts`, `src/service/layers/infrastructure/repositories/nodesqlite/repository.ts`, and `src/service/layers/infrastructure/repositories/sequelize/repository.ts` currently expose `initializeModel()` instead of `initialize()`.
- `src/service/layers/infrastructure/orm/nodesqlite/adapter.ts` currently checks `prepare` and `exec` on a `Record<string, unknown>` using dot access, which matches the TS4111 compiler output.

**Inferred (not yet proven):**

- The current `isReady()` addition was introduced to support eager constructor initialization without throwing before ORM tokens are registered.
- The cleanest long-term design is to keep lifecycle behavior on adapters or a dedicated lifecycle interface rather than the public repository contract.

**Scope — what else is affected:**

- `src/service/layers/infrastructure/repositories/types.ts`
- `src/service/layers/infrastructure/repositories/abstract.ts`
- `src/service/layers/infrastructure/repositories/mongoose/repository.ts`
- `src/service/layers/infrastructure/repositories/nodesqlite/repository.ts`
- `src/service/layers/infrastructure/repositories/sequelize/repository.ts`
- `src/service/layers/infrastructure/orm/nodesqlite/adapter.ts`
- `src/service/layers/infrastructure/orm/mongoose/adapter.ts`
- `src/service/layers/infrastructure/orm/sequelize/adapter.ts`
- `src/service/layers/infrastructure/types/index.ts`
- `test/unit/dependency-injection/auto-registration.test.ts`
- `test/unit/service/layers/infrastructure/infrastructure.test.ts`

---

### Work Coordination

**Owner:** agent
**Implementation status:** not-started
**Overlapping files:**

- `src/service/layers/infrastructure/repositories/types.ts`
- `src/service/layers/infrastructure/repositories/abstract.ts`
- `src/service/layers/infrastructure/repositories/mongoose/repository.ts`
- `src/service/layers/infrastructure/repositories/nodesqlite/repository.ts`
- `src/service/layers/infrastructure/repositories/sequelize/repository.ts`
- `src/service/layers/infrastructure/orm/nodesqlite/adapter.ts`
- `test/unit/dependency-injection/auto-registration.test.ts`
- `test/unit/service/layers/infrastructure/infrastructure.test.ts`

**Parallel work risk:** medium
**Can implement now:** only after approval

**Coordination note:**
The working tree already contains overlapping in-progress changes in the repository and ORM adapter files, so contract changes should be made as a single coherent pass instead of piecemeal edits.

**Path discipline:**

- Use exact repo-relative paths from repository root for all files in this plan.
- Basenames alone are unsafe for path-sensitive work unless the file is truly at repository root and explicitly marked as such.

**Repo-root proof (required before path-sensitive edits):**

```bash
pwd
<repo-root-abs>

git rev-parse --show-toplevel
<repo-root-abs>

git rev-parse --show-prefix


git status --short
 M docs/service/infrastructure-usage.md
 M docs/third-party/orm/overview.md
 M src/service/layers/infrastructure/orm/mongoose/adapter-loader.ts
 M src/service/layers/infrastructure/orm/mongoose/adapter.ts
 M src/service/layers/infrastructure/orm/nodesqlite/adapter-loader.ts
 M src/service/layers/infrastructure/orm/nodesqlite/adapter.ts
 M src/service/layers/infrastructure/orm/sequelize/adapter-loader.ts
 M src/service/layers/infrastructure/orm/sequelize/adapter.ts
 M src/service/layers/infrastructure/repositories/abstract.ts
 M src/service/layers/infrastructure/repositories/mongoose/repository.ts
 M src/service/layers/infrastructure/repositories/nodesqlite/repository.ts
 M src/service/layers/infrastructure/repositories/sequelize/repository.ts
 M src/service/layers/infrastructure/repositories/types.ts
 M src/third-party/mongoose.ts
 M src/third-party/sequelize.ts
 M test/unit/service/layers/infrastructure/repositories/abstract-nodesqlite.test.ts
```

---

### Options

#### Option A — Split lifecycle from `RepositoryPort`

Keep `ORMPort` as the adapter contract, but remove `RepositoryPort extends ORMPort`. Define `RepositoryPort` with only `model`, `toLean`, and CRUD methods. Add a dedicated lifecycle shape such as `InitializablePort` or keep `initialize()` internal to adapters and repository base classes. This fixes the current compiler failures at the right abstraction layer and stops forcing dummy repositories to implement ORM bootstrapping.

#### Option B — Make `initialize()` part of every repository

Keep the inheritance chain and add `public async initialize(): Promise<void>` to `BaseRepository`, the three provider-specific abstract repositories, and every test repository double. This is lower churn in the contract file but leaks adapter lifecycle concerns into every repository implementation and test stub.

---

### Recommended Fix

**Option chosen:** A
**Rationale:**

The current errors are a design smell, not just a missing-method issue. Repositories and test doubles should satisfy the public repository contract without exposing adapter lifecycle concerns. `initialize()` can still exist on `BaseRepository` and provider-specific abstract repositories, but it should not be required by `RepositoryPort`. `isReady()` is also better kept out of the public repository contract; if eager constructor initialization remains, the readiness check should live in adapters or be done via `getContainer().isRegistered(...)` inside the relevant repository/adapter implementation.

**Files to change:**

- `src/service/layers/infrastructure/repositories/types.ts` — decouple `RepositoryPort` from `ORMPort`; define repository-only contract.
- `src/service/layers/infrastructure/types/index.ts` — ensure infrastructure registration types reference the narrowed repository contract.
- `src/service/layers/infrastructure/repositories/abstract.ts` — keep public `initialize()` and `initializeModel()` as concrete class APIs, not interface requirements.
- `src/service/layers/infrastructure/repositories/mongoose/repository.ts` — align wrapper API with the narrowed repository contract.
- `src/service/layers/infrastructure/repositories/nodesqlite/repository.ts` — align wrapper API with the narrowed repository contract.
- `src/service/layers/infrastructure/repositories/sequelize/repository.ts` — align wrapper API with the narrowed repository contract.
- `src/service/layers/infrastructure/orm/nodesqlite/adapter.ts` — replace dot access on widened object checks with bracket access or a typed guard.
- `test/unit/dependency-injection/auto-registration.test.ts` — remove unnecessary lifecycle burden from dummy repositories once the contract is narrowed.
- `test/unit/service/layers/infrastructure/infrastructure.test.ts` — same as above.

**What to verify after:**

- [ ] `npm run type:check` passes.
- [ ] `npx vitest run test/unit/service/layers/infrastructure/repositories/abstract-nodesqlite.test.ts` passes.
- [ ] `npx vitest run test/unit/dependency-injection/auto-registration.test.ts test/unit/service/layers/infrastructure/infrastructure.test.ts` passes.

---

### Implementation Notes

- Prefer a minimal contract split rather than introducing another public method just to satisfy the compiler.
- If constructor eager initialization stays, avoid requiring `isReady()` on the public `ORMPort` unless every adapter truly participates in that lifecycle. A narrower internal helper type or direct `getContainer().isRegistered(...)` checks in each adapter is cleaner.
- Preserve existing `initializeModel()` entrypoints for startup hooks so docs and runtime semantics stay stable unless a follow-up API cleanup is intentional.

---

## Outcome (filled at close)

_Not started._

---

## Verification (filled at close)

- [ ] Claim 1 — NOT YET VERIFIED (implementation not started)

---

## Close Checklist

**Before marking this task done in BACKLOG.md, verify ALL:**

- [ ] Outcome section filled (what was actually implemented)
- [ ] Verification section filled (all checks listed, each with direct evidence or "unproven" tag)
- [ ] All evidence files referenced exist in `../evidence/YYYY/MM/DD/` or are noted as inline
- [ ] Plan file will be moved to `../closed/YYYY/MM/DD/TASK-001.md`
- [ ] BACKLOG.md row moved from Active to Recently Closed (or marked done)
- [ ] Status report written (optional: only if non-trivial OR if something remains unproven OR if a decision/pattern emerged)
- [ ] Decision file created if applicable (only if this task resolves a design question)
- [ ] Staged-path proof captured before commit:
  - [ ] `git diff --name-status`
  - [ ] `git diff --check`
  - [ ] `git diff --cached --name-status`
  - [ ] `git diff --cached --check`
  - [ ] `git status --short`
- [ ] If basename-only paths appeared during path-sensitive work, mark report unsafe and restart after correction (fresh path-locked pass after two failures)

**Status:**

- [x] Plan written
- [ ] Approved / auto-approved (low risk)
- [ ] Implemented
- [ ] Verified
- [ ] Closed
