# Zacatl Dependencies Reference (v0.0.32+)

## Runtime Support

Zacatl supports both **Node.js** and **Bun** runtimes:

- **Node.js 24+**: Uses compiled JavaScript from `build/` directory (requires `npm run build`)
- **Bun 1.x**: Uses TypeScript source directly from `src/` directory (no build step needed)
  - Native TypeScript transpilation
  - Automatic path alias resolution (`@zacatl/*`)
  - Faster development and Docker builds

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
} from "@sentzunhat/zacatl";
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
} from "@sentzunhat/zacatl/errors";
```

### Configuration

```typescript
import { loadConfig } from "@sentzunhat/zacatl/config";
```

### Infrastructure

```typescript
import { BaseRepository, ORMType } from "@sentzunhat/zacatl/infrastructure";
```

---

## What You Need to Install (Optional Peer Dependencies)

### For Mongoose (MongoDB)

```bash
npm install mongoose
```

```typescript
import mongoose from "mongoose";
import { Schema } from "mongoose";

const UserSchema = new Schema({ name: String });
mongoose.connect("mongodb://localhost/db");
```

**When to install:** Using `ORMType.Mongoose` in repositories

---

### For Sequelize (SQL Databases)

```bash
npm install sequelize
# Plus your database driver:
npm install pg pg-hstore      # PostgreSQL
npm install mysql2            # MySQL
npm install sqlite3           # SQLite
npm install tedious           # MSSQL
```

```typescript
import { Sequelize } from "sequelize";

const sequelize = new Sequelize("postgresql://localhost/db");
```

**When to install:** Using `ORMType.Sequelize` in repositories

---

## Common Patterns

### Pattern 1: No Database (CLI/Worker)

**Install:**

```bash
npm install @sentzunhat/zacatl
```

**Use:**

```typescript
import { Service, singleton, resolveDependency } from "@sentzunhat/zacatl";

@singleton()
class MyService {
  doWork() {
    console.log("Working...");
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
npm install @sentzunhat/zacatl mongoose
```

**Use:**

```typescript
import {
  Service,
  singleton,
  BaseRepository,
  ORMType,
} from "@sentzunhat/zacatl";
import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({ name: String });

@singleton()
class UserRepository extends BaseRepository<any, any, any> {
  constructor() {
    super({ type: ORMType.Mongoose, name: "User", schema: UserSchema });
  }
}

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    infrastructure: { repositories: [UserRepository] },
  },
  platforms: {
    server: {
      name: "app",
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: mongoose.connect("mongodb://localhost/db"),
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
npm install @sentzunhat/zacatl sequelize pg pg-hstore
```

**Use:**

```typescript
import {
  Service,
  singleton,
  BaseRepository,
  ORMType,
} from "@sentzunhat/zacatl";
import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize("postgresql://localhost/db");

const UserModel = sequelize.define("User", {
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
      name: "app",
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

| Feature               | Import From          | Install Required?           |
| --------------------- | -------------------- | --------------------------- |
| `singleton` decorator | `@sentzunhat/zacatl` | ❌ No (included)            |
| `Service`             | `@sentzunhat/zacatl` | ❌ No (included)            |
| `BaseRepository`      | `@sentzunhat/zacatl` | ❌ No (included)            |
| `logger`              | `@sentzunhat/zacatl` | ❌ No (included)            |
| `z` (Zod)             | `@sentzunhat/zacatl` | ❌ No (included)            |
| `mongoose`            | `mongoose`           | ✅ Yes (optional)           |
| `Schema`              | `mongoose`           | ✅ Yes (optional)           |
| `Sequelize`           | `sequelize`          | ✅ Yes (optional)           |
| Database drivers      | `pg`, `mysql2`, etc  | ✅ Yes (if using Sequelize) |

---

## TypeScript Types

All TypeScript types are included automatically:

```typescript
import type {
  DependencyContainer,
  ZodSchema,
  ZodError,
  ConfigServer,
} from "@sentzunhat/zacatl";
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
import { Service, singleton, resolveDependency } from "@sentzunhat/zacatl";

// That's it! No other imports needed. ✅
```

---

## Current Package Versions (v0.0.32)

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
| `i18next`          | ^25.8.4 | Advanced i18n            |
| `js-yaml`          | ^4.1.1  | YAML parsing             |
| `config`           | ^4.1.1  | Configuration management |

### Optional Peer Dependencies

| Package          | Version | When to Use                   |
| ---------------- | ------- | ----------------------------- |
| `mongoose`       | ^9.1.6  | MongoDB/Mongoose repositories |
| `sequelize`      | ^6.0.0  | SQL database ORM              |
| `better-sqlite3` | ^12.6.2 | Embedded SQLite               |

### Development Tools

| Tool         | Version         |
| ------------ | --------------- |
| `typescript` | ^5.9.3          |
| `node`       | 24.0.0+         |
| `npm`        | 10.9.0+         |
| `bun`        | 1.x+ (optional) |

---

## Version Info

- **Zacatl:** 0.0.32
- **Node.js:** 24.0.0+
- **TypeScript:** 5.9.3+ (recommended)
- **Bun:** Latest (optional, for faster package management)

---

**Next:** [Non-HTTP Setup Guide](./non-http-elegant.md) | [Full Docs](../index.md)
