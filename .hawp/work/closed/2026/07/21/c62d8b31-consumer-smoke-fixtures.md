# c62d8b31 — consumer smoke fixtures for published-package installs

input: |
Add consumer fixtures for non-SQL, Sequelize SQLite, Sequelize Postgres,
Mongoose, and node:sqlite package installs.

context: |
Zacatl 0.0.57 fixed the core consumer audit posture by moving database
ecosystems to optional peers. Repo-local tests are useful, but they do not
fully prove the published package from a downstream consumer's point of view.

mission: |
Create lightweight consumer smoke fixtures that install Zacatl the way a
downstream service would, run a TypeScript build, and run npm audit --omit=dev.

constraints: |
Keep fixtures small and deterministic. Non-SQL and node:sqlite fixtures should
pass production audit cleanly. Sequelize fixtures may document Sequelize-owned
audit findings until upstream resolves the transitive uuid chain.

output: |
Fixture scripts/docs for non-SQL, Sequelize SQLite, Sequelize Postgres,
Mongoose, and node:sqlite consumers, plus command evidence for install, build,
and audit behavior.

## Result

Added `scripts/dev/consumer-smoke-fixtures.ts` and the package script
`smoke:consumers`.

The runner:

- packs the staged `publish/` package artifact
- creates scratch downstream consumers
- installs the packed tarball like a real app
- runs TypeScript build
- runs runtime ESM import/start proof
- runs `npm audit --omit=dev`
- fails non-SQL and node:sqlite fixtures if `sequelize` or `sqlite3` appear in
  their lockfiles
- records Sequelize-owned audit findings for SQL fixtures without failing the
  release gate

Fixtures covered:

- `non-sql`
- `node-sqlite`
- `mongoose`
- `sequelize-sqlite`
- `sequelize-postgres`

Wired `smoke:consumers` into publish paths after `prepare-publish` and before
`npm publish` / `npm publish --dry-run`.

## Direct Verification

Run under Node 26.3.0:

- `npm run type:check:scripts` passed.
- `npm run build` passed.
- `npm run prepare-publish` passed and wrote `publish/package.json`.
- `npm run smoke:consumers` passed all required fixtures.

Observed fixture evidence:

- `non-sql`: install ok; forbidden package check ok; build ok; runtime ok;
  audit ok.
- `node-sqlite`: install ok; forbidden package check ok; build ok; runtime ok
  with `{"vendor":"SQLITE","value":"ok"}`; audit ok.
- `mongoose`: install ok; build ok; runtime ok with schema paths
  `["_id","message"]`; audit ok.
- `sequelize-sqlite`: install ok; build ok; runtime ok; audit completed with
  SQL-owned `sequelize -> uuid` findings.
- `sequelize-postgres`: install ok; build ok; runtime ok; audit completed with
  SQL-owned `sequelize -> uuid` findings.

## Follow-up

The runner originally used TypeScript `moduleResolution: "Bundler"` while
`4b7e2c91` was still open. After the declaration-barrel fix, the same fixture
matrix now uses `module: "NodeNext"` and `moduleResolution: "NodeNext"`.
