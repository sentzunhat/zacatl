# Migration Guides

Guides for moving between Zacatl versions or between adapters within the same version.

| Guide                                                                     | When you need it                                                                 |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| [0.0.57 Migration](./0.0.57.md)                                          | Upgrading a pre-0.0.57 consumer — optional peer audit ownership, `DatabaseConfig` naming |
| [Sequelize SQLite → node:sqlite](./sequelize-sqlite-to-nodesqlite.md)    | Moving a small local-SQLite app off Sequelize onto Node 26's built-in `node:sqlite`, dropping the `sequelize`/`sqlite3` peer dependencies |

For everything else version-specific, see [docs/changelog.md](../changelog.md) — each release entry calls out breaking changes inline; a dedicated migration guide only exists here when the change needs more than a changelog paragraph to walk through safely.
