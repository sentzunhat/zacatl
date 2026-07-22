# node:sqlite Store Example

Minimal Zacatl example for small apps that need durable local SQLite without
Sequelize or the external `sqlite3` package.

This example mirrors app-local persistence use cases such as:

- sessions
- archive metadata
- training selections

It demonstrates:

- table creation and a tiny schema migration ledger
- typed row mapping
- prepared-statement query helpers
- create, list/display, update-style association, and delete behavior
- a production dependency tree that contains Zacatl but not Sequelize

## Run

```bash
npm install
npm run smoke
npm run deps:check
npm audit --omit=dev
```

Expected dependency check:

```text
No sequelize or sqlite3 dependencies declared by this example.
```

This repo-local example uses `@sentzunhat/zacatl` through `file:../..`, so a raw
`npm ls sequelize sqlite3` can see Zacatl's development dependencies from the
linked checkout. A packed or published consumer install should show Zacatl
without Sequelize or `sqlite3` unless the app adds them for another reason.

## Pattern

The store keeps SQLite schema explicit and boring:

1. `migrate()` creates tables and records applied migrations.
2. `run()` and `all()` keep prepared-statement calls centralized.
3. Row mappers convert raw SQLite rows into typed application objects.
4. App methods stay small: `createSession`, `recordArchiveItem`,
   `selectForTraining`, `deleteSession`, and query helpers.

Use this shape when the app wants local relational persistence but does not need
ORM model lifecycle features.

For a migration checklist from simple Sequelize SQLite models to this style,
see
[`docs/migration/sequelize-sqlite-to-nodesqlite.md`](../../docs/migration/sequelize-sqlite-to-nodesqlite.md).
