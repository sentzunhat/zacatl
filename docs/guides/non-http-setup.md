# AI Agent Guide: Using Zacatl for Non-HTTP Services

> **Version:** 0.0.22+

**Target Use Case:** CLI tools, background workers, desktop apps, or any service without HTTP endpoints.

**What to Use:**

- ✅ Domain Layer (business logic, providers)
- ✅ Infrastructure Layer (repositories, database access)
- ✅ Dependency Injection
- ❌ Application Layer (skip - no HTTP handlers needed)

---

## Quick Start Template

```typescript
import { Service, resolveDependency } from "@sentzunhat/zacatl";

// 1. Define your providers (domain services)
class MyBusinessService {
  async doWork() {
    console.log("Business logic here");
  }
}

// 2. Start the service
const service = new Service({
  architecture: {
    domain: { providers: [MyBusinessService] },
  },
});

await service.start();

// 3. Resolve and use
const businessService =
  resolveDependency<MyBusinessService>("MyBusinessService");
await businessService.doWork();
```

---

## With Database Repository

```typescript
import {
  Service,
  resolveDependency,
  BaseRepository,
  ORMType,
} from "@sentzunhat/zacatl";
import { Schema } from "mongoose";
import mongoose from "mongoose";
import { singleton } from "tsyringe";

// 1. Define your data model
interface User {
  name: string;
  email: string;
}

interface UserOutput extends User {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// 2. Create repository
const UserSchema = new Schema<User>({
  name: { type: String, required: true },
  email: { type: String, required: true },
});

@singleton()
class UserRepository extends BaseRepository<User, User, UserOutput> {
  constructor() {
    super({
      type: ORMType.Mongoose,
      name: "User",
      schema: UserSchema,
    });
  }
}

// 3. Create domain service that uses repository
@singleton()
class UserService {
  constructor(private userRepo: UserRepository) {}

  async createUser(name: string, email: string) {
    return this.userRepo.create({ name, email });
  }

  async getUser(id: string) {
    return this.userRepo.findById(id);
  }
}

// 4. Setup service with database
const mongoUri = "mongodb://localhost:27017/mydb";

const service = new Service({
  architecture: {
    domain: { providers: [UserService] },
    infrastructure: { repositories: [UserRepository] },
    server: {
      name: "my-cli-tool",
      databases: [
        {
          vendor: "MONGOOSE",
          instance: mongoose.connect(mongoUri),
        },
      ],
    },
  },
});

await service.start();

// 5. Use your services
const userService = resolveDependency<UserService>("UserService");
const user = await userService.createUser("Alice", "alice@example.com");
console.log("Created user:", user);
```

---

## Dependency Injection Patterns

### Pattern 1: Constructor Injection (Recommended)

```typescript
import { singleton } from "tsyringe";

@singleton()
class EmailService {
  async sendEmail(to: string, message: string) {
    console.log(`Sending to ${to}: ${message}`);
  }
}

@singleton()
class NotificationService {
  // Dependencies injected via constructor
  constructor(
    private emailService: EmailService,
    private userRepo: UserRepository,
  ) {}

  async notifyUser(userId: string, message: string) {
    const user = await this.userRepo.findById(userId);
    if (user) {
      await this.emailService.sendEmail(user.email, message);
    }
  }
}

// Register in Service
const service = new Service({
  architecture: {
    domain: { providers: [EmailService, NotificationService] },
    infrastructure: { repositories: [UserRepository] },
  },
});
```

### Pattern 2: Manual Resolution

```typescript
import { resolveDependency } from "@sentzunhat/zacatl";

// After service.start()
const emailService = resolveDependency<EmailService>("EmailService");
await emailService.sendEmail("test@example.com", "Hello");
```

---

## Multiple Repositories

```typescript
import { Schema } from "mongoose";

// Product repository
const ProductSchema = new Schema({
  name: String,
  price: Number,
});

@singleton()
class ProductRepository extends BaseRepository<any, any, any> {
  constructor() {
    super({ type: ORMType.Mongoose, name: "Product", schema: ProductSchema });
  }
}

// Order repository
const OrderSchema = new Schema({
  userId: String,
  productId: String,
  quantity: Number,
});

@singleton()
class OrderRepository extends BaseRepository<any, any, any> {
  constructor() {
    super({ type: ORMType.Mongoose, name: "Order", schema: OrderSchema });
  }
}

// Service using both
@singleton()
class OrderService {
  constructor(
    private orderRepo: OrderRepository,
    private productRepo: ProductRepository,
    private userRepo: UserRepository,
  ) {}

  async createOrder(userId: string, productId: string, quantity: number) {
    const user = await this.userRepo.findById(userId);
    const product = await this.productRepo.findById(productId);

    if (!user || !product) {
      throw new Error("User or product not found");
    }

    return this.orderRepo.create({ userId, productId, quantity });
  }
}

// Register all
const service = new Service({
  architecture: {
    domain: { providers: [OrderService] },
    infrastructure: {
      repositories: [UserRepository, ProductRepository, OrderRepository],
    },
    server: {
      name: "order-processor",
      databases: [{ vendor: "MONGOOSE", instance: mongoose.connect(mongoUri) }],
    },
  },
});
```

---

## Configuration Loading

```typescript
import { loadConfig } from "@sentzunhat/zacatl/config";
import { z } from "zod";

// Define config schema
const ConfigSchema = z.object({
  database: z.object({
    uri: z.string(),
    name: z.string(),
  }),
  app: z.object({
    name: z.string(),
    version: z.string(),
  }),
});

// Load and validate
const config = loadConfig("./config/app.yaml", "yaml", ConfigSchema);

// Use in service
const service = new Service({
  architecture: {
    domain: { providers: [MyService] },
    server: {
      name: config.app.name,
      databases: [
        {
          vendor: "MONGOOSE",
          instance: mongoose.connect(config.database.uri),
        },
      ],
    },
  },
});
```

---

## Error Handling

```typescript
import {
  NotFoundError,
  ValidationError,
  InternalServerError,
} from "@sentzunhat/zacatl/errors";

@singleton()
class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUser(id: string) {
    if (!id) {
      throw new ValidationError("User ID is required");
    }

    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError("User not found", { userId: id });
    }

    return user;
  }

  async processUser(id: string) {
    try {
      const user = await this.getUser(id);
      // Process user...
      return user;
    } catch (error) {
      if (error instanceof NotFoundError) {
        console.error("User does not exist:", error.metadata);
        return null;
      }
      throw new InternalServerError("Failed to process user", {
        originalError: error,
      });
    }
  }
}
```

---

## Logging

```typescript
import { logger } from "@sentzunhat/zacatl";

@singleton()
class BackgroundWorker {
  async processJobs() {
    logger.info("Starting job processing");

    try {
      // Do work
      logger.info("Job completed successfully");
    } catch (error) {
      logger.error("Job failed", { error });
    }
  }
}
```

---

## Complete CLI Example

```typescript
#!/usr/bin/env node
import { Service, resolveDependency } from "@sentzunhat/zacatl";
import { BaseRepository, ORMType } from "@sentzunhat/zacatl/infrastructure";
import { loadConfig } from "@sentzunhat/zacatl/config";
import { logger } from "@sentzunhat/zacatl";
import { Schema } from "mongoose";
import mongoose from "mongoose";
import { singleton } from "tsyringe";
import { z } from "zod";

// Config
const ConfigSchema = z.object({
  mongodb: z.string(),
});

const config = loadConfig("./config.yaml", "yaml", ConfigSchema);

// Repository
const TaskSchema = new Schema({
  title: String,
  completed: Boolean,
});

@singleton()
class TaskRepository extends BaseRepository<any, any, any> {
  constructor() {
    super({ type: ORMType.Mongoose, name: "Task", schema: TaskSchema });
  }
}

// Service
@singleton()
class TaskService {
  constructor(private taskRepo: TaskRepository) {}

  async addTask(title: string) {
    return this.taskRepo.create({ title, completed: false });
  }

  async listTasks() {
    // Note: You'd add a findMany method to your repository
    const model = this.taskRepo.getMongooseModel();
    return model.find();
  }

  async completeTask(id: string) {
    return this.taskRepo.update(id, { completed: true });
  }
}

// CLI Main
async function main() {
  const service = new Service({
    architecture: {
      domain: { providers: [TaskService] },
      infrastructure: { repositories: [TaskRepository] },
      server: {
        name: "task-cli",
        databases: [
          {
            vendor: "MONGOOSE",
            instance: mongoose.connect(config.mongodb),
          },
        ],
      },
    },
  });

  await service.start();

  const taskService = resolveDependency<TaskService>("TaskService");

  const command = process.argv[2];

  switch (command) {
    case "add":
      const title = process.argv[3];
      const task = await taskService.addTask(title);
      logger.info("Task added", { task });
      break;

    case "list":
      const tasks = await taskService.listTasks();
      console.log("Tasks:", tasks);
      break;

    case "complete":
      const id = process.argv[3];
      await taskService.completeTask(id);
      logger.info("Task completed", { id });
      break;

    default:
      console.log("Usage: task-cli [add|list|complete] [args]");
  }

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((error) => {
  logger.error("CLI failed", { error });
  process.exit(1);
});
```

---

## Key Rules for AI Agents

1. **No Application Layer**: Skip `application` in the service config - it's only for HTTP
2. **Always use `@singleton()`**: Decorate all providers and repositories
3. **Constructor Injection**: Dependencies auto-injected via constructor
4. **Call `service.start()`**: Must be called before using `resolveDependency()`
5. **Repository Initialization**: First async method call initializes the adapter
6. **Import Paths**:
   - `import { Service, resolveDependency } from "@sentzunhat/zacatl"`
   - `import { BaseRepository, ORMType } from "@sentzunhat/zacatl/infrastructure"`
   - `import { loadConfig } from "@sentzunhat/zacatl/config"`
   - `import { CustomError, NotFoundError, etc } from "@sentzunhat/zacatl/errors"`

---

## Common Patterns

### Background Worker

```typescript
@singleton()
class EmailWorker {
  constructor(private emailService: EmailService) {}

  async processQueue() {
    setInterval(async () => {
      // Process emails
      await this.emailService.sendPendingEmails();
    }, 5000);
  }
}

const service = new Service({
  architecture: {
    domain: { providers: [EmailWorker, EmailService] },
  },
});

await service.start();

const worker = resolveDependency<EmailWorker>("EmailWorker");
await worker.processQueue();
```

### Data Migration Script

```typescript
@singleton()
class MigrationService {
  constructor(
    private oldRepo: OldDataRepository,
    private newRepo: NewDataRepository,
  ) {}

  async migrate() {
    const oldModel = this.oldRepo.getMongooseModel();
    const oldData = await oldModel.find();

    for (const item of oldData) {
      await this.newRepo.create({
        // Transform data
        newField: item.oldField,
      });
    }
  }
}

// Run migration
const service = new Service({
  architecture: {
    domain: { providers: [MigrationService] },
    infrastructure: { repositories: [OldDataRepository, NewDataRepository] },
    server: {
      name: "migration",
      databases: [{ vendor: "MONGOOSE", instance: mongoose.connect(uri) }],
    },
  },
});

await service.start();
const migration = resolveDependency<MigrationService>("MigrationService");
await migration.migrate();
```

---

## Troubleshooting

### "Repository not initialized"

- **Cause**: Accessing model before calling async method
- **Fix**: Call `await repo.findById("init")` or any async method first

### "TypeInfo not known"

- **Cause**: Missing `@singleton()` decorator
- **Fix**: Add decorator to all providers and repositories

### Dependency not found

- **Cause**: Not registered in Service config
- **Fix**: Add to `domain.providers` or `infrastructure.repositories` array

### Import errors

- **Cause**: Wrong import path
- **Fix**: Use documented import paths above

---

## Next Steps

- 📖 [Full Documentation](../index.md)
- 🏗️ [Architecture Overview](../architecture/framework-overview.md)
- 🧪 [Testing Guide](../testing/README.md)
- 🔍 [Examples](../examples/README.md)
