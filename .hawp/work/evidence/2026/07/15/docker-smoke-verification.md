# Docker example smoke verification — 2026-07-15

**Context:** After the AUDIT-004 fixes (bounded stmt cache, Sequelize write
paths, DI guard consolidation) and the optional-peer devDependencies change
(`e1f4b2a0`), verified the example Docker images still build and run.

## Finding: example image builds were broken (pre-existing)

`examples/Dockerfile` read the database driver version from
`optionalDependencies` in the root package.json — a section removed when
drivers moved to optional `peerDependencies` (dependency cleanup,
`c23ac70f` era). Every example image build failed at the builder stage
since then; the existing local images predated the breakage (built
2026-07-13).

A second issue surfaced after fixing the first: with drivers now also in
`devDependencies` (from `e1f4b2a0`), the duplicate listing made npm treat
the driver as dev-only under `--omit=dev`, so the runtime image lacked
`sqlite3` ("Please install sqlite3 package manually" crash loop).

**Fix (commit `cdeddfd0`):** read the driver version from
`peerDependencies`; delete `peerDependencies`, `peerDependenciesMeta`, and
`devDependencies` before the production prune/install.

## Smoke results (all driver branches, fresh images built from dev @ cdeddfd0)

| Example | Driver branch | Health | API smoke | SPA |
| ------- | ------------- | ------ | --------- | --- |
| express-sqlite-react (:8181) | `sqlite3` (Sequelize) | healthy | GET list, POST create, GET by id, DELETE — all 200, data round-trips | 200 |
| fastify-mongodb-react (:8082) | `mongoose` | healthy | POST create, GET list — 200, data round-trips | 200 |
| fastify-postgres-react (:8083) | `pg` (Sequelize + live Postgres container) | healthy | POST create, GET list, DELETE — all 200 | 200 |

Direct evidence: curl output captured in session; containers torn down
after verification (`docker compose down`, volumes retained).

Not exercised: the Sequelize `update()` Postgres RETURNING path — the
greetings examples expose no update endpoint. Covered by unit tests
(dialect-mocked) instead.
