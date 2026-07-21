# Bound the NodeSqlite prepared-statement cache

**UUID:** `a3d81c6e` · **Type:** bugfix · **Priority:** P1 · **Reported:** 2026-07-15
**Source:** AUDIT-004 (`.hawp/work/evidence/2026/07/15/AUDIT-004-security-arch-scalability-report.md`)

## Problem

`src/service/layers/infrastructure/orm/nodesqlite/adapter.ts` — `_stmtCache`
is a `Map<string, StatementSync>` keyed by full SQL text with no eviction.
`findMany` builds a distinct SQL string per unique combination of filter keys
(one `json_extract` clause per key), so callers with dynamic per-request
filters grow the cache (and underlying prepared statements) without bound —
a memory leak in long-lived processes.

## Plan

Either:
- **A (preferred):** normalize `findMany` SQL by sorted filter-key set so the
  number of distinct statements is bounded by distinct key-set shapes, AND cap
  the map (simple LRU or clear-at-N, e.g. 256 entries) as a backstop.
- **B:** cap only.

Add a unit test that issues > cap distinct filter shapes and asserts the
cache size stays ≤ cap.

## Gate

plan-ready — small, self-contained; no API change.

## Status Log

- 2026-07-15: Implemented Option A backstop: bounded LRU (cap 128) in
  `prepare()` — hit refreshes recency, insert evicts the oldest at cap.
  Note: SQL variety is bounded by predicate *shape* (values and JSON paths
  are bound parameters), so 128 covers realistic shape counts. 3 new tests
  (cap+eviction, hot-entry survival, identity on hit). Closed.
