# Status Report — AUDIT-002

## Intent

Determine whether branch `another-update-branch-work` is ready for a production-usable npm release after `0.0.55`, with focus on modularity, publish safety, database layer, localization, and error handling.

## Current State

**Likely** ready for a stabilization release candidate after P0 publish fixes; **not** fully production-microservice-ready until P1 lifecycle and observability gaps are addressed.

Release gates pass on Node 26.3.0. The largest remaining risk is **published API surface drift** (exports vs build output) and **undocumented breaking import-path changes**.

## What Was Inspected

- Branch: `another-update-branch-work` (~43 commits ahead of `main`)
- HAWP: `.hawp/work/BACKLOG.md`, closed `AUDIT-001`, active STAB/TASK plans
- Versioning: `package.json`, `docs/changelog.md`, `scripts/publish/prepublish-guard.ts`
- Core runtime: `src/service/service.ts`, database adapters, ORM/repositories, localization, error types, HTTP handlers
- Tooling: CI workflows, build/publish scripts, `scripts/dev/sync-local-exports.ts`
- Prior report: `.hawp/work/status/2026/06/20/AUDIT-001-production-readiness.md`

## What Changed (this session)

- Opened HAWP work item `AUDIT-002` and saved this report.
- Updated `.hawp/work/BACKLOG.md` with the new audit row.

## What Was Directly Verified

| Command / check | Evidence |
| --------------- | -------- |
| `node -v` / `npm -v` | `v26.3.0`, `11.17.0` — matches `package.json` engines |
| `npm run type:check` | Pass (src, test, scripts) |
| `npm run lint:silent` | Pass |
| `npm test` | Pass — 59 files, 496 tests |
| `npm run prepublish:guard` | Pass — `0.0.57` matches changelog top entry; not on npm |
| `npm view @sentzunhat/zacatl version` | `0.0.55` (latest published) |
| Clean `npm run build:src` + export audit | **9** committed export targets missing from disk |
| `npm run local:exports` (probe only, reverted) | Regenerates 187 exports; **0** missing — confirms fix path |

### Version note

The repo uses semver `0.0.55` / `0.0.56` / `0.0.57`, not `0.55.0`. npm latest is **`0.0.55`**. Changelog lists `0.0.56` and `0.0.57` as "Pending release"; neither has been published.

## Architecture assessment

### Modularity and simplicity — **Confirmed** mostly improved

- **Good:** Unified ORM adapter factories, DI token resolution, consolidated database adapters under `database/adapters/`, root `src/index.ts` kept intentionally small, barrel pruning reduces accidental deep imports.
- **Concern:** Two parallel Express adapter implementations (`api/express-adapter.ts` vs `api/adapters/express.ts`); only the latter supports `apiPrefix` and is used by `Server`.
- **Concern:** `package.json` exports are large (~180+ subpaths). `sync-local-exports.ts` auto-generates from build — good for modularity, but committed exports lag behind refactors unless sync is automated.

### Database layer — **Likely** functional, **not** production-complete

- Connect paths for Mongoose, Sequelize, and node:sqlite are structured with `CustomError` wrapping and `registerOrmInstance`.
- `BaseRepository` eagerly creates typed adapters — simple consumer API.
- **Gap:** `disconnect()` on all database adapters is a stub; no graceful pool/connection teardown.
- **Gap:** `Service` has no shutdown path to call `DatabaseServer.disconnect()`.

### Localization — **Confirmed** usable

- `Service` constructor calls `configureI18nNode(config.localization)`.
- Built-in locale discovery covers dev, build output, and installed package layouts.
- Consumer locale directories are auto-discovered from the working tree.
- **Gap:** No request-scoped locale selection wired in HTTP adapters (Accept-Language / query param) — consumers must set locale per handler today.

### Error handling — **Confirmed** partial

- Rich `CustomError` with `id`, `correlationId`, `component`, `operation`, `metadata`.
- Route handler `handleError()` maps typed errors to HTTP status codes.
- **Gap:** API error bodies expose `message` only — correlation IDs are not returned, limiting production traceability.
- **Gap:** Express adapter forwards unexpected errors via `next(err)` with no framework-level error middleware registered in inspected scope.
- **Gap:** `requestContext` AsyncLocalStorage exists but is not populated by platform middleware in inspected scope.

## Risks

| Risk | Severity | Confidence |
| ---- | -------- | ---------- |
| Flat third-party import paths (`/third-party/mongoose`, etc.) | High | Resolved in 0.0.57 — nested paths only; see changelog migration |
| Stale exports ship broken subpath resolution | High | Resolved — `postbuild` runs `local:exports` |
| No graceful shutdown loses in-flight DB/HTTP work | Medium | Confirmed |
| Error correlation difficult in production | Medium | Confirmed |
| CVE workflow runs on Node 24 while library requires 26 | Low | Confirmed |

## Non-findings (within inspected scope)

- No high-severity `npm audit` issues were re-run this session; AUDIT-001 reported zero high vulnerabilities.
- Lint suppressions in `src/` are minimal (naming-convention exceptions only in handler error destructuring).
- Test count and README badge (496 tests) align with current run.

## Suggested next step

Execute a focused **0.0.57 release prep** tranche:

1. Automate `local:exports` after build (or add CI check that fails on export drift).
2. Document breaking third-party import path changes; add one-release compatibility shims if backward compatibility is required.
3. Run `npm run publish:dry:ci` and smoke-test tarball imports.
4. Implement `Service.stop()` + real adapter disconnect before calling the framework production-ready for long-running services.
5. Extend HTTP error responses with optional `correlationId`; wire `requestContext.run()` in Fastify/Express hooks.

## Help wanted

- Publish strategy: ship **`0.0.57` only** (skip unpublished `0.0.56`), or publish both sequentially?
- Backward compatibility: require flat `@zacatl/third-party/databases/mongoose` shims for one release, or accept breaking change?
