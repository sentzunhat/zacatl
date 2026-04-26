# Pre-0.0.56 production readiness audit (branch review)

**Backlog ID:** AUDIT-002  
**Type:** audit  
**Reported:** 2026-06-23  
**Risk Level:** high  

---

## Input

Review branch `another-update-branch-work`, audit changes for scalability/modularity/simplicity, align version/changelog with npm reality (latest published `0.0.55`), and identify fixes needed before a production-ready microservice release with database, locale, and error handling.

## Context

- Prior audit `AUDIT-001` (2026-06-20) found failing release gates; many STAB items followed and several are now closed.
- Branch is ~43 commits ahead of `main` with large refactors: ORM adapter unification, barrel pruning, Node 26 / TypeScript 6, third-party path nesting, script TypeScript migration.
- npm registry latest: `@sentzunhat/zacatl@0.0.55`. Working tree version: **`0.0.56`** (corrected from erroneous `0.0.57` bump — npm latest is still `0.0.55`, so next release is `0.0.56`).

## Mission

Produce an evidence-backed audit of current branch quality and a prioritized gap list for a production-usable `0.0.56+` release covering publish safety, DB layer, localization, and HTTP error handling.

## Constraints

- Separate direct evidence from inference.
- Do not revert unrelated in-progress work.
- Do not treat HAWP as a runtime validator.
- Prefer repository-local verification under Node 26.3.0.

## Output

- Status report: `.hawp/work/status/2026/06/23/AUDIT-002-pre-056-production-readiness.md`
- Backlog row in `.hawp/work/BACKLOG.md`

---

## Direct verification (2026-06-23)

Repo-root proof: clean working tree except audit artifacts; Node `v26.3.0`, npm `11.17.0`.

| Check | Result |
| ----- | ------ |
| `npm run type:check` | Pass |
| `npm run lint:silent` | Pass |
| `npm test` | Pass — 496 tests |
| `npm run prepublish:guard` | Pass — aligned at `0.0.56`, not yet on npm |
| `npm view @sentzunhat/zacatl version` | `0.0.55` |
| Clean build + export path audit | **9 stale `package.json` export targets** until `npm run local:exports` |

## Findings summary

### Confirmed strengths

- Layered service composition remains clear; ORM adapters and repositories are more uniform (Mongoose, Sequelize, node:sqlite).
- Release gates that failed in AUDIT-001 now pass on Node 26.
- Localization core supports built-in + discovered locale directories; `Service` initializes i18n at construction.
- Structured `CustomError` types with correlation IDs exist; route handlers map Zacatl errors to HTTP status codes.

### P0 — block publish (resolved 2026-06-23)

1. **Export map drift** — Resolved: `local:exports` wired into `postbuild`; 147 nested third-party export targets, 0 missing after build.
2. **Breaking import path changes** — Documented in `docs/changelog.md` (0.0.56) and `docs/third-party/single-import.md`; flat compatibility shims removed (Option B).
3. **Version/release strategy** — Consolidated into single **`0.0.56`** pending release (merged former 0.0.56/0.0.57 split); npm remains at `0.0.55`.

### P1 — production microservice gaps

4. **No graceful shutdown** — `Service` exposes `start()` only; no `stop()` wiring for HTTP close + DB disconnect.
5. **Database disconnect stubs** — Mongoose/Sequelize/SQLite adapter `disconnect()` methods are empty; `DatabaseServer.disconnect()` calls them but they no-op.
6. **Error observability gap** — HTTP `handleError()` returns `{ message }` only; `CustomError.correlationId` is not surfaced in API responses or logs by default.
7. **Request context not wired** — `requestContext` exists but platform adapters do not populate it per request; correlation between logs and errors is manual.
8. **Duplicate Express adapter sources** — `api/express-adapter.ts` (legacy) vs `api/adapters/express.ts` (used by `Server`); increases maintenance surface.
9. **CI toolchain drift** — `.github/workflows/cve-scan.yml` uses Node `24.14.0`; package engines require `>=26.3.0` (STAB-001 still plan-ready).

### P2 — follow-through

10. Nine STAB/TASK plan-ready items remain (examples/Docker, ESLint hierarchy, dependency optionalization, etc.).
11. Example smoke matrix not run in this audit.
12. Changelog "Pending release" status on multiple versions should be normalized before publish.

## Recommended work order

1. Export sync automation + breaking-change changelog for third-party paths (P0).
2. Publish dry-run smoke: ESM/CJS root import, nested third-party import, Fastify service with SQLite (P0).
3. Graceful shutdown + real DB disconnect (P1).
4. Error response contract: optional `correlationId`, wire `requestContext` in adapters (P1).
5. Remove or deprecate legacy adapter files; align docs (P1).
6. Close STAB-001 (CI Node 26) and remaining plan-ready stabilization items (P2).

## Status

Implementation tranche complete for publish/export/examples alignment. Verification evidence below.

## Implementation completed (2026-06-23)

- Added third-party compatibility shims (`mongoose.ts`, `sequelize.ts`, `sqlite3.ts`, `tsyringe.ts`, `reflect-metadata.ts`).
- Wired `npm run local:exports` into `postbuild` so `package.json` exports stay aligned with build output.
- Added `scripts/publish/export-policy.ts` — skips nested index barrels from exports (152 exports vs 192); publish tarball prunes to 21 entrance index files.
- Exported `SequelizeRepository` / `MongooseRepository` aliases from leaf repository modules for barrel-free imports.
- Standardized all examples to `@zacatl/*` imports and unified root `tsconfig.json` path mappings.
- Added `examples/shared/zacatl-build-paths.json` and `zacatl-src-paths.json` templates.

## Verification (2026-06-23)

| Check | Result |
| ----- | ------ |
| `npm run type:check` | Pass |
| `npm run lint:silent` | Pass |
| `npm test` | Pass — 496 tests |
| `npm run publish:dry:ci` | Pass — `@sentzunhat/zacatl@0.0.56` dry-run |
| Publish export targets | 152 exports, 0 missing |
| Publish index files | 21 (root + module entrances only) |
| Example typecheck | Pass — `fastify-sqlite-react/apps/backend` |

## Version correction (2026-06-23)

npm latest is `0.0.55`; `0.0.56` was never published. Corrected `package.json`, changelog, and docs from erroneous `0.0.57` to **`0.0.56`**, consolidating all unreleased breaking changes into a single pending release entry.
