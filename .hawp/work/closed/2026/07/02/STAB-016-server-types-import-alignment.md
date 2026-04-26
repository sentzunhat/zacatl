## STAB-016 — Align server test imports with the `types` barrel
Priority: P2
Status: done
Scope: `test/unit/service/service.test.ts`, `test/unit/service/platforms/server/page/page-server.test.ts`, `test/unit/service/platforms/server/server.test.ts`
Why it matters:
The server test suite was still importing `ServerType`, `ServerVendor`, and `DatabaseVendor` from the removed file-level `server-config` path in a few places. That keeps the test surface coupled to an internal file and can hide export regressions.
Direct evidence:
- `rg -n "server/types/server-config|service/platforms/server/types/server-config" test src examples` still found stale imports in two files before the cleanup.
- `publish:dry:ci` completed successfully after the import surface was corrected.
Closed:
- 2026-07-02: verified on Node 26.3.0 with `npm run publish:dry:ci`.
Risk:
Low. This is a test-only path correction with no runtime behavior change.
Dependencies/overlap:
Overlaps with ongoing barrel-prune work in `src/service/platforms/server/types`. Keep it separate from any further source refactors.
Smallest safe change:
Switch the remaining test imports to `src/service/platforms/server/types`.
Validation:
- `PATH=... npm run type:check:test`
- `PATH=... npm run publish:dry:ci`
Acceptance criteria:
- No remaining `server/types/server-config` imports in `test/`.
- Test suite and publish dry-run both pass on Node 24.
Commit boundary:
One small test-only commit, independent from source pruning commits.
