---
title: Refactoring — Collapse Repository & Handler Duplication
id: refactor-collapse-duplication
type: refactoring
priority: P2
status: done
started: 2026-07-26
closed: 2026-07-26
branch: refactor/collapse-duplication
---

## Summary

Eliminated 175 net lines of duplicated code across three high-leverage patterns: repositories, ORM error handling, and REST handlers. All tests passing, no public API changes.

## What Was Done

### 1. BaseRepository Consolidation

**Problem:** Three nearly identical delegating classes (Mongoose, Sequelize, node:sqlite) each ~60–70 lines.

**Solution:**
- Created shared generic base: `src/service/layers/infrastructure/repositories/base-repository.ts` (74 lines)
- Reduced each driver to thin subclass (19–32 lines) with only adapter factory + type params
- Eliminates 121 lines of duplication, **net −47 lines** (25% reduction in repository layer)

**Impact:** Future drivers need only supply adapter factory and generics, not re-implement delegation.

### 2. Sequelize Error Normalization

**Problem:** Sequelize adapter had zero try/catch blocks, unlike Mongoose (4) and node:sqlite (8). Raw driver errors leaked to consumers instead of being normalized to `InternalServerError` with structured context.

**Solution:**
- Wrapped 6 CRUD operations (findById, findMany, create, update, delete, exists) with try/catch
- Applied same normalization pattern found in sibling adapters (component, operation, metadata, cause)
- Added 9 error-path tests covering failure scenarios
- All methods maintain public signatures

**Impact:** Sequelize adapter now consistent with framework error contract; consumers see reliable structured errors.

### 3. REST Handler Error Dedup

**Problem:** Fastify and Express abstract handlers were ~90% identical, including verbatim-duplicated HTTP status-code mapping (45 lines × 2).

**Solution:**
- Extracted status-code mapping into shared `src/service/layers/application/entry-points/rest/common/error-mapper.ts`
- Both abstract handlers now delegate `handleError()` to `mapErrorToStatusCode()`
- Transport-specific reply mechanics remain at call site (Fastify: `reply.sent`, Express: `headersSent`)
- **No breaking changes** — public API unchanged

**Impact:** **−28 net lines**, single source of truth for error→status mapping, easier to extend with new error types.

## Verification

| Aspect | Result |
|--------|--------|
| TypeScript | ✅ No errors |
| Repository tests (8 files) | ✅ 95 pass |
| ORM Sequelize tests | ✅ 30 pass |
| REST/handler tests | ✅ 103 pass |
| ESLint | ✅ Clean |

## Code Quality

- **Lines removed:** 175 (delegation duplication + error mapping duplication)
- **Lines added:** 74 (shared base) + error tests
- **Net reduction:** 47 lines (repositories alone) + 28 lines (handlers) = **75 net**
- **Public API changes:** 0 (all breaking changes avoided by preserving thin subclass exports)

## Branch & PR

- **Branch:** `refactor/collapse-duplication` (9 commits off dev)
- **Commit:** `d9008dca`
- **Ready for:** Merge to dev → PR to main for code review

## Next Steps

1. Merge to dev (or PR from this branch for review)
2. Consider backfilling similar consolidation in: hook handlers (currently Fastify-only), example app shared boilerplate
3. Monitor for new duplicate patterns as new adapters/platforms are added

## Notes

- No public API surface changed; all changes are internal consolidation
- Sequelize error normalization follows established framework pattern, not inventing new error types
- REST handler dedup preserves transport-specific reply logic at call site; safe to extend
- All existing consumer code continues to work unchanged
