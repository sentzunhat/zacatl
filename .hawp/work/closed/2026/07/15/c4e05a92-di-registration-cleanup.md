# Consolidate DI registration verification + container JSDoc cleanup

**UUID:** `c4e05a92` · **Type:** refactoring · **Priority:** P2 · **Reported:** 2026-07-15
**Source:** AUDIT-004 (`.hawp/work/evidence/2026/07/15/AUDIT-004-security-arch-scalability-report.md`)

## Problems

1. Registration verification is duplicated: the Application layer
   (`src/service/layers/application/application.ts:38-51`) does
   isRegistered-guarded `registerSingleton`, and the DI container
   (`src/dependency-injection/container.ts:97-129`) has overlapping
   registration checks in `resolveDependencies` — two divergent paths, no
   single source of truth. Domain/Infrastructure layers gained the same
   guard pattern in `12ff8ab5`, so there are now four inline copies.
2. `src/dependency-injection/container.ts:19-40` — orphaned JSDoc block
   duplicated verbatim at 81-96, attached to the wrong function.

## Plan

1. Add a single `ensureRegisteredSingleton(token)` helper in
   `src/dependency-injection/container.ts` and use it from Application,
   Domain, and Infrastructure layers.
2. Delete the orphaned JSDoc block.
3. Existing layer tests already cover the guard behavior; run full suite.

## Gate

plan-ready — mechanical; no behavior change intended.

## Status Log

- 2026-07-15: Added `ensureRegisteredSingleton()` to
  `src/dependency-injection/container.ts` as the single guard; Application,
  Domain, and Infrastructure layers now call it (4 inline copies removed).
  Deleted the orphaned/duplicated JSDoc block and fixed the
  `resolveDependencies` docblock, which wrongly claimed auto-registration
  (the code throws for unregistered classes). Full suite green (623). Closed.
