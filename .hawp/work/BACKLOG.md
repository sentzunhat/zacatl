# Backlog

Active index for current open work in this repository.
Closed history belongs under `.hawp/work/closed/YYYY/MM/DD/` and should not accumulate forever here.
Each row links to its plan file when one exists.

---

## Status Key

| Status        | Meaning                             |
| ------------- | ----------------------------------- |
| `inbox`       | Received, not yet analyzed          |
| `analyzing`   | Under investigation                 |
| `plan-ready`  | Plan written, awaiting review       |
| `approved`    | Plan approved, ready to implement   |
| `in-progress` | Being implemented                   |
| `parked`      | Deferred without closing            |
| `done`        | Implemented and verified            |
| `blocked`     | Blocked — reason noted in plan file |
| `wont-fix`    | Decided not to fix — reason noted   |

---

## Active Work

| ID | Type | Title | Status | Detail | Updated | Next Action |
| -- | ---- | ----- | ------ | ------ | ------- | ----------- |
| `EXPRESS-400` | bug | Express Zod validation failures return 500 instead of 400 | in-progress | [plan](active/EXPRESS-400-validation-status.md) | 2026-10-15 | Fix + regression tests pass locally; commit/PR, then live-check an Express example after release. |
| `ac0c4acf` | improvement | Align work records with HAWP UUID/folder layout | plan-ready | [plan](active/ac0c4acf-c90a-4a32-a66a-b058577368f6/plan.md) | 2026-10-15 | Review dry-run findings; migrate current/open index without renaming closed history. |
| `b4f0c8a1` | docs | README positioning and developer-experience pass | in-progress | [plan](active/b4f0c8a1-readme-and-ci-badge-polish.md) | 2026-10-15 | Finish positioning pass; badges are corrected and released. |
| `0b959aed` | infrastructure | Audit and refresh Zacatl dependencies after 0.0.64 | plan-ready | [plan](active/0b959aed/plan.md) | 2026-10-15 | Re-resolve registry versions and advisories before implementation. |

## Blocked / Parked

| ID | Type | Title | Reason | Detail | Updated |
| -- | ---- | ----- | ------ | ------ | ------- |
| `DEVX-001` | improvement | Devcontainer configuration for local development | Parked; non-blocking contributor experience work. | [plan](parked/DEVX-001.md) | 2026-10-15 |
| `FEAT-001` | feature | RequestContextHook with per-request AsyncLocalStorage | Parked; optional feature, not a v0.1.0 blocker. | [plan](parked/FEAT-001-REQUEST-CONTEXT-HOOK.md) | 2026-10-15 |
| `ESLINT-010` | tooling | Upgrade ESLint from 9 to 10 | Parked pending compatible `eslint-plugin-import` support; re-check before resuming. | [plan](parked/ESLINT-010.md) | 2026-10-15 |
| `NPM-OIDC-001` | security | Replace npm publish token with GitHub Actions OIDC | Deferred until November–December 2026; complete before January 2027 npm policy cutoff. | [plan](parked/NPM-OIDC-001.md) | 2026-10-15 |
| `e7a20d15` | milestone | v0.1.0 — bring CLI, desktop and server platforms to minimum support | Parked per owner direction; resume when the owner reprioritizes the v0.1.0 platform roadmap. | [plan](parked/e7a20d15-v0.1.0-milestone.md) | 2026-10-15 |

---

## Recently Closed

Keep this section short (last 5–10 items or last 14–30 days). Compacted 2026-07-27 — 25 older rows
moved to [closed/BACKLOG-ARCHIVE.md](closed/BACKLOG-ARCHIVE.md#archived-2026-07-27); 2 more on
2026-09-29 ([archive](closed/BACKLOG-ARCHIVE.md#archived-2026-09-29)), 1 on 2026-10-01, 1 on
2026-10-03, 1 on 2026-10-04.

| ID                              | Type          | Title                                                                                                                                          | Closed     | Plan                                                                                                                               |
| ------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `DEPS-063` | `maintenance` | In-major dependency updates and example lockfile audit fixes (all nine examples at 0 advisories) — released in 0.0.64 | 2026-10-04 | [evidence/2026/10/04/bacf99c4…/evidence.md](evidence/2026/10/04/bacf99c4-236e-4bd1-ae54-8d96713b383a/evidence.md) |
| `83cef132-c1df-402c-9504-a0df1cdf7567` | `tooling` | Refresh HAWP kit and Codex provider from HAWP main | 2026-10-15 | [plan](closed/2026/10/15/83cef132-c1df-402c-9504-a0df1cdf7567/plan.md) |
| `LOG-001` | `feature` | Shared logger for the Service, Fastify and Express (`toFastifyLogger`, `ServiceConfig.logger`, `LoggerToken`) — released in 0.0.63 | 2026-10-03 | [evidence/2026/10/03/78dba5ff…/evidence.md](evidence/2026/10/03/78dba5ff-0cd1-442e-86e3-f7faf701a4b5/evidence.md) |
| `RUNTIME-FIX-001` | `bug` | node:sqlite without `sqlite3`, barrel polyfill fix, Fastify double-send fix, production audit fixes — released in 0.0.62 | 2026-10-01 | [evidence/2026/10/01/release-0.0.62-evidence.md](evidence/2026/10/01/release-0.0.62-evidence.md) |
| `0.0.61` | `release` | 0.0.61 — README badge corrections released (tag, GitHub Release, npm) | 2026-08-16 | [evidence/2026/09/29/backlog-sync-release-evidence.md](evidence/2026/09/29/backlog-sync-release-evidence.md) |
| `0.0.60` | `release` | 0.0.60 — CI orchestrator, Docker smoke matrix, DI child containers, README; released | 2026-09-29 | [closed/2026/09/29/0.0.60-release.md](closed/2026/09/29/0.0.60-release.md) |
| `5c2c9ef3` | `refactoring` | P2: DI layered child containers (infra→domain→app) — shipped in 0.0.60 | 2026-09-29 | [closed/2026/09/29/5c2c9ef3-1a6e-469f-9c25-f644b5e3d635.md](closed/2026/09/29/5c2c9ef3-1a6e-469f-9c25-f644b5e3d635.md) |
| `GH-NOTIFY-001` | `tooling` | P3: GitHub notification noise — Discussions disabled, hardener policy enforces it | 2026-09-29 | [closed/2026/09/29/GH-NOTIFY-001.md](closed/2026/09/29/GH-NOTIFY-001.md) |
| `871e98ef`                      | `release`     | P2: v0.0.59 — 4 Dependabot PRs merged, 2 closed superseded, 2 closed blocked on ESLint 10, 9 CVE alerts fixed across examples, released to npm | 2026-07-27 | [closed/2026/07/27/871e98ef-v0.0.59-dependency-bumps.md](closed/2026/07/27/871e98ef-v0.0.59-dependency-bumps.md)                   |
| `refactor-collapse-duplication` | `refactoring` | P2: Collapse BaseRepository/handler duplication, normalize Sequelize adapter errors — 75 net lines removed, 0 API breaks                       | 2026-07-26 | [closed/2026/07/26/refactor-duplication-collapse.md](closed/2026/07/26/refactor-duplication-collapse.md)                           |

Older closed rows: [closed/BACKLOG-ARCHIVE.md](closed/BACKLOG-ARCHIVE.md).

---

## Archive

- Closed work: `.hawp/work/closed/`
- Status reports: `.hawp/work/status/`
- Evidence: `.hawp/work/evidence/`
- Decisions: `.hawp/work/decisions/`

---

## Notes

- Check this file before starting any new item.
- Each item gets one plan file under `.hawp/work/active/` - no two agents on the same ID.
- Deferred items can move to `.hawp/work/parked/` without being closed.
- On close, move the plan file to `.hawp/work/closed/YYYY/MM/DD/`.
- Keep Recently Closed capped; do not append completed history forever.
- Work started outside this loop should still get a row added for visibility.
