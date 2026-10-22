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
| `0b959aed` | infrastructure | Audit and refresh Zacatl dependencies after 0.0.64 | in-progress | [plan](active/0b959aed/plan.md) | 2026-10-22 | Compatible Vitest/Vite patches, root checks, peers, smokes, and nine example audits pass; assess dev-only advisories and complete example/Docker matrix |
| `19965b11` | improvement | Design reusable modular ServiceConfig composition | in-progress | [plan](active/19965b11/plan.md) | 2026-10-22 | Keep the PR description aligned with the breaking DI path move; complete the three-config transitive Vitest smoke test |
| `0ab7e9b2` | improvement | Document real-world Zacatl Service composition lessons | in-progress | [plan](active/0ab7e9b2/plan.md) | 2026-10-22 | Website local 0.0.66 symlink and dev/API/HTML+JSON 404 checks pass; Mongo URI example corrected; update website dependency/lock after publication |
| `f1080c66` | bug | Define restart behavior and clean up partial database connections | in-progress | [plan](active/f1080c66/plan.md) | 2026-10-22 | Pending-connect shutdown race fixed with regression and docs; run full release checks, then keep restart contract as follow-up |
| `bfea146e` | improvement | Move database connection ownership into Infrastructure | plan-ready | [plan](active/bfea146e/plan.md) | 2026-10-19 | After PR #138 integration, design config and source migration in small compatibility-aware slices |
| `4c4365a1` | improvement | Define Domain client boundaries for entry points | plan-ready | [plan](active/4c4365a1/plan.md) | 2026-10-19 | Compare consumer shapes and choose a pattern or small API after the current release lane |
| `b0649873` | refactoring | Organize the `src/` root around the agreed architecture | in-progress | [plan](active/b0649873/plan.md) | 2026-10-21 | Complete aliases, package exports, build/runtime assets, and docs for the owner-proposed source tree; old paths intentionally break |
| `1e905c1f` | improvement | Review import/export and path-generation scripts for scalable maintenance | in-progress | [plan](active/1e905c1f/plan.md) | 2026-10-22 | Source wildcard correction and checks pass; continue staged generator/export/asset-path work |
| `a7728e13-5fd4-42bb-ab62-28693f428172` | improvement | Create a hand-drawn Zacatl Featured-card SVG | in-progress | [plan](active/a7728e13-5fd4-42bb-ab62-28693f428172/plan.md) | 2026-10-21 | Build a private SVG concept from verified modular-service architecture; keep it out of site and package assets until owner review |
| `04b3e320` | task | Audit documentation for current source layout and public module paths | in-progress | [plan](active/04b3e320/plan.md) | 2026-10-22 | Archive-index link, MongoDB URI example, and ESLint source map corrected; HAWP Markdown index verified; broader doc consistency review remains |
| `b74c989a` | bug | Restore the publish dry-run lint gate after the Service alias migration | in-progress | [plan](active/b74c989a/plan.md) | 2026-10-22 | Local publish dry-run passes; verify the pushed-head CI run before closing |

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
2026-10-03, 1 on 2026-10-04, 3 on [2026-10-15](closed/BACKLOG-ARCHIVE.md#archived-2026-10-15).

| ID                              | Type          | Title                                                                                                                                          | Closed     | Plan                                                                                                                               |
| ------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `6ec737fa` | `bug` | Preserve direct Server entry-point resolution — direct and Service-scoped resolution verified on PR #180 head `a71bdc30` | 2026-10-21 | [plan](closed/2026/10/21/6ec737fa/plan.md) |
| `fa61f33c` | `bug` | Scope ORM registrations and index policy to each Service — same-name vendor isolation verified on PR #180 head `a71bdc30` | 2026-10-21 | [plan](closed/2026/10/21/fa61f33c/plan.md) |
| `533c3a53` | `refactoring` | Replace obsolete public API compatibility shims with canonical contracts — current API, docs and examples verified on PR #180 head `a71bdc30` | 2026-10-21 | [plan](closed/2026/10/21/533c3a53/plan.md) |
| `3b1813ff` | `bug` | Reject malformed ZodError lookalikes before wrapping — nonempty issue validation prevents malformed errors from becoming request validation errors | 2026-10-20 | [plan](closed/2026/10/20/3b1813ff/plan.md) |
| `ac0c4acf-c90a-4a32-a66a-b058577368f6` | `improvement` | Align work records with HAWP UUID/folder layout — backlog consistency passes; historical closed-record debt documented | 2026-10-15 | [plan](closed/2026/10/15/ac0c4acf-c90a-4a32-a66a-b058577368f6/plan.md) |
| `b4f0c8a1` | `docs` | README positioning pass — problem/audience first, full CRUD path in code near the top, refreshed figures | 2026-10-15 | [plan](closed/2026/10/15/b4f0c8a1/plan.md) |
| `f822490e-9898-4d57-b17c-7d0f318e6399` | `bug` | Express answers 400 (not 500) for request schema validation failures (legacy `EXPRESS-400`) — on `dev`, unreleased | 2026-10-15 | [plan](closed/2026/10/15/f822490e-9898-4d57-b17c-7d0f318e6399/plan.md) |
| `DEPS-063` | `maintenance` | In-major dependency updates and example lockfile audit fixes (all nine examples at 0 advisories) — released in 0.0.64 | 2026-10-04 | [evidence/2026/10/04/bacf99c4…/evidence.md](evidence/2026/10/04/bacf99c4-236e-4bd1-ae54-8d96713b383a/evidence.md) |
| `83cef132-c1df-402c-9504-a0df1cdf7567` | `tooling` | Refresh HAWP kit and Codex provider from HAWP main | 2026-10-15 | [plan](closed/2026/10/15/83cef132-c1df-402c-9504-a0df1cdf7567/plan.md) |
| `LOG-001` | `feature` | Shared logger for the Service, Fastify and Express (`toFastifyLogger`, `ServiceConfig.logger`, `LoggerToken`) — released in 0.0.63 | 2026-10-03 | [evidence/2026/10/03/78dba5ff…/evidence.md](evidence/2026/10/03/78dba5ff-0cd1-442e-86e3-f7faf701a4b5/evidence.md) |

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
