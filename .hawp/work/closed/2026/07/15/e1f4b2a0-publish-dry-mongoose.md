# Fix publish-dry packaged-consumer failure: cannot resolve "mongoose"

**UUID:** `e1f4b2a0` · **Type:** bugfix · **Priority:** P1 (release blocker) · **Reported:** 2026-07-15
**Source:** CI run 29432457908 (`Publish (dry-run)` on dev, 2026-07-15)

## Problem

The publish verification chain fails in CI with:

```
Error: Could not resolve "mongoose" imported by "@sentzunhat/zacatl".
```

The packaged-consumer smoke step resolves the built package's imports, and
`mongoose` (an optional peer dependency) is not installed in that
environment. The same `publish:ci` chain runs in `release.yml`, so **the
first real release from main will fail the same way** until this is fixed.

## Investigation notes

- Confirm which step emits this (vitest "Unhandled Error" formatting suggests
  a test-runner-driven smoke test over the staged `publish/` output).
- Likely fixes: install optional peers in the smoke environment, mark the
  vendor subpath imports as external in the smoke resolution, or make the
  smoke test skip vendor entrypoints whose peer isn't installed (mirroring
  the library's own optional-peer behavior).

## Gate

analyzing — reproduce locally with `npm run publish:ci` (dry) first.

## Status Log

- 2026-07-15: Root cause confirmed — mongoose/mongodb/pg/sqlite3 are
  optional peerDependencies, which `npm ci` does not install; local runs
  only worked from leftover installs. Fix: added all four optional peers to
  devDependencies (same ranges). Verified with a clean `rm -rf node_modules
  && npm ci` + full test suite (618 pass) + type:check + prepublish:guard.
  Closed.
