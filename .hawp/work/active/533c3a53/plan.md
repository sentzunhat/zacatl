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
obsolete fallbacks in small, reviewable changes. This work is separate from
PR #138 and is not implementation approval.

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

## Small changes

1. Inventory package exports, published types, token registrations, direct
   construction paths, and first-party consumers. Classify each compatibility
   path as obsolete Zacatl API support, canonical behavior, or unresolved.
2. Confirm the canonical token source and construction scopes. Update the
   three ORM adapters and registration path to use that contract only.
3. Remove obsolete token factories, aliases, re-exports, overloads, and
   fallback branches in focused subsystem changes, retaining only behavior
   explicitly selected as canonical.
4. Update API guides, examples, changelog/migration notes, and the version
   policy wherever the public contract changes.
5. Verify emitted declarations and package exports, focused tests, all examples
   that use the changed contracts, and the full CI matrix before release.

## Acceptance

- A reviewed inventory identifies all observed public compatibility shims and
  records whether each is removed, retained as canonical behavior, or deferred.
- The ORM adapters and database registration use only the selected canonical
  token path; legacy symbol fallback is removed if not selected as canonical.
- Public API changes have clear migration notes and align with the documented
  pre-0.1.0 policy.
- Package exports, emitted types, examples, and CI pass on the final head.
- No change is made to PR #138's accepted contract without updating its review
  thread and migration documentation.

## Dependencies and gate

Use the stabilized `0.0.65` Service/Layers/Platforms contracts as the starting
point. Coordinate architecture boundary questions with HAWP item `19965b11`
and database ownership changes with `bfea146e`. Review the inventory before
implementation.

**Status:** plan-ready for owner review; implementation deferred.
