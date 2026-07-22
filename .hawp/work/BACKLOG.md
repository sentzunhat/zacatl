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
| `e7a20d15` | milestone   | P1: v0.1.0 — CLI/desktop/server platforms to a minimal standard; batched breaking changes                                                         | analyzing   | `.hawp/work/active/e7a20d15-v0.1.0-milestone.md`            |
| `f2a96e04` | improvement | P2: Dependency hygiene — remaining: HTTP-frameworks-as-peers (0.1.0). Done: exports validation 45f74849, scoped uuid override, @fastify/static 10 | in-progress | see AUDIT-005 advisories                                    |
| `754afa86` | security    | P1: npm token rotation — repo side done; owner must rotate token + add secret                                                                     | blocked     | `.hawp/work/active/754afa86-91f4-4a46-8094-756eab1f3f68.md` |
| `75df2542` | tooling     | P1: CI release workflow — repo side done; owner must add NPM_TOKEN secret                                                                         | blocked     | `.hawp/work/active/75df2542-ac31-4efd-96cc-cb15356ba36c.md` |
| `5c2c9ef3` | refactoring | P2: DI child containers, uniform guards, constructor injection, factory seam                                                                      | in-progress | `.hawp/work/active/5c2c9ef3-1a6e-469f-9c25-f644b5e3d635.md` |
| DEVX-001   | improvement | Add devcontainer configuration for local development setup                                                                                        | parked      | `.hawp/work/parked/DEVX-001.md`                             |
| FEAT-001   | feature     | RequestContextHook: opt-in AsyncLocalStorage per-request context                                                                                  | parked      | `.hawp/work/parked/FEAT-001-REQUEST-CONTEXT-HOOK.md`        |
| ESLINT-010 | tooling     | Upgrade ESLint from ^9.x to ^10.x                                                                                                                 | parked      | `.hawp/work/parked/ESLINT-010.md`                           |

---

## Recently Closed

Keep this section short (last 5–10 items or last 14–30 days).

| ID          | Type          | Title                                                                                                       | Closed     | Plan                                                                                                                                       |
| ----------- | ------------- | ----------------------------------------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `9c4f0a58`  | `security`    | P1: Mongoose index lifecycle controls for safe production boot                                              | 2026-07-21 | [closed/2026/07/21/9c4f0a58-mongoose-index-lifecycle-controls.md](closed/2026/07/21/9c4f0a58-mongoose-index-lifecycle-controls.md)         |
| `0.0.58`    | `release`     | Dry-run release preparation and publish-folder verification                                                 | 2026-07-21 | [closed/2026/07/21/release-0.0.58-dry-run-prep.md](closed/2026/07/21/release-0.0.58-dry-run-prep.md)                                       |
| `c8e1f0d2`  | `refactoring` | P2: small-app Sequelize-to-node:sqlite migration reference                                                  | 2026-07-21 | [closed/2026/07/21/c8e1f0d2-small-app-nodesqlite-migration.md](closed/2026/07/21/c8e1f0d2-small-app-nodesqlite-migration.md)               |
| `4b7e2c91`  | `bugfix`      | P2: NodeNext declaration-barrel compatibility for packed consumers                                          | 2026-07-21 | [closed/2026/07/21/4b7e2c91-nodenext-declaration-barrels.md](closed/2026/07/21/4b7e2c91-nodenext-declaration-barrels.md)                   |
| `c62d8b31`  | `tooling`     | P1: consumer smoke fixtures for non-SQL, SQL, Mongo, and node:sqlite installs                               | 2026-07-21 | [closed/2026/07/21/c62d8b31-consumer-smoke-fixtures.md](closed/2026/07/21/c62d8b31-consumer-smoke-fixtures.md)                             |
| `a14f9c8e`  | `feature`     | P1: node:sqlite repository/store pattern for session and archive-style apps                                 | 2026-07-21 | [closed/2026/07/21/a14f9c8e-nodesqlite-store-pattern.md](closed/2026/07/21/a14f9c8e-nodesqlite-store-pattern.md)                           |
| `2fa09d57`  | `docs`        | P1: 0.0.57 optional peer audit behavior and DatabaseConfig migration clarity                                | 2026-07-21 | [closed/2026/07/21/2fa09d57-0.0.57-audit-and-database-config-docs.md](closed/2026/07/21/2fa09d57-0.0.57-audit-and-database-config-docs.md) |
| `57a11d0c`  | `docs`        | P1: 0.0.57 consumer audit migration docs and publish-shape proof                                            | 2026-07-21 | [closed/2026/07/21/57a11d0c-0.0.57-consumer-audit-migration.md](closed/2026/07/21/57a11d0c-0.0.57-consumer-audit-migration.md)             |
| `8a7d89b8`  | `security`    | P2: Security headers — resolved via hardened-fastify template guide (docs/guidelines/hardened-fastify.md)   | 2026-07-17 | [closed/2026/07/17/8a7d89b8-5612-476f-a0b6-84e1129538b0.md](closed/2026/07/17/8a7d89b8-5612-476f-a0b6-84e1129538b0.md)                     |
| `d8f31c7a`  | `refactoring` | P2: Config* → *Config rename Phase 1 — renamed + @deprecated aliases shipped in 0.0.57; Phase 2 in e7a20d15 | 2026-07-17 | [closed/2026/07/17/d8f31c7a-config-rename.md](closed/2026/07/17/d8f31c7a-config-rename.md)                                                 |
| `a3d81c6e`  | `bugfix`      | P1: Bounded LRU (128) for NodeSqlite prepared-statement cache                                               | 2026-07-15 | [closed/2026/07/15/a3d81c6e-stmt-cache-bound.md](closed/2026/07/15/a3d81c6e-stmt-cache-bound.md)                                           |
| `b7c92f1d`  | `improvement` | P2: Sequelize write paths — id-only scoping documented, Postgres RETURNING skips re-fetch                   | 2026-07-15 | [closed/2026/07/15/b7c92f1d-sequelize-write-paths.md](closed/2026/07/15/b7c92f1d-sequelize-write-paths.md)                                 |
| `c4e05a92`  | `refactoring` | P2: ensureRegisteredSingleton consolidation + container JSDoc fixes                                         | 2026-07-15 | [closed/2026/07/15/c4e05a92-di-registration-cleanup.md](closed/2026/07/15/c4e05a92-di-registration-cleanup.md)                             |
| `e1f4b2a0`  | `bugfix`      | P1: publish-dry mongoose resolution — optional peers added to devDependencies                               | 2026-07-15 | [closed/2026/07/15/e1f4b2a0-publish-dry-mongoose.md](closed/2026/07/15/e1f4b2a0-publish-dry-mongoose.md)                                   |
| `36cb30fd`  | `review`      | P2: Object type shapes sweep — NodeSqliteBaseRepositoryConfig, SequelizeRepositoryConfig, barrel exports    | 2026-07-13 | [closed/2026/07/13/36cb30fd-0698-43c4-899e-9131d8cc5eac.md](closed/2026/07/13/36cb30fd-0698-43c4-899e-9131d8cc5eac.md)                     |
| `33fc23e7`  | `security`    | Deprecate HMAC SHA-1/MD5 + timing-safe verifyHmac                                                           | 2026-07-13 | [closed/2026/07/13/33fc23e7-c810-4b1e-b417-8600bdaec04a.md](closed/2026/07/13/33fc23e7-c810-4b1e-b417-8600bdaec04a.md)                     |
| `dc0ae72a`  | `improvement` | P2: Perf/web polish: SQLite statement cache, proxy regex escape, Fastify SPA URL decode                     | 2026-07-13 | [closed/2026/07/13/dc0ae72a-1f75-4fe8-a690-24aad8ef70e8.md](closed/2026/07/13/dc0ae72a-1f75-4fe8-a690-24aad8ef70e8.md)                     |
| `26343b19`  | `security`    | P1: Docker hardening — digest pins, healthchecks, SQLite volume path (all already implemented)              | 2026-07-13 | [closed/2026/07/13/26343b19-a511-4a9a-8df6-ed0be16153d0.md](closed/2026/07/13/26343b19-a511-4a9a-8df6-ed0be16153d0.md)                     |
| `856596ae`  | `improvement` | P1: Awaitable adapter initialization surfaced through Service.start()                                       | 2026-07-13 | [closed/2026/07/13/856596ae-f0ee-4373-b047-491455258e2a.md](closed/2026/07/13/856596ae-f0ee-4373-b047-491455258e2a.md)                     |
| `c23ac70f`  | `improvement` | P1: Clean up database driver dependency declarations (phantom deps, optionalDependencies)                   | 2026-07-13 | [closed/2026/07/13/c23ac70f-4b01-4c5b-90dd-d83ef3255ab0.md](closed/2026/07/13/c23ac70f-4b01-4c5b-90dd-d83ef3255ab0.md)                     |
| `2898d74c`  | `bugfix`      | P0: Fix eager repository resolution breaking node:sqlite startup (lazy `get model()`)                       | 2026-07-13 | [closed/2026/07/13/2898d74c-2801-44b2-936e-44aa89fda4a8.md](closed/2026/07/13/2898d74c-2801-44b2-936e-44aa89fda4a8.md)                     |
| `4a10b1bd`  | `security`    | P1: Sanitize Mongoose adapter filters and wrap updates in $set                                              | 2026-07-13 | [closed/2026/07/13/4a10b1bd-7369-4418-8c52-6f3d23d9f67a.md](closed/2026/07/13/4a10b1bd-7369-4418-8c52-6f3d23d9f67a.md)                     |
| `7956fd0b`  | `bugfix`      | P0: Named database connections — `connection: { url, name? }` + symbol tokens                               | 2026-07-13 | [closed/2026/07/13/7956fd0b-5819-4112-a7ae-260c3d53ac98.md](closed/2026/07/13/7956fd0b-5819-4112-a7ae-260c3d53ac98.md)                     |
| `db4a3db2`  | `bugfix`      | P0: Replace JSONC comment-strip regex with jsonc-parser                                                     | 2026-07-13 | [closed/2026/07/13/db4a3db2-1ae2-47e5-b049-860927d3a5e4.md](closed/2026/07/13/db4a3db2-1ae2-47e5-b049-860927d3a5e4.md)                     |
| `8ea541fa`  | `improvement` | P0: Bound findMany with SQLite filter pushdown, pagination, and docs                                        | 2026-07-13 | [closed/2026/07/13/8ea541fa-4751-44e0-a7b5-2a388b5f0e5e.md](closed/2026/07/13/8ea541fa-4751-44e0-a7b5-2a388b5f0e5e.md)                     |
| `d5be8edb`  | `security`    | Separate safe public errors from diagnostic serialization                                                   | 2026-07-13 | [closed/2026/07/13/d5be8edb-0b18-4fb5-9de9-20ab3b5fe400.md](closed/2026/07/13/d5be8edb-0b18-4fb5-9de9-20ab3b5fe400.md)                     |
| `c5c75f5e`  | `security`    | Enforce canonical command working-directory containment                                                     | 2026-07-13 | [closed/2026/07/13/c5c75f5e-a1e3-4901-a817-a8afc84904c8.md](closed/2026/07/13/c5c75f5e-a1e3-4901-a817-a8afc84904c8.md)                     |
| `9f0a878f`  | `security`    | Make command-runner policy fail closed                                                                      | 2026-07-13 | [closed/2026/07/13/9f0a878f-4d2b-4ad6-a087-747dcea4db3c.md](closed/2026/07/13/9f0a878f-4d2b-4ad6-a087-747dcea4db3c.md)                     |
| `76d1fd81`  | `improvement` | Specialize Docker runtime dependencies by database driver                                                   | 2026-07-13 | [closed/2026/07/13/76d1fd81-01cf-4483-b9aa-137e4408dac6.md](closed/2026/07/13/76d1fd81-01cf-4483-b9aa-137e4408dac6.md)                     |
| `AUDIT-003` | `audit`       | Package security and Docker size audit                                                                      | 2026-07-13 | [closed/2026/07/13/AUDIT-003.md](closed/2026/07/13/AUDIT-003.md)                                                                           |
| `DOCS-001`  | `docs`        | Correct Docker runtime and image-size guidance                                                              | 2026-07-12 | [closed/2026/07/12/DOCS-001.md](closed/2026/07/12/DOCS-001.md)                                                                             |

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
