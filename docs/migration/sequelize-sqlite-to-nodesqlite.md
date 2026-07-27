# Migrating Small SQLite Apps From Sequelize To node:sqlite

Use this guide when an app uses Sequelize only as a light wrapper around a local
SQLite file and you want to move to Node 26's built-in `node:sqlite` module.

This is a migration reference, not an automated schema converter. Inspect the
consumer app's real tables and data before removing Sequelize.

## Good Fit

This path is a good fit for app-local persistence such as:

- sessions
- capture or archive metadata
- selections, queues, and small job records
- simple user preferences or local cache tables

The migration is most valuable when the app does not need ORM model lifecycle
features. Moving simple local SQLite code to `node:sqlite` can remove
`sequelize` and `sqlite3` from the production install, avoid Sequelize-owned
audit findings, and simplify Docker images by removing native SQLite driver
build requirements.

## Keep Sequelize When

Keep the Sequelize path if the app depends on:

- complex model associations
- hooks, scopes, validators, or ORM lifecycle behavior
- dialect portability between SQLite, PostgreSQL, MySQL, or MSSQL
- existing transaction patterns that would be risky to rewrite in one pass
- a large schema where Sequelize model definitions are still the clearest source
  of truth

For those apps, Zacatl 0.0.57 still supports the Sequelize adapter. The app just
owns the explicit `sequelize` plus dialect-driver dependency choice.

## Dependency Change

Do this after the code has been migrated and verified:

```bash
npm install @sentzunhat/zacatl@^0.0.57
npm uninstall sequelize sqlite3
```

Only remove `sequelize` and `sqlite3` if no other application code or dependency
still needs them. PostgreSQL/MySQL/MSSQL apps using Sequelize should keep
`sequelize` and the relevant dialect driver.

## Configuration Shape

Zacatl 0.0.57 uses `connection.url` and optional `connection.name` instead of
the older `connectionString` property.

```typescript
import { DatabaseVendor } from '@sentzunhat/zacatl/service';

const databases = [
  {
    vendor: DatabaseVendor.SQLITE,
    connection: {
      url: 'data/app.sqlite',
      name: 'default',
    },
  },
];
```

`connection.name` is the stable token name used when an app has more than one
database for the same vendor. A single SQLite database can omit `name` and use
the vendor default.

## Before: Simple Sequelize SQLite Model

Small apps often have code shaped like this:

```typescript
import { DataTypes, Model, Sequelize } from '@sentzunhat/zacatl/third-party/databases/sequelize';
import sqlite3 from '@sentzunhat/zacatl/third-party/databases/sqlite3';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  dialectModule: sqlite3,
  storage: 'data/app.sqlite',
});

class SessionModel extends Model {
  declare id: string;
  declare userId: string;
  declare createdAt: Date;
}

SessionModel.init(
  {
    id: { type: DataTypes.STRING, primaryKey: true },
    userId: { type: DataTypes.STRING, allowNull: false },
  },
  {
    sequelize,
    modelName: 'Session',
    tableName: 'sessions',
    timestamps: true,
  },
);

export async function listSessions() {
  const rows = await SessionModel.findAll({ order: [['createdAt', 'DESC']] });
  return rows.map((row) => row.get({ plain: true }));
}
```

This is fine when the ORM is doing real work. If the app mostly needs explicit
tables and a few prepared statements, `node:sqlite` is often simpler.

## After: Explicit node:sqlite Store

```typescript
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

export interface Session {
  id: string;
  userId: string;
  createdAt: string;
}

interface SessionRow {
  id: string;
  user_id: string;
  created_at: string;
}

export class SessionStore {
  private readonly db: DatabaseSync;

  constructor(filename = 'data/app.sqlite') {
    mkdirSync(dirname(filename), { recursive: true });
    this.db = new DatabaseSync(filename, { defensive: true });
    this.db.exec('PRAGMA foreign_keys = ON');
  }

  migrate(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  createSession(id: string, userId: string): Session {
    this.db.prepare('INSERT INTO sessions (id, user_id) VALUES (?, ?)').run(id, userId);

    const session = this.findSession(id);
    if (!session) {
      throw new Error(`Session ${id} was not created`);
    }

    return session;
  }

  findSession(id: string): Session | undefined {
    const row = this.db
      .prepare('SELECT id, user_id, created_at FROM sessions WHERE id = ?')
      .get(id) as SessionRow | undefined;

    return row ? this.toSession(row) : undefined;
  }

  listSessions(): Session[] {
    const rows = this.db
      .prepare('SELECT id, user_id, created_at FROM sessions ORDER BY created_at DESC')
      .all() as SessionRow[];

    return rows.map((row) => this.toSession(row));
  }

  deleteSession(id: string): boolean {
    return this.db.prepare('DELETE FROM sessions WHERE id = ?').run(id).changes > 0;
  }

  close(): void {
    this.db.close();
  }

  private toSession(row: SessionRow): Session {
    return {
      id: row.id,
      userId: row.user_id,
      createdAt: row.created_at,
    };
  }
}
```

The key change is intentional explicitness:

- migrations are normal SQL
- every dynamic value uses a prepared statement parameter
- row mapping is typed and local to the store
- the app owns connection lifetime with `close()`

For a fuller example with sessions, archive items, training selections, display
queries, and cascade delete behavior, see
[`examples/node-sqlite-store`](../../examples/node-sqlite-store/).

## Migration Strategy

1. Back up the existing SQLite file.
2. Inventory current Sequelize models, table names, indexes, and associations.
3. Pick one bounded store, such as sessions or archive metadata.
4. Write the `node:sqlite` table DDL explicitly with
   `CREATE TABLE IF NOT EXISTS`.
5. Add row interfaces and mapper functions for each returned shape.
6. Replace ORM reads with prepared `SELECT` statements.
7. Replace ORM writes with prepared `INSERT`, `UPDATE`, and `DELETE`
   statements.
8. Preserve stable IDs, timestamps, and foreign keys.
9. Run create, display/list, update if applicable, and delete smoke tests
   against a real SQLite file.
10. Remove Sequelize dependencies only after all application imports are gone.

For existing data, prefer a small migration script over manual edits. Keep it
boring: open the old database, create or alter the target tables, copy rows with
explicit column lists, and verify counts before deleting anything.

## Audit Expectations

After the app has fully moved to `node:sqlite`, production dependencies should
not include `sequelize` or `sqlite3` unless another package still needs them:

```bash
npm run build
npm audit --omit=dev
npm ls sequelize sqlite3
```

Expected production shape:

```text
your-service
└── @sentzunhat/zacatl@0.0.57
```

If a repo-local `file:` install points at a Zacatl checkout, `npm ls` can expose
Zacatl's development dependencies. A packed or published consumer install is the
authoritative proof for production dependency shape. In this repo,
`npm run smoke:consumers` verifies that the non-SQL and `node:sqlite` packed
consumer fixtures do not include `sequelize` or `sqlite3`.

## Docker Notes

The `node:sqlite` path uses Node 26's built-in module, so production images do
not need the native `sqlite3` package or a build toolchain for it. For
distroless-style images:

- build and run on Node 26
- mount a writable data directory for the SQLite file
- keep the SQLite path outside read-only application code
- smoke create, display/list, and delete behavior inside the container

## Checklist

- [ ] App runtime is Node 26.
- [ ] Database config uses `connection: { url, name? }`.
- [ ] Store opens SQLite with `DatabaseSync` from `node:sqlite`.
- [ ] Foreign keys are enabled with `PRAGMA foreign_keys = ON`.
- [ ] Dynamic SQL values use prepared-statement parameters.
- [ ] Row interfaces and mapper functions cover every returned shape.
- [ ] Create, display/list, update if applicable, and delete are smoke-tested.
- [ ] `sequelize` and `sqlite3` imports are gone.
- [ ] `sequelize` and `sqlite3` dependencies are removed when unused.
- [ ] `npm audit --omit=dev` is clean for the production install.
