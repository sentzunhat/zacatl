# Zacatl Dependencies Reference

## Runtime Support

Zacatl standardizes on **Node.js 26.0.0+** with **npm**:

- **Node.js 26.0.0+** (minimum): Required for the current branch baseline and publish/tooling flow
- **npm 11+**: Deterministic installs using `package-lock.json`

> Upgrade: `nvm install 26 && nvm use 26`

## What's Available After Install

When you install `@sentzunhat/zacatl`, core runtime modules are available.
Some ORM/database integrations are optional peers and should be installed by usage.

### Core Dependencies

```typescript
import {
  singleton,
  inject,
  container,
} from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import { z } from '@sentzunhat/zacatl/third-party/zod';
import { Service } from '@sentzunhat/zacatl/service';
import { resolveDependency } from '@sentzunhat/zacatl/dependency-injection';
import { logger } from '@sentzunhat/zacatl/logs';
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
import { loadJSON, loadYML } from '@sentzunhat/zacatl/configuration';
```

### Infrastructure

```typescript
import { BaseRepository as MongooseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/mongoose/repository';
import { ORMType } from '@sentzunhat/zacatl/service/layers/infrastructure/orm/types';
import type { LeanDocument } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/types';
```

---

## ORM And Platform Dependencies

`express` and `fastify` are installed with Zacatl.
ORM/database ecosystems are optional peer dependencies (`mongoose`, `mongodb`,
`sequelize`, `sqlite3`, `pg`) and should be installed based on usage.

ORM and platform code is still **only loaded via subpath imports** to keep the
main entry lean:

```typescript
import { mongoose } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import { Sequelize } from '@sentzunhat/zacatl/third-party/databases/sequelize';
```

### Database drivers (still required)

Sequelize dialect packages must be installed separately:

```bash
npm install sequelize pg      # PostgreSQL
npm install sequelize mysql2  # MySQL
npm install sequelize sqlite3 # SQLite via Sequelize ORM
npm install sequelize tedious # MSSQL
```

### For Native SQLite (Node 26 Built-in — No Install Needed)

Use `DatabaseVendor.SQLITE` — no external package required. Powered by the
built-in `node:sqlite` module on Zacatl's Node 26 runtime:

```typescript
import { DatabaseVendor } from '@sentzunhat/zacatl/service';

databases: [
  {
    vendor: DatabaseVendor.SQLITE,
    connection: { url: 'app.db' }, // or ':memory:'
  },
];
```

**SQLite repository support:** Extend the Node.js SQLite repository wrapper for the usual application path. The adapter factory is available for lower-level integrations.

```typescript
import { BaseRepository as NodeSqliteRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/nodesqlite/repository';
import { createNodeSqliteAdapter } from '@sentzunhat/zacatl/service/layers/infrastructure/orm/nodesqlite/adapter-loader';

class UserRepository extends NodeSqliteRepository<CreateUser, UserDTO> {
  constructor() {
    super({ name: 'users' });
  }
}

// Low-level integrations provide repository configuration; the adapter
// resolves the registered DatabaseSync instance from Zacatl's DI scope.
const adapter = createNodeSqliteAdapter<CreateUser, UserDTO>({ name: 'users' });
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
import { resolveDependency } from '@sentzunhat/zacatl/dependency-injection';
import { Service } from '@sentzunhat/zacatl/service';
import { ServerType, ServerVendor } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';
import { Fastify } from '@sentzunhat/zacatl/third-party/fastify';
import { singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';

@singleton()
class MyService {
  doWork() {
    console.log('Working...');
  }
}

const service = new Service({
  type: ServiceType.SERVER,
  layers: { domain: { services: [MyService] } },
  platforms: {
    server: {
      name: 'worker',
      server: { type: ServerType.SERVER, vendor: ServerVendor.FASTIFY, instance: Fastify() },
      databases: [],
    },
  },
});

await service.start();
```

**No additional dependencies needed!** ✅

---

### Pattern 2: With MongoDB

**Install:**

```bash
npm install @sentzunhat/zacatl mongoose
```

**Use:**

```typescript
import { Service, DatabaseVendor, ServiceType } from '@sentzunhat/zacatl/service';
import { ServerType, ServerVendor } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';
import { BaseRepository as MongooseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/mongoose/repository';
import { ORMType } from '@sentzunhat/zacatl/service/layers/infrastructure/orm/types';
import { Fastify } from '@sentzunhat/zacatl/third-party/fastify';
import { singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';

const UserSchema = new Schema({ name: String });

@singleton()
class UserRepository extends MongooseRepository<User, CreateUser, UserDTO> {
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
      server: { type: ServerType.SERVER, vendor: ServerVendor.FASTIFY, instance: Fastify() },
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: mongoose,
          connection: { url: 'mongodb://localhost/db' },
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
import { Service, DatabaseVendor, ServiceType } from '@sentzunhat/zacatl/service';
import { ServerType, ServerVendor } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';
import { BaseRepository as SequelizeRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/sequelize/repository';
import { ORMType } from '@sentzunhat/zacatl/service/layers/infrastructure/orm/types';
import { Fastify } from '@sentzunhat/zacatl/third-party/fastify';
import { singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import { Sequelize, DataTypes, Model } from '@sentzunhat/zacatl/third-party/databases/sequelize';

const sequelize = new Sequelize('postgresql://localhost/db');

class UserModel extends Model {}

UserModel.init({ name: DataTypes.STRING }, { sequelize, modelName: 'User' });

@singleton()
class UserRepository extends SequelizeRepository<UserModel, CreateUser, UserDTO> {
  constructor() {
    super({
      type: ORMType.Sequelize,
      name: 'User',
    });
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
      server: { type: ServerType.SERVER, vendor: ServerVendor.FASTIFY, instance: Fastify() },
      databases: [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelize,
          connection: { url: 'postgresql://localhost/db' },
        },
      ],
    },
  },
});
```

---

## Quick Reference Table

| Feature               | Import From                                                    | Install Required?           |
| --------------------- | -------------------------------------------------------------- | --------------------------- |
| `singleton` decorator | `@sentzunhat/zacatl/third-party/dependency-injection/tsyringe` | ❌ No (included)            |
| `Service`             | `@sentzunhat/zacatl/service`                                   | ❌ No (included)            |
| ORM repository wrapper | `@sentzunhat/zacatl/service/layers/infrastructure/repositories/{mongoose,sequelize,nodesqlite}/repository` | ❌ No (included) |
| `logger`              | `@sentzunhat/zacatl/logs`                                      | ❌ No (included)            |
| `z` (Zod)             | `@sentzunhat/zacatl/third-party/zod`                           | ❌ No (included)            |
| `mongoose`            | `@sentzunhat/zacatl/third-party/databases/mongoose`            | ✅ Yes (optional peer)      |
| `Schema`              | `@sentzunhat/zacatl/third-party/databases/mongoose`            | ✅ Yes (optional peer)      |
| `Sequelize`           | `@sentzunhat/zacatl/third-party/databases/sequelize`           | ✅ Yes (optional peer)      |
| Database drivers      | `pg`, `mysql2`, etc                                            | ✅ Yes (if using Sequelize) |

---

## TypeScript Types

All TypeScript types are included automatically:

```typescript
import type { ServerConfig } from '@sentzunhat/zacatl/service/platforms/server/server';
import { DependencyContainer } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import { ZodType, ZodError } from '@sentzunhat/zacatl/third-party/zod';
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
import { resolveDependency } from '@sentzunhat/zacatl/dependency-injection';
import { Service } from '@sentzunhat/zacatl/service';
import { singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';

// That's it! No other imports needed. ✅
```

---

## Current Package Versions

### Core Runtime Dependencies

| Package            | Version | Purpose               |
| ------------------ | ------- | --------------------- |
| `fastify`          | ^5.7.4  | Web framework         |
| `pino`             | ^10.3.0 | Logging               |
| `pino-pretty`      | ^13.1.3 | Pretty log formatting |
| `zod`              | ^4.3.6  | Validation            |
| `tsyringe`         | ^4.10.0 | Dependency injection  |
| `reflect-metadata` | ^0.2.2  | DI metadata support   |
| `uuid`             | ^14.0.0 | UUID generation       |
| `i18n`             | ^0.15.3 | i18n support          |
| `js-yaml`          | ^4.1.1  | YAML parsing          |

### Optional Peer Dependencies

| Package     | Version | When to Use                   |
| ----------- | ------- | ----------------------------- |
| `mongoose`  | ^9.0.0  | MongoDB/Mongoose repositories |
| `sequelize` | ^6.0.0  | SQL database ORM              |
| `sqlite3`   | ^6.0.1  | SQLite ecosystem support      |
| `mongodb`   | ^7.2.0  | Native MongoDB driver support |
| `pg`        | ^8.18.0 | PostgreSQL ecosystem support  |

### Development Tools

| Tool         | Version |
| ------------ | ------- |
| `typescript` | ^5.9.3  |
| `node`       | 26.0.0+ |
| `npm`        | 11.0.0+ |

---

## Version Info

- **Zacatl:** see `package.json`
- **Node.js:** 26.0.0+
- **TypeScript:** 5.9.3+ (recommended)

---

**Next:** [Non-HTTP Setup Guide](../service/non-http-elegant.md) | [Repository README](../../README.md)
