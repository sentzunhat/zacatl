# Zacatl for Non-HTTP Services

> **Elegant dependency injection for CLI tools, workers, and scripts**  
> **Version:** 0.0.22+

---

## Installation

```bash
npm install @sentzunhat/zacatl@latest
# Requires v0.0.22+ for ESM compatibility
```

---

## The Pattern

Zacatl = **3 Blocks + 1 Engine**

```
Providers      → Business logic
Repositories   → Data access
Service        → DI Engine (wires everything)
```

---

## 1. Providers (Business Logic)

```typescript
import { singleton } from "tsyringe";

@singleton()
class EmailService {
  send(to: string, message: string) {
    console.log(`📧 ${to}: ${message}`);
  }
}

@singleton()
class NotificationService {
  constructor(private email: EmailService) {} // ← Auto-injected

  notify(user: string, msg: string) {
    this.email.send(user, msg);
  }
}
```

**Rules:**

- `@singleton()` decorator required
- Dependencies via constructor
- No manual wiring needed

---

## 2. Repositories (Data Access)

```typescript
import { singleton, BaseRepository, ORMType } from "@sentzunhat/zacatl";
import { Schema } from "mongoose";

const UserSchema = new Schema({
  name: String,
  email: String,
});

@singleton()
class UserRepository extends BaseRepository<any, any, any> {
  constructor() {
    super({
      type: ORMType.Mongoose,
      name: "User",
      schema: UserSchema,
    });
  }
}
```

**Rules:**

- Extend `BaseRepository`
- `@singleton()` decorator required
- First async call initializes adapter

---

## 3. Service (DI Engine)

```typescript
import { Service, resolveDependency } from "@sentzunhat/zacatl";
import mongoose from "mongoose";

const service = new Service({
  architecture: {
    domain: {
      providers: [EmailService, NotificationService],
    },
    infrastructure: {
      repositories: [UserRepository],
    },
    server: {
      name: "my-app",
      databases: [
        {
          vendor: "MONGOOSE",
          instance: mongoose.connect("mongodb://localhost/db"),
        },
      ],
    },
  },
});

await service.start(); // ← Must call before resolving

// Now use anywhere
const notify = resolveDependency<NotificationService>("NotificationService");
notify.notify("user@example.com", "Hello!");
```

**Rules:**

- Call `service.start()` once
- Resolve dependencies after start
- No HTTP config needed (skip `application`)

---

## Complete Patterns

### Pattern A: Simple CLI (No Database)

```typescript
import { Service, resolveDependency } from "@sentzunhat/zacatl";
import { singleton } from "tsyringe";

@singleton()
class Calculator {
  add(a: number, b: number) {
    return a + b;
  }
}

const service = new Service({
  architecture: {
    domain: { providers: [Calculator] },
  },
});

await service.start();

const calc = resolveDependency<Calculator>("Calculator");
console.log(calc.add(2, 3)); // 5
```

### Pattern B: Worker with Database

```typescript
import { Service, resolveDependency } from "@sentzunhat/zacatl";
import { BaseRepository, ORMType } from "@sentzunhat/zacatl/infrastructure";
import { Schema } from "mongoose";
import mongoose from "mongoose";
import { singleton } from "tsyringe";

// Repository
const TaskSchema = new Schema({ name: String, done: Boolean });

@singleton()
class TaskRepository extends BaseRepository<any, any, any> {
  constructor() {
    super({ type: ORMType.Mongoose, name: "Task", schema: TaskSchema });
  }
}

// Service
@singleton()
class TaskWorker {
  constructor(private tasks: TaskRepository) {}

  async process() {
    const task = await this.tasks.create({ name: "Work", done: false });
    console.log("Created:", task);
  }
}

// Engine
const service = new Service({
  architecture: {
    domain: { providers: [TaskWorker] },
    infrastructure: { repositories: [TaskRepository] },
    server: {
      name: "worker",
      databases: [
        {
          vendor: "MONGOOSE",
          instance: mongoose.connect("mongodb://localhost/tasks"),
        },
      ],
    },
  },
});

await service.start();

const worker = resolveDependency<TaskWorker>("TaskWorker");
await worker.process();
```

### Pattern C: Nested Dependencies

```typescript
@singleton()
class Logger {
  log(msg: string) {
    console.log(`[LOG] ${msg}`);
  }
}

@singleton()
class Database {
  constructor(private logger: Logger) {}

  async query(sql: string) {
    this.logger.log(`Querying: ${sql}`);
    return [];
  }
}

@singleton()
class UserService {
  constructor(
    private db: Database,
    private logger: Logger,
  ) {}

  async getUser(id: string) {
    this.logger.log(`Getting user ${id}`);
    return this.db.query(`SELECT * FROM users WHERE id = ${id}`);
  }
}

// Wire it up
const service = new Service({
  architecture: {
    domain: { providers: [Logger, Database, UserService] },
  },
});

await service.start();

const users = resolveDependency<UserService>("UserService");
await users.getUser("123");
```

**Auto-wires:** Logger → Database → UserService

---

## Configuration

```typescript
import { loadConfig } from "@sentzunhat/zacatl/config";
import { z } from "zod";

const ConfigSchema = z.object({
  db: z.string(),
  apiKey: z.string(),
});

const config = loadConfig("./config.yaml", "yaml", ConfigSchema);

const service = new Service({
  architecture: {
    domain: { providers: [MyService] },
    server: {
      name: "app",
      databases: [
        {
          vendor: "MONGOOSE",
          instance: mongoose.connect(config.db),
        },
      ],
    },
  },
});
```

---

## Error Handling

```typescript
import { NotFoundError, ValidationError } from "@sentzunhat/zacatl/errors";

@singleton()
class UserService {
  constructor(private repo: UserRepository) {}

  async getUser(id: string) {
    if (!id) throw new ValidationError("ID required");

    const user = await this.repo.findById(id);
    if (!user) throw new NotFoundError("User not found", { id });

    return user;
  }
}
```

---

## Logging

```typescript
import { logger } from "@sentzunhat/zacatl";

@singleton()
class Worker {
  async run() {
    logger.info("Worker started");
    logger.error("Something failed", { details: "..." });
  }
}
```

---

## Key Rules for AI Agents

| Rule                          | Why                     |
| ----------------------------- | ----------------------- |
| `@singleton()` on all classes | Enables DI              |
| Constructor injection         | Auto-wires dependencies |
| `await service.start()`       | Initialize container    |
| No `application` layer        | HTTP only               |
| First repo async call         | Initializes adapter     |

---

## Minimal Templates

### Template: CLI Tool

```typescript
#!/usr/bin/env node
import { Service, resolveDependency } from "@sentzunhat/zacatl";
import { singleton } from "tsyringe";

@singleton()
class CLI {
  run(args: string[]) {
    console.log("Args:", args);
  }
}

const service = new Service({
  architecture: { domain: { providers: [CLI] } },
});

await service.start();
resolveDependency<CLI>("CLI").run(process.argv.slice(2));
```

### Template: Background Job

```typescript
import { Service, resolveDependency } from "@sentzunhat/zacatl";
import { singleton } from "tsyringe";

@singleton()
class Job {
  async process() {
    setInterval(() => console.log("Job running..."), 5000);
  }
}

const service = new Service({
  architecture: { domain: { providers: [Job] } },
});

await service.start();
await resolveDependency<Job>("Job").process();
```

### Template: Data Migration

```typescript
import { Service, resolveDependency } from "@sentzunhat/zacatl";
import { BaseRepository, ORMType } from "@sentzunhat/zacatl/infrastructure";
import mongoose from "mongoose";
import { singleton } from "tsyringe";

@singleton()
class Migration {
  constructor(private sourceRepo: SourceRepository) {}

  async run() {
    const data = await this.sourceRepo.getMongooseModel().find();
    // Transform and migrate
    console.log(`Migrated ${data.length} records`);
  }
}

const service = new Service({
  architecture: {
    domain: { providers: [Migration] },
    infrastructure: { repositories: [SourceRepository] },
    server: {
      name: "migration",
      databases: [{ vendor: "MONGOOSE", instance: mongoose.connect(uri) }],
    },
  },
});

await service.start();
await resolveDependency<Migration>("Migration").run();
```

---

## Troubleshooting

| Error                        | Fix                                                 |
| ---------------------------- | --------------------------------------------------- |
| `TypeInfo not known`         | Add `@singleton()` decorator                        |
| `Repository not initialized` | Call async method first: `await repo.findById("x")` |
| Dependency not found         | Add to `providers` or `repositories` array          |

---

## Import Cheat Sheet

```typescript
// Core
import { Service, resolveDependency } from "@sentzunhat/zacatl";

// DI (singleton decorator)
import { singleton } from "@sentzunhat/zacatl";
// Or import directly from tsyringe (same thing)
// import { singleton } from "tsyringe";

// Repositories
import { BaseRepository, ORMType } from "@sentzunhat/zacatl/infrastructure";

// Config
import { loadConfig } from "@sentzunhat/zacatl/config";

// Errors
import { NotFoundError, ValidationError } from "@sentzunhat/zacatl/errors";

// Logging
import { logger } from "@sentzunhat/zacatl";

// Database
import mongoose from "mongoose";
import { Schema } from "mongoose";
```

---

## Architecture Flow

```
┌──────────────────────────────────────────┐
│  Providers (domain/providers)            │
│  - Business logic                        │
│  - Services                              │
│  - Workers                               │
├──────────────────────────────────────────┤
│  Repositories (infrastructure/repos)     │
│  - Data access                           │
│  - Database queries                      │
├──────────────────────────────────────────┤
│  Service (DI Container)                  │
│  - Auto-wires everything                 │
│  - Manages lifecycle                     │
└──────────────────────────────────────────┘

No HTTP? Skip: application layer
```

---

**Next:** [Full Documentation](../INDEX.md) | [Examples](../examples/README.md)
