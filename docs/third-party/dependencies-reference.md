# Zacatl Dependencies Reference

## Runtime Support

Zacatl standardizes on **Node.js 24.14.0 LTS+** with **npm**:

- **Node.js 24.14.0+** (minimum): Required for stable `node:sqlite`, improved `AsyncLocalStorage`, and native subpath imports
- **npm 10+**: Deterministic installs using `package-lock.json`

> Upgrade: `nvm install 24.14.0 && nvm use 24.14.0`

## What's Included (No Installation Needed)

When you install `@sentzunhat/zacatl`, these are **already included**:

### Core Dependencies

```typescript
import {
  singleton, // ✅ From tsyringe (re-exported)
  inject, // ✅ From tsyringe (re-exported)
  container, // ✅ From tsyringe (re-exported)
  Service, // ✅ Zacatl core
  resolveDependency, // ✅ Zacatl DI
  logger, // ✅ Pino logger
  z, // ✅ Zod validation (re-exported)
} from '@sentzunhat/zacatl';
```

### Errors

```typescript
import {
  CustomError,
  NotFoundError,
  ValidationError,
  BadRequestError,
  ForbiddenError,
  UnauthorizedError,
  InternalServerError,
  BadResourceError,
} from '@sentzunhat/zacatl/error';
```

### Configuration

```typescript
import { loadConfig } from '@sentzunhat/zacatl/configuration';
```

### Infrastructure

```typescript
import { BaseRepository, ORMType } from '@sentzunhat/zacatl';
```

---

## ORM & Platform Dependencies (Bundled)

`mongoose`, `sequelize`, `express`, `fastify`, and `better-sqlite3` are bundled
as `dependencies`. A single `npm install @sentzunhat/zacatl` is
enough — no extra install step required.

ORM and platform code is still **only loaded via subpath imports** to keep the
main entry lean:

```typescript
import { mongoose } from '@sentzunhat/zacatl/third-party/mongoose';
import { Sequelize } from '@sentzunhat/zacatl/third-party/sequelize';
```

### Database drivers (still required)

Sequelize dialect packages must be installed separately:

```bash
npm install pg pg-hstore      # PostgreSQL
npm install mysql2            # MySQL
npm install sqlite3           # SQLite via Sequelize ORM
npm install tedious           # MSSQL
```

### For Native SQLite (Node 24 Built-in — No Install Needed)

Use `DatabaseVendor.SQLITE` — no external package required. Powered by the built-in `node:sqlite` module:

```typescript
import { DatabaseVendor } from '@sentzunhat/zacatl';

databases: [
  {
    vendor: DatabaseVendor.SQLITE,
    connectionString: 'app.db', // or ':memory:'
  },
];
```

**SQLite ORM Support:** Full ORM integration via `createNodeSqliteAdapter()` factory with `BaseRepository` for type-safe CRUD operations.

```typescript
import { createNodeSqliteAdapter } from '@sentzunhat/zacatl';
import type { DatabaseSync } from 'node:sqlite';

const adapter = createNodeSqliteAdapter<InputModel, OutputModel>({
  database: dbInstance as DatabaseSync,
  tableName: 'users',
});
```

**Performance Optimization:** The `node:sqlite` module is dynamically imported only when a connection is first initiated, avoiding startup overhead for projects that don't use SQLite.

**When to use:** Lightweight embedded SQLite storage, development/testing databases, or edge server runtime environments.

---

## Common Patterns

### Pattern 1: No Database (CLI/Worker)

**Install:**

```bash
npm install @sentzunhat/zacatl
```

**Use:**

```typescript
import { Service, singleton, resolveDependency } from '@sentzunhat/zacatl';

@singleton()
class MyService {
  doWork() {
    console.log('Working...');
  }
}

const service = new Service({
  type: ServiceType.SERVER,
  layers: { domain: { services: [MyService] } },
});

await service.start();
```

**No additional dependencies needed!** ✅

---

### Pattern 2: With MongoDB

**Install:**

```bash
npm install @sentzunhat/zacatl
```

**Use:**

```typescript
import { Service, singleton, BaseRepository, ORMType } from '@sentzunhat/zacatl';
import { Schema } from '@sentzunhat/zacatl/third-party/mongoose';
import mongoose from '@sentzunhat/zacatl/third-party/mongoose';

const UserSchema = new Schema({ name: String });

@singleton()
class UserRepository extends BaseRepository<any, any, any> {
  constructor() {
    super({ type: ORMType.Mongoose, name: 'User', schema: UserSchema });
  }
}

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    infrastructure: { repositories: [UserRepository] },
  },
  platforms: {
    server: {
      name: 'app',
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: mongoose.connect('mongodb://localhost/db'),
        },
      ],
    },
  },
});
```

---

### Pattern 3: With PostgreSQL (Sequelize)

**Install:**

```bash
npm install @sentzunhat/zacatl pg pg-hstore
```

**Use:**

```typescript
import { Service, singleton, BaseRepository, ORMType } from '@sentzunhat/zacatl';
import { Sequelize, DataTypes } from '@sentzunhat/zacatl/third-party/sequelize';

const sequelize = new Sequelize('postgresql://localhost/db');

const UserModel = sequelize.define('User', {
  name: DataTypes.STRING,
});

@singleton()
class UserRepository extends BaseRepository<any, any, any> {
  constructor() {
    super({ type: ORMType.Sequelize, model: UserModel });
  }
}

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    infrastructure: { repositories: [UserRepository] },
  },
  platforms: {
    server: {
      name: 'app',
      databases: [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelize,
        },
      ],
    },
  },
});
```

---

## Quick Reference Table

| Feature               | Import From                                | Install Required?           |
| --------------------- | ------------------------------------------ | --------------------------- |
| `singleton` decorator | `@sentzunhat/zacatl`                       | ❌ No (included)            |
| `Service`             | `@sentzunhat/zacatl`                       | ❌ No (included)            |
| `BaseRepository`      | `@sentzunhat/zacatl`                       | ❌ No (included)            |
| `logger`              | `@sentzunhat/zacatl`                       | ❌ No (included)            |
| `z` (Zod)             | `@sentzunhat/zacatl`                       | ❌ No (included)            |
| `mongoose`            | `@sentzunhat/zacatl/third-party/mongoose`  | ❌ No (bundled)             |
| `Schema`              | `@sentzunhat/zacatl/third-party/mongoose`  | ❌ No (bundled)             |
| `Sequelize`           | `@sentzunhat/zacatl/third-party/sequelize` | ❌ No (bundled)             |
| Database drivers      | `pg`, `mysql2`, etc                        | ✅ Yes (if using Sequelize) |

---

## TypeScript Types

All TypeScript types are included automatically:

```typescript
import type { DependencyContainer, ZodType, ZodError, ConfigServer } from '@sentzunhat/zacatl';
```

**No `@types/*` packages needed for Zacatl core!** ✅

---

## For AI Agents: Installation Decision Tree

```
Do you need database access?
├─ NO  → npm install @sentzunhat/zacatl
│         (You're done! ✅)
│
└─ YES → What database?
    ├─ MongoDB     → npm install @sentzunhat/zacatl mongoose
    ├─ PostgreSQL  → npm install @sentzunhat/zacatl sequelize pg pg-hstore
    ├─ MySQL       → npm install @sentzunhat/zacatl sequelize mysql2
    └─ SQLite      → npm install @sentzunhat/zacatl sequelize sqlite3
```

---

## Minimal Import Example

```typescript
// Everything you need for a basic service (no database)
import { Service, singleton, resolveDependency } from '@sentzunhat/zacatl';

// That's it! No other imports needed. ✅
```

---

## Current Package Versions

### Core Runtime Dependencies

| Package            | Version | Purpose                  |
| ------------------ | ------- | ------------------------ |
| `fastify`          | ^5.7.4  | Web framework            |
| `pino`             | ^10.3.0 | Logging                  |
| `pino-pretty`      | ^13.1.3 | Pretty log formatting    |
| `zod`              | ^4.3.6  | Validation               |
| `tsyringe`         | ^4.10.0 | Dependency injection     |
| `reflect-metadata` | ^0.2.2  | DI metadata support      |
| `uuid`             | ^13.0.0 | UUID generation          |
| `i18n`             | ^0.15.3 | i18n support             |
| `js-yaml`          | ^4.1.1  | YAML parsing             |
| `config`           | ^4.1.1  | Configuration management |

### Optional Peer Dependencies

| Package          | Version | When to Use                   |
| ---------------- | ------- | ----------------------------- |
| `mongoose`       | ^9.1.6  | MongoDB/Mongoose repositories |
| `sequelize`      | ^6.0.0  | SQL database ORM              |
| `better-sqlite3` | ^12.6.2 | SQLite via Sequelize ORM      |

### Development Tools

| Tool         | Version      |
| ------------ | ------------ |
| `typescript` | ^5.9.3       |
| `node`       | 24.14.0 LTS+ |
| `npm`        | 10.0.0+      |

---

## Version Info

- **Zacatl:** see `package.json`
- **Node.js:** 24.14.0 LTS+
- **TypeScript:** 5.9.3+ (recommended)

---

**Next:** [Non-HTTP Setup Guide](../service/non-http-elegant.md) | [Repository README](../../README.md)
