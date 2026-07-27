# c8e1f0d2 — small-app Sequelize-to-node:sqlite migration reference

input: |
Longer-term, small apps that only use local SQLite should be able to migrate
from Sequelize SQLite to Zacatl's node:sqlite path.

context: |
On-demand-infra is a representative app: local sessions, Ollama usage,
archive metadata, and training selections do not necessarily require a full
ORM. Moving these patterns to node:sqlite would remove sequelize and sqlite3
from that app's dependency tree and simplify its Docker image.

mission: |
Produce a Zacatl migration reference for replacing simple Sequelize SQLite
model usage with node:sqlite repository/store code.

constraints: |
Do not make assumptions about another repository's schema without inspecting
it in that repo. Keep this as a reference, not an automatic cross-repo
migration.

output: |
Completed. Added `docs/migration/sequelize-sqlite-to-nodesqlite.md` with
before/after patterns, dependency-removal guidance, audit expectations,
Docker notes, and a checklist for consumer apps.

evidence: |

- Linked the guide from `README.md`, `docs/README.md`,
  `docs/migration/0.0.57.md`, `docs/service/infrastructure-usage.md`, and
  `examples/node-sqlite-store/README.md`.
- Added changelog entries under 0.0.57 improvements and migration notes.
- Ran `npx prettier --write` on the touched docs and HAWP files.
- Ran `git diff --check`.
- Ran `npm run type:check:src` on Node 26.3.0.
- Ran `npm audit --omit=dev` on Node 26.3.0; result:
  `found 0 vulnerabilities`.
