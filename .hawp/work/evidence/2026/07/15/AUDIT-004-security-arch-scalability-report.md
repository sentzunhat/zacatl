# AUDIT-004 — Security / Architecture / Scalability (pass 4)

**Date:** 2026-07-15
**Scope:** full `src/`, workflows, docs — new issues only; excludes items
closed by AUDIT-002/003 follow-ups (HMAC timing-safety, Docker hardening,
Mongoose filter injection, JSONC parsing, command-runner fail-closed,
findMany bounds, DI isRegistered guards, SQLite stmt caching, proxy regex
escaping). Security headers remain intentionally parked (`8a7d89b8`).
**Baseline:** dev @ 0.0.57 bump (7526cbc0), 618 tests passing, npm audit: 0
vulnerabilities.

## Findings

### Security

| Sev | Location | Finding | Disposition |
| --- | -------- | ------- | ----------- |
| P1 | `src/service/layers/infrastructure/orm/nodesqlite/adapter.ts:35,139-146,204-211` | `_stmtCache` keyed by full SQL text; `findMany` emits a distinct SQL string per filter-key combination → unbounded prepared-statement growth in long-lived processes with dynamic filters. | Work item `a3d81c6e` |
| P2 | `src/service/layers/infrastructure/orm/sequelize/adapter.ts:129-150` | `update`/`delete` scope by `id` alone, ignoring any additional scoping fields — soft data-integrity/authz gap for composite-key consumers. | Work item `b7c92f1d` |
| P2 | package.json | `typescript` 6.0.3 vs 7.0.2 latest major; npm audit clean. Informational. | No item |

### Architecture

| Sev | Location | Finding | Disposition |
| --- | -------- | ------- | ----------- |
| P2 | `src/service/layers/application/application.ts:38-51` + `src/dependency-injection/container.ts:97-129` | Registration verification duplicated across Application layer and DI container — two divergent code paths, no single source of truth. | Work item `c4e05a92` |
| P2 | `src/dependency-injection/container.ts:19-40` | Orphaned JSDoc block duplicated verbatim (also at 81-96), attached to the wrong function. | Work item `c4e05a92` |

### Scalability

| Sev | Location | Finding | Disposition |
| --- | -------- | ------- | ----------- |
| P1 | (same as stmt-cache item above) | Unbounded `_stmtCache` = memory leak under high filter cardinality. | Work item `a3d81c6e` |
| P2 | `src/service/layers/infrastructure/orm/sequelize/adapter.ts:129-139` | `update()` re-fetches via `findById` after `model.update()`; `delete()` pre-fetches before `destroy()` — doubles DB round trips per write. | Work item `b7c92f1d` |

### Release pipeline (found during this session, not by the audit agent)

| Sev | Location | Finding | Disposition |
| --- | -------- | ------- | ----------- |
| P1 | `publish-dry` workflow (run 29432457908) | Packaged-consumer smoke test fails: `Could not resolve "mongoose" imported by "@sentzunhat/zacatl"` — optional peer dep absent in the CI publish environment. Same chain runs in `release.yml`, so this **blocks the first real release**. | Work item `e1f4b2a0` |

### Docs drift

| Sev | Location | Finding | Disposition |
| --- | -------- | ------- | ----------- |
| P2 | `docs/changelog.md:92` vs `package.json` engines | Changelog conflates node:sqlite experimental availability (Node 22.5+) with the enforced engine (`>=26.0.0`) — consumers could assume 22.5 suffices. Wording only. | Fixed inline with docs alignment |
| — | CONTRIBUTING.md, docs/guidelines/git-workflow.md | Described the retired tag-push-from-dev release flow. | Fixed 2026-07-15 (same-day) |

Everything else checked (README examples, architecture.md layering, ORM
adapter export paths) matches `src/`.

## Direct evidence vs inference

- Direct: stmt-cache key construction, Sequelize update/delete SQL paths,
  duplicated JSDoc, publish-dry failure log, npm audit output.
- Inference: severity of the stmt-cache leak depends on consumer filter
  cardinality (framework can't control it — hence P1); Sequelize scoping gap
  is only exploitable if a consumer relies on composite scoping the adapter
  never promised.
