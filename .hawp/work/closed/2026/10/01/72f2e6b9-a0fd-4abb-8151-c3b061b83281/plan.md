# 72f2e6b9 — node:sqlite without sqlite3, barrel polyfill and Fastify double-send fixes

**UUID:** `72f2e6b9-a0fd-4abb-8151-c3b061b83281` · **Legacy ID:** `RUNTIME-FIX-001` · **Type:** bug · **Closed:** 2026-10-01 · **Released:** 0.0.62

Closed-record index added 2026-10-15 by `ac0c4acf` so the backlog row links to
a closed record. The original work was tracked in the release PR and its
evidence; no separate plan file was kept at the time.

## Outcome

Shipped in 0.0.62 via PR #115 (merged to `main` through #116): optional-peer
import fixes so `node:sqlite` works without `sqlite3`, barrel polyfill fix,
Fastify double-send fix, production audit fixes, `check:optional-peers`, and a
badge script fix.

## Verification

See [release 0.0.62 evidence](../../../../../evidence/2026/10/01/release-0.0.62-evidence.md):
npm `0.0.62` published with SLSA provenance, `v0.0.62` tag, release workflow,
GitHub Release, and `main` CI (dry-run + Docker smoke) all successful.

## Close Checklist

- [x] Outcome recorded
- [x] Verification linked to release evidence
- [x] Backlog row links to this record
