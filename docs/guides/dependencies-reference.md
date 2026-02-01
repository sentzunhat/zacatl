# Zacatl Dependencies Reference (v0.0.22+)

## What's Included (No Installation Needed)

When you install `@sentzunhat/zacatl`, these are **already included**:

### Core Dependencies
```typescript
import { 
  singleton,        // ✅ From tsyringe (re-exported)
  inject,          // ✅ From tsyringe (re-exported)
  container,       // ✅ From tsyringe (re-exported)
  Service,         // ✅ Zacatl core
  resolveDependency, // ✅ Zacatl DI
  logger,          // ✅ Pino logger
  z,               // ✅ Zod validation (re-exported)
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
import { 
  BaseRepository, 
  ORMType 
} from "@sentzunhat/zacatl/infrastructure";
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
  doWork() { console.log("Working..."); }
}

const service = new Service({
  architecture: { domain: { providers: [MyService] } },
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
import { Service, singleton, BaseRepository, ORMType } from "@sentzunhat/zacatl";
import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({ name: String });

@singleton()
class UserRepository extends BaseRepository<any, any, any> {
  constructor() {
    super({ type: ORMType.Mongoose, name: "User", schema: UserSchema });
  }
}

const service = new Service({
  architecture: {
    infrastructure: { repositories: [UserRepository] },
    server: {
      name: "app",
      databases: [{
        vendor: "MONGOOSE",
        instance: mongoose.connect("mongodb://localhost/db"),
      }],
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
import { Service, singleton, BaseRepository, ORMType } from "@sentzunhat/zacatl";
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
  architecture: {
    infrastructure: { repositories: [UserRepository] },
    server: {
      name: "app",
      databases: [{
        vendor: "SEQUELIZE",
        instance: sequelize,
      }],
    },
  },
});
```

---

## Quick Reference Table

| Feature | Import From | Install Required? |
|---------|-------------|-------------------|
| `singleton` decorator | `@sentzunhat/zacatl` | ❌ No (included) |
| `Service` | `@sentzunhat/zacatl` | ❌ No (included) |
| `BaseRepository` | `@sentzunhat/zacatl` | ❌ No (included) |
| `logger` | `@sentzunhat/zacatl` | ❌ No (included) |
| `z` (Zod) | `@sentzunhat/zacatl` | ❌ No (included) |
| `mongoose` | `mongoose` | ✅ Yes (optional) |
| `Schema` | `mongoose` | ✅ Yes (optional) |
| `Sequelize` | `sequelize` | ✅ Yes (optional) |
| Database drivers | `pg`, `mysql2`, etc | ✅ Yes (if using Sequelize) |

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
import { 
  Service, 
  singleton, 
  resolveDependency 
} from "@sentzunhat/zacatl";

// That's it! No other imports needed. ✅
```

---

## Version Info

- **Zacatl:** 0.0.22+
- **Node.js:** 24.0.0+
- **TypeScript:** 5.9.3+ (recommended)
- **Bun:** Latest (optional, for faster package management)

---

**Next:** [Non-HTTP Setup Guide](./non-http-elegant.md) | [Full Docs](../INDEX.md)
