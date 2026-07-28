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

Items `2898d74c` through `dc0ae72a` descend from the 2026-07-13 security/arch/scalability audit
(`.hawp/work/evidence/2026/07/13/AUDIT-002-security-arch-scalability-report.md`), ordered P0 → P2.
Items `e1f4b2a0`, `a3d81c6e`, `b7c92f1d`, `c4e05a92` descend from AUDIT-004 (2026-07-15,
`.hawp/work/evidence/2026/07/15/AUDIT-004-security-arch-scalability-report.md`).

| ID         | Type        | Title                                                                                                                                             | Status      | Plan                                                        |
| ---------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ----------------------------------------------------------- |
| `b4f0c8a1` | docs        | P2: README overhaul + CI badge polish — quick iterations, batched until v0.1.0 cutover, no release needed per-iteration | in-progress | `.hawp/work/active/b4f0c8a1-readme-and-ci-badge-polish.md`  |
| `e7a20d15` | milestone   | P1: v0.1.0 — CLI/desktop/server platforms to a minimal standard; batched breaking changes                                                         | analyzing   | `.hawp/work/active/e7a20d15-v0.1.0-milestone.md`            |
| `f2a96e04` | improvement | P2: Dependency hygiene — remaining: HTTP-frameworks-as-peers (0.1.0). Done: exports validation 45f74849, scoped uuid override, @fastify/static 10 | in-progress | see AUDIT-005 advisories                                    |
| `5c2c9ef3` | refactoring | P2: DI layered child containers (infra→domain→app chain) — all sub-items done                                                   | done        | `.hawp/work/active/5c2c9ef3-1a6e-469f-9c25-f644b5e3d635.md` |
| `GH-NOTIFY-001` | tooling | P3: Reduce GitHub repo notification noise — disable Discussions, add to infrascode github-repo-hardener config                 | inbox       | `.hawp/work/active/GH-NOTIFY-001.md`                         |
| DEVX-001   | improvement | Add devcontainer configuration for local development setup                                                                                        | parked      | `.hawp/work/parked/DEVX-001.md`                             |
| FEAT-001   | feature     | RequestContextHook: opt-in AsyncLocalStorage per-request context                                                                                  | parked      | `.hawp/work/parked/FEAT-001-REQUEST-CONTEXT-HOOK.md`        |
| ESLINT-010 | tooling     | Upgrade ESLint from ^9.x to ^10.x                                                                                                                 | parked      | `.hawp/work/parked/ESLINT-010.md`                           |

---

## Recently Closed

Keep this section short (last 5–10 items or last 14–30 days). Compacted 2026-07-27 — 25 older rows
moved to [closed/BACKLOG-ARCHIVE.md](closed/BACKLOG-ARCHIVE.md#archived-2026-07-27).

| ID          | Type          | Title                                                                                                       | Closed     | Plan                                                                                                                                       |
| ----------- | ------------- | ----------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `871e98ef`  | `release`     | P2: v0.0.59 — 4 Dependabot PRs merged, 2 closed superseded, 2 closed blocked on ESLint 10, 9 CVE alerts fixed across examples, released to npm | 2026-07-27 | [closed/2026/07/27/871e98ef-v0.0.59-dependency-bumps.md](closed/2026/07/27/871e98ef-v0.0.59-dependency-bumps.md) |
| `refactor-collapse-duplication` | `refactoring` | P2: Collapse BaseRepository/handler duplication, normalize Sequelize adapter errors — 75 net lines removed, 0 API breaks | 2026-07-26 | [closed/2026/07/26/refactor-duplication-collapse.md](closed/2026/07/26/refactor-duplication-collapse.md) |
| `75df2542`  | `tooling`     | P1: CI release workflow — orchestrator redesign, no duplicate runs, all checks gate release to npm           | 2026-07-25 | [closed/2026/07/25/75df2542-ci-workflow-redesign.md](closed/2026/07/25/75df2542-ci-workflow-redesign.md)                                   |
| `754afa86`  | `security`    | P1: npm token rotation + CI setup — owner added NPM_TOKEN secret, workflow unblocked                        | 2026-07-25 | (NPM_TOKEN configured in GitHub Actions secrets)                                                                                           |
| `9c4f0a58`  | `security`    | P1: Mongoose index lifecycle controls for safe production boot                                              | 2026-07-21 | [closed/2026/07/21/9c4f0a58-mongoose-index-lifecycle-controls.md](closed/2026/07/21/9c4f0a58-mongoose-index-lifecycle-controls.md)         |
| `0.0.58`    | `release`     | Dry-run release preparation and publish-folder verification                                                 | 2026-07-21 | [closed/2026/07/21/release-0.0.58-dry-run-prep.md](closed/2026/07/21/release-0.0.58-dry-run-prep.md)                                       |
| `c8e1f0d2`  | `refactoring` | P2: small-app Sequelize-to-node:sqlite migration reference                                                  | 2026-07-21 | [closed/2026/07/21/c8e1f0d2-small-app-nodesqlite-migration.md](closed/2026/07/21/c8e1f0d2-small-app-nodesqlite-migration.md)               |
| `4b7e2c91`  | `bugfix`      | P2: NodeNext declaration-barrel compatibility for packed consumers                                          | 2026-07-21 | [closed/2026/07/21/4b7e2c91-nodenext-declaration-barrels.md](closed/2026/07/21/4b7e2c91-nodenext-declaration-barrels.md)                   |

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
