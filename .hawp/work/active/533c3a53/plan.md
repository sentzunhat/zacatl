# Replace obsolete public API compatibility shims with canonical contracts

**UUID:** `533c3a53-a7f2-43a2-8e7d-e586be8d2bd6`
**Type:** refactoring
**Reported:** 2026-10-20

## Input (verbatim)

> We don't need any backwards compatibility on the small patch versions before
> 0.1.0. Review the public work and legacy code, refactor to the canonical way
> going forward, and document the compatibility policy.

## Intake summary

Audit Zacatl's public exports and internal compatibility paths that preserve
older Zacatl `0.0.x` APIs. Define the canonical public contracts and remove
obsolete fallbacks in one reviewable implementation commit on PR #138, as
explicitly approved by the owner on 2026-10-20.

## Confirmed evidence

- `src/service/layers/infrastructure/orm/tokens/factory.ts` exports both
  `createDatabaseToken` and `createLegacyDatabaseToken`.
- The Sequelize, Mongoose, and Node SQLite ORM adapters try the canonical
  token first and then resolve the legacy token.
- `src/service/platforms/server/database/orm-instance.ts` registers a legacy
  token alias alongside the canonical token.
- `src/service/tokens.ts` describes its root token exports as backwards
  compatible re-exports.
- `docs/service/README.md` and `docs/service/architecture.md` describe a
  global fallback for direct/manual adapter construction.

## Decision and boundary

Before `0.1.0`, Zacatl does not promise compatibility with earlier `0.0.x`
APIs. The canonical token and public extension contracts must be identified
before deleting shims. Do not remove runtime or dependency interoperability
that is part of the intended canonical behavior without evidence and a
separate decision.

Before `0.1.0`, published `0.0.x` patch increments may include breaking API
changes, new features, fixes, documentation, and other improvements. The
minor-bump rule for breaking changes starts at `0.1.0`. Keep this integration
PR at its current development target; release sequencing remains a separate
owner decision.

## Small changes

1. Inventory package exports, published types, token registrations, direct
   construction paths, and first-party consumers. Classify each compatibility
   path as obsolete Zacatl API support, canonical behavior, or unresolved.
2. Confirm the canonical token source and construction scopes. Update the
   three ORM adapters and registration path to use that contract only.
3. Remove obsolete token factories, aliases, re-exports, overloads, and
   fallback branches in focused subsystem changes, retaining only behavior
   explicitly selected as canonical.
4. Update API guides, examples, changelog/migration notes, version guidance,
   and generated path mappings wherever public contracts change.
5. Verify emitted declarations and package exports, focused tests, examples
   using the changed contracts, and the full CI matrix before integration.

## Acceptance

- A reviewed inventory identifies all observed public compatibility shims and
  records whether each is removed, retained as canonical behavior, or deferred.
- The ORM adapters and database registration use only the canonical token
  path; old symbol aliases and fallback are removed.
- Public API changes have clear migration notes and align with the documented
  pre-0.1.0 policy.
- Package exports, emitted types, examples, and CI pass on the final head.
- The full repo-scope search classifies remaining `legacy` or compatibility
  references as historical notes, dependency/runtime interoperability, or
  intentional current behavior; no earlier Zacatl API shim remains in active
  source or current API guidance.

## Dependencies and gate

Use the current Service/Layers/Platforms contracts as the starting point.
Coordinate architecture boundary questions with HAWP item `19965b11` and
database ownership changes with `bfea146e`. Keep the separate `src/` root
organization item `b0649873` plan-ready; this cleanup does not move that tree.

## Implementation evidence (2026-10-20)

- Removed `createLegacyDatabaseToken`, ORM legacy token modules and subpath
  exports, adapter fallback lookups, and the `db:<vendor>:<key>` registration
  alias. ORM consumers now use `createDatabaseToken`.
- Removed the `service/tokens` compatibility barrel and `LeanWithMeta` alias;
  migrated first-party tests and consumer smoke fixtures to owner modules and
  `LeanDocument`.
- Updated current migration/changelog guidance and the Git workflow version
  policy. Before `0.1.0`, breaking changes and improvements may ship in the
  next `0.0.x` patch; starting at `0.1.0`, pre-1.0 breaking changes use minor
  increments.
- Updated README and changelog test totals to the verified 85 files / 738
  tests. Repository examples now import repository and ORM types from their
  actual package export paths.
- Retained direct construction, standalone Layers/global ORM lookup, manual
  Mongoose index registry, optional page raw-server access, and
  runtime/dependency interoperability because these are current canonical
  behavior rather than earlier Zacatl API shims.
- Verification: build/declarations, 85 test files (738 tests),
  `npm run type:check`, `npm run lint:silent`, `npm run smoke:consumers`, and
  `git diff --check` passed. Consumer smoke output included the known nested
  Sequelize `uuid` audit notice.
- The first pushed implementation head passed all 12 CI checks. Copilot's
  follow-up review found the test-count mismatch corrected above. The separate
  lifecycle item `f1080c66` remains active for partial connection cleanup and
  restart behavior; that finding is outside this API-shim cleanup.
- The amended head `ded9cb553bbbaabeb33b698772a85f8fa3da2958` passed all 12
  CI checks in run `39441219688`. The changelog names this as the preceding
  verified implementation revision; CI and Copilot review are pending for the
  latest amended head.
- Follow-up documentation audit: corrected ORM repository examples to use the
  vendor-specific wrappers, repaired package subpath imports and database
  config snippets, removed obsolete `IRepository` examples, aligned Service/
  Layers/Platforms ownership guidance, and corrected the integration/release
  sequencing in the changelog. `docs/skills/version-updates.md` now clearly
  distinguishes the `0.0.x` development policy from `0.1.0` onward.
- The repository and version documentation now directly address the two
  Copilot wrapper-import findings currently open on PR #138. HAWP kit
  validation passed (3 checks), local Markdown links passed (212 files), and
  `git diff --check` passed. No tests were rerun for this documentation-only
  follow-up; CI for the pending documentation commit remains to be checked.
- `hawp work validate` reports backlog consistency, evidence integrity,
  verification clarity, and dead links passing; its overall failure is the
  previously observed set of historical closed-record completeness gaps and
  legacy untyped records. Those unrelated historical records were not changed.
- At the remote PR head `7209c1bf13b1cfb51b48d11e1972d89035f58832`, GitHub
  reports all 12 checks passed. The documentation follow-up has not yet been
  committed or pushed, so that CI result does not cover it.

**Status:** implementation is committed and pushed as one commit; the local
documentation follow-up needs a final review, commit, push, and current-head CI
and Copilot re-review before this item can close.
