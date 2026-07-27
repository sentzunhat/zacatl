# a14f9c8e — node:sqlite repository/store pattern for session and archive-style apps

input: |
Provide a clean node:sqlite path for apps that currently use simple Sequelize
SQLite models for local sessions, archive metadata, Ollama usage, and training
selections.

context: |
Zacatl 0.0.57 made Sequelize optional. Simple local SQLite consumers can avoid
external sqlite3 and Sequelize entirely by using Node 26's built-in node:sqlite
runtime, but they still need a clear repository/store pattern that feels as
approachable as the Sequelize examples.

mission: |
Add a Zacatl node:sqlite example and supporting docs that demonstrate
table creation/migration, typed row mapping, simple query helpers, and a
session/archive-style store use case.

constraints: |
Keep this additive and focused on Node 26. Do not remove Sequelize examples.
Avoid introducing external SQLite packages. Preserve the existing repository
contracts unless a small, documented helper is required.

output: |
A runnable node:sqlite example or fixture, docs showing the store pattern, and
verification that the example builds and runs without sequelize or sqlite3.

## Result

Added `examples/node-sqlite-store/`, a backend-only Node 26 `node:sqlite`
example for local session, archive metadata, and training-selection storage.

The example includes:

- explicit migration ledger and table creation
- typed SQLite row mappers
- prepared-statement helper methods
- create/display/close/delete behavior
- cascade delete proof from sessions to archive/training rows
- dependency declaration check proving the example does not declare `sequelize`
  or `sqlite3`

Linked from:

- `examples/README.md`
- `docs/migration/0.0.57.md`
- `docs/service/infrastructure-usage.md`

## Direct Verification

Run from `examples/node-sqlite-store` with Node 26.3.0:

- `npm install` passed: added 4 packages and found 0 vulnerabilities.
- `npm run smoke` passed: build succeeded and runtime output reported
  `"ok": true`, one displayed session, one displayed archive item, one displayed
  training selection, and cascade cleanup after delete.
- `npm run deps:check` passed: `No sequelize or sqlite3 dependencies declared
by this example.`
- `npm audit --omit=dev` passed: `found 0 vulnerabilities`.

Packed temp-consumer proof from the repo root with Node 26.3.0:

- `npm pack --pack-destination <tmp> --json` produced an installable Zacatl
  tarball.
- A temporary production consumer installed that tarball with `--omit=dev`.
- `npm audit --omit=dev` passed: `found 0 vulnerabilities`.
- `npm ls @sentzunhat/zacatl sequelize sqlite3` showed only
  `@sentzunhat/zacatl@0.0.57`; Sequelize and sqlite3 were absent.
