# release-0.0.58 — dry-run release preparation

input: |
Cut a new version and run all publish dry runs. Verify the package folder.

context: |
The 0.0.57 follow-up fixes were completed on `dev`: optional peer audit docs,
node:sqlite store example, consumer smoke fixtures, NodeNext declaration
compatibility, and the small-app Sequelize SQLite to node:sqlite migration
reference.

mission: |
Prepare Zacatl 0.0.58 for publication without publishing it.

constraints: |
Do not publish to npm in this step. Use Node 26. Keep the release evidence
concrete and separate expected SQL-consumer audit findings from non-SQL
package risk.

output: |
Completed. Bumped the package version to 0.0.58, added a 0.0.58 changelog
section, ran both publish dry-run paths, and verified the generated
`publish/` package folder.

evidence: |

- Ran `npm version 0.0.58 --no-git-tag-version`.
- Ran `npm run publish:dry`; passed.
- Ran `npm run publish:dry:ci`; passed.
- Both dry runs verified 0.0.58 is not published yet.
- Both dry runs built the package, prepared `publish/`, ran packed consumer
  smokes, and completed `npm publish ./publish --dry-run`.
- Consumer smokes passed for non-SQL, node:sqlite, Mongoose, Sequelize SQLite,
  and Sequelize Postgres fixtures.
- Non-SQL and node:sqlite fixtures audited clean.
- Sequelize SQLite/Postgres fixtures reported the documented SQL-owned
  Sequelize `uuid <11.1.1` advisory chain.
- Dry tarball: `sentzunhat-zacatl-0.0.58.tgz`, 127.1 kB package size,
  737.4 kB unpacked size, 540 packed files.
- Verified `publish/package.json` has version 0.0.58, no `devDependencies`,
  and no package scripts.
- Verified all publish export/bin/main/module/types targets exist.
- Verified `publish/build/cjs/package.json` has `{ "type": "commonjs" }`.
- Verified no source maps are present in `publish/`.
- Verified published declaration files have no extensionless relative import
  specifiers.
- Ran `npm pack ./publish --dry-run --json`.
- Ran `npm audit --omit=dev`; result: `found 0 vulnerabilities`.
- Ran `git diff --check`.
