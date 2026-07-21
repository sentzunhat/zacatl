# Sequelize adapter write-path polish: scoping + round trips

**UUID:** `b7c92f1d` · **Type:** improvement · **Priority:** P2 · **Reported:** 2026-07-15
**Source:** AUDIT-004 (`.hawp/work/evidence/2026/07/15/AUDIT-004-security-arch-scalability-report.md`)

## Problems

`src/service/layers/infrastructure/orm/sequelize/adapter.ts:129-150`:

1. `update`/`delete` build `where: { id }` only, ignoring any additional
   scoping a consumer might expect (soft data-integrity/authz gap for
   composite-key/tenant setups). The adapter never promised composite
   scoping, so this may resolve as "document the contract."
2. `update()` re-fetches via `findById` after `model.update()`, and
   `delete()` pre-fetches before `destroy()` — an extra DB round trip per
   write.

## Plan

1. Decide: support an optional scope/filter on update/delete, or document
   that adapters scope by `id` only (align all three adapters either way).
2. For round trips: use `returning: true` where the dialect supports it
   (Postgres) with fallback to the current fetch; for `delete`, rely on the
   `destroy()` affected-row count instead of pre-fetching.
3. Extend adapter unit tests for both paths.

## Gate

plan-ready — needs the small contract decision (1) before implementation.

## Status Log

- 2026-07-15: Contract decision: all three adapters scope writes by primary
  key `id` only — now documented at the Sequelize update/delete site;
  composite/tenant scoping belongs in the consumer's repository layer.
  Round trips: `update()` uses `returning: true` on the postgres dialect
  (skips re-fetch), falls back to findById elsewhere; `delete()` pre-fetch
  is inherent to the "return the removed entity" contract and is documented.
  2 new dialect tests. Closed.
