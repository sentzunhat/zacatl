# AI Agent Guide: Scaffolding HTTP Services with Zacatl

> **Version:** 0.0.23+  
> **Reference:** Production-tested structure from ictlan-service

**Target Use Case:** REST APIs, HTTP microservices, web servers with clean hexagonal architecture.

**What You Get:**

- ✅ Application Layer (route handlers, hooks, schemas)
- ✅ Domain Layer (entities, providers, business logic)
- ✅ Infrastructure Layer (repositories, jobs, migrations)
- ✅ Automatic DI container setup
- ✅ Fastify server with best practices

---

## Table of Contents

1. [Quick Start: Minimal HTTP Service](#quick-start-minimal-http-service)
2. [Single-Area Structure](#single-area-structure-recommended-for-simple-projects)
3. [Multi-Area Structure](#multi-area-structure-production-reference)
4. [Critical Wiring Checklist](#critical-wiring-checklist)
5. [File-by-File Breakdown](#file-by-file-breakdown)
6. [Common Patterns](#common-patterns)

---

## Quick Start: Minimal HTTP Service

**Use case:** Single-domain API with a few endpoints (e.g., task manager, blog API)

### File Structure

```
src/
├── server.ts                    # Entry point
├── service.ts                   # Service configuration
└── tasks/                       # Your domain area
    ├── application/
    │   └── route-handlers/
    │       ├── create-task/
    │       │   ├── handler.ts
    │       │   └── schema.ts
    │       ├── list-tasks/
    │       │   ├── handler.ts
    │       │   └── schema.ts
    │       └── routes.ts        # Aggregates all routes
    ├── domain/
    │   ├── entities/
    │   │   └── task.entity.ts
    │   └── providers/
    │       ├── task.service.ts
    │       └── providers.ts     # DI registration
    └── infrastructure/
        └── repositories/
            ├── task.repository.ts
            └── repositories.ts  # DI registration
```

### 1. Entry Point (`src/server.ts`)

```typescript
import { buildService } from "./service.js";

async function start() {
  const service = await buildService();
  await service.start();
}

start().catch((error) => {
  console.error("Failed to start service:", error);
  process.exit(1);
});
```

### 2. Service Configuration (`src/service.ts`)

```typescript
import { Service } from "@sentzunhat/zacatl";
import { taskRoutes } from "./tasks/application/route-handlers/routes.js";
import { taskProviders } from "./tasks/domain/providers/providers.js";
import { taskRepositories } from "./tasks/infrastructure/repositories/repositories.js";

export async function buildService() {
  const service = new Service({
    architecture: {
      application: {
        routes: [taskRoutes],
      },
      domain: {
        providers: taskProviders,
      },
      infrastructure: {
        repositories: taskRepositories,
      },
    },
  });

  return service;
}
```

### 3. Entity (`src/tasks/domain/entities/task.entity.ts`)

```typescript
export interface Task {
  title: string;
  description?: string;
  completed: boolean;
}

export interface TaskOutput extends Task {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. Repository (`src/tasks/infrastructure/repositories/task.repository.ts`)

```typescript
import { singleton } from "tsyringe";
import { BaseRepository, ORMType } from "@sentzunhat/zacatl";
import { Schema } from "mongoose";
import type { Task, TaskOutput } from "../../domain/entities/task.entity.js";

const TaskSchema = new Schema<Task>({
  title: { type: String, required: true },
  description: { type: String },
  completed: { type: Boolean, default: false },
});

@singleton()
export class TaskRepository extends BaseRepository<Task, Task, TaskOutput> {
  constructor() {
    super({
      type: ORMType.Mongoose,
      name: "Task",
      schema: TaskSchema,
    });
  }
}
```

**DI Registration** (`src/tasks/infrastructure/repositories/repositories.ts`):

```typescript
import { TaskRepository } from "./task.repository.js";

export const taskRepositories = [TaskRepository];
```

### 5. Domain Service (`src/tasks/domain/providers/task.service.ts`)

```typescript
import { singleton } from "tsyringe";
import { TaskRepository } from "../../infrastructure/repositories/task.repository.js";
import type { Task } from "../entities/task.entity.js";

@singleton()
export class TaskService {
  constructor(private taskRepo: TaskRepository) {}

  async createTask(data: Task) {
    return this.taskRepo.create(data);
  }

  async getAllTasks() {
    return this.taskRepo.findMany();
  }

  async getTaskById(id: string) {
    return this.taskRepo.findById(id);
  }

  async updateTask(id: string, updates: Partial<Task>) {
    return this.taskRepo.update(id, updates);
  }

  async deleteTask(id: string) {
    return this.taskRepo.delete(id);
  }
}
```

**DI Registration** (`src/tasks/domain/providers/providers.ts`):

```typescript
import { TaskService } from "./task.service.js";

export const taskProviders = [TaskService];
```

### 6. Route Handlers

**Schema** (`src/tasks/application/route-handlers/create-task/schema.ts`):

```typescript
import { Type } from "@sinclair/typebox";

export const CreateTaskSchema = {
  body: Type.Object({
    title: Type.String({ minLength: 1 }),
    description: Type.Optional(Type.String()),
    completed: Type.Optional(Type.Boolean()),
  }),
};
```

**Handler** (`src/tasks/application/route-handlers/create-task/handler.ts`):

```typescript
import type { FastifyRequest, FastifyReply } from "fastify";
import { resolveDependency } from "@sentzunhat/zacatl";
import { TaskService } from "../../../domain/providers/task.service.js";

interface CreateTaskBody {
  title: string;
  description?: string;
  completed?: boolean;
}

export async function createTaskHandler(
  request: FastifyRequest<{ Body: CreateTaskBody }>,
  reply: FastifyReply,
) {
  const taskService = resolveDependency<TaskService>("TaskService");

  const task = await taskService.createTask({
    title: request.body.title,
    description: request.body.description,
    completed: request.body.completed ?? false,
  });

  return reply.code(201).send(task);
}
```

**List Handler** (`src/tasks/application/route-handlers/list-tasks/handler.ts`):

```typescript
import type { FastifyRequest, FastifyReply } from "fastify";
import { resolveDependency } from "@sentzunhat/zacatl";
import { TaskService } from "../../../domain/providers/task.service.js";

export async function listTasksHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const taskService = resolveDependency<TaskService>("TaskService");
  const tasks = await taskService.getAllTasks();
  return reply.send(tasks);
}
```

### 7. Routes Aggregation (`src/tasks/application/route-handlers/routes.ts`)

```typescript
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { createTaskHandler } from "./create-task/handler.js";
import { CreateTaskSchema } from "./create-task/schema.js";
import { listTasksHandler } from "./list-tasks/handler.js";

export async function taskRoutes(
  app: FastifyInstance,
  opts: FastifyPluginOptions,
) {
  app.post("/tasks", { schema: CreateTaskSchema }, createTaskHandler);
  app.get("/tasks", listTasksHandler);
}
```

### 8. Package.json Scripts

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx --watch src/server.ts",
    "build": "tsc",
    "start": "node build/server.js"
  }
}
```

### 9. Run It

```bash
npm install @sentzunhat/zacatl fastify mongoose
npm install -D typescript tsx @types/node
npm run dev
```

**Test:**

```bash
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "My first task", "completed": false}'

curl http://localhost:3000/tasks
```

---

## Single-Area Structure (Recommended for Simple Projects)

**When to use:** 1-3 related resources (e.g., blog with posts/comments, task manager)

### Full Structure

```
src/
├── server.ts
├── service.ts
├── locales/                     # Optional: i18n
│   ├── en.json
│   └── es.json
└── main/                        # Your primary domain area
    ├── application/
    │   ├── hooks/               # Fastify hooks (auth, logging)
    │   │   └── auth.hook.ts
    │   └── route-handlers/
    │       ├── health/
    │       │   ├── handler.ts
    │       │   └── schema.ts
    │       ├── posts/
    │       │   ├── create/
    │       │   ├── list/
    │       │   ├── get/
    │       │   ├── update/
    │       │   └── delete/
    │       └── routes.ts
    ├── domain/
    │   ├── entities/
    │   │   ├── post.entity.ts
    │   │   └── comment.entity.ts
    │   └── providers/
    │       ├── post.service.ts
    │       ├── comment.service.ts
    │       └── providers.ts
    └── infrastructure/
        ├── repositories/
        │   ├── post.repository.ts
        │   ├── comment.repository.ts
        │   └── repositories.ts
        ├── jobs/                 # Optional: background tasks
        │   ├── email-notifier.job.ts
        │   └── jobs.ts
        └── migrations/           # Optional: DB migrations
            └── 001-initial-schema.ts
```

---

## Multi-Area Structure (Production Reference)

**When to use:** Multiple bounded contexts (auth + tenancy + business logic)

**Reference:** ictlan-service architecture (150+ directories, 185 files)

### Structure

```
src/
├── server.ts
├── service.ts
├── locales/
│   ├── en.json
│   └── es.json
├── areas/                       # Modular business domains
│   ├── catalyst/                # Example: Core business logic
│   │   ├── application/
│   │   │   ├── hook-handlers/
│   │   │   │   └── hooks.ts
│   │   │   └── route-handlers/
│   │   │       ├── health/
│   │   │       │   ├── handler.ts
│   │   │       │   └── schema.ts
│   │   │       ├── artifacts/
│   │   │       │   ├── create/
│   │   │       │   ├── list/
│   │   │       │   └── upload/
│   │   │       └── routes.ts
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   ├── artifact.entity.ts
│   │   │   │   └── provider.entity.ts
│   │   │   └── providers/
│   │   │       ├── artifact.service.ts
│   │   │       └── providers.ts
│   │   └── infrastructure/
│   │       ├── repositories/
│   │       │   ├── artifact.repository.ts
│   │       │   └── repositories.ts
│   │       ├── jobs/
│   │       │   ├── artifact-processor.job.ts
│   │       │   └── jobs.ts
│   │       └── migrations/
│   │           └── 001-artifacts-schema.ts
│   ├── passport/                # Auth domain (WebAuthn, sessions)
│   │   ├── application/
│   │   │   ├── hook-handlers/
│   │   │   │   └── auth.hook.ts
│   │   │   └── route-handlers/
│   │   │       ├── login/
│   │   │       ├── register/
│   │   │       └── routes.ts
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── providers/
│   │   │       ├── auth.service.ts
│   │   │       └── providers.ts
│   │   └── infrastructure/
│   │       └── repositories/
│   │           ├── user.repository.ts
│   │           └── repositories.ts
│   └── tenancy/                 # Multi-tenancy domain
│       ├── application/
│       │   └── route-handlers/
│       │       └── routes.ts
│       ├── domain/
│       │   └── providers/
│       │       └── providers.ts
│       └── infrastructure/
│           └── repositories/
│               └── repositories.ts
└── main/                        # Cross-cutting utilities
    ├── domain/
    │   └── entities/
    │       └── common.entity.ts
    ├── infrastructure/
    │   ├── migrations/
    │   ├── jobs/
    │   └── repositories/
    └── utils/
        ├── error-handler.ts
        └── validators.ts
```

### Service.ts for Multi-Area

```typescript
import { Service } from "@sentzunhat/zacatl";

// Catalyst area
import { catalystRoutes } from "./areas/catalyst/application/route-handlers/routes.js";
import { catalystHooks } from "./areas/catalyst/application/hook-handlers/hooks.js";
import { catalystProviders } from "./areas/catalyst/domain/providers/providers.js";
import { catalystRepositories } from "./areas/catalyst/infrastructure/repositories/repositories.js";
import { catalystJobs } from "./areas/catalyst/infrastructure/jobs/jobs.js";

// Passport area
import { passportRoutes } from "./areas/passport/application/route-handlers/routes.js";
import { authHook } from "./areas/passport/application/hook-handlers/auth.hook.js";
import { passportProviders } from "./areas/passport/domain/providers/providers.js";
import { passportRepositories } from "./areas/passport/infrastructure/repositories/repositories.js";

// Tenancy area
import { tenancyRoutes } from "./areas/tenancy/application/route-handlers/routes.js";
import { tenancyProviders } from "./areas/tenancy/domain/providers/providers.js";
import { tenancyRepositories } from "./areas/tenancy/infrastructure/repositories/repositories.js";

export async function buildService() {
  const service = new Service({
    architecture: {
      application: {
        routes: [catalystRoutes, passportRoutes, tenancyRoutes],
        hooks: [catalystHooks, authHook],
      },
      domain: {
        providers: [
          ...catalystProviders,
          ...passportProviders,
          ...tenancyProviders,
        ],
      },
      infrastructure: {
        repositories: [
          ...catalystRepositories,
          ...passportRepositories,
          ...tenancyRepositories,
        ],
        jobs: catalystJobs,
      },
    },
  });

  return service;
}
```

---

## Critical Wiring Checklist

When scaffolding a new project, verify these connections:

### ✅ 1. Routes Registration

- [ ] Each route handler folder has `handler.ts` + `schema.ts` (if validation needed)
- [ ] Area has `routes.ts` that imports all handlers
- [ ] `service.ts` imports `routes.ts` and adds to `application.routes` array

**Example:**

```typescript
// routes.ts exports plugin function
export async function myRoutes(
  app: FastifyInstance,
  opts: FastifyPluginOptions,
) {
  app.get("/health", healthHandler);
}

// service.ts imports and registers
import { myRoutes } from "./areas/main/application/route-handlers/routes.js";
// ...
application: {
  routes: [myRoutes];
}
```

### ✅ 2. DI Container Registration

- [ ] Domain services decorated with `@singleton()`
- [ ] Repositories decorated with `@singleton()`
- [ ] Area has `providers.ts` exporting array: `export const myProviders = [ServiceA, ServiceB]`
- [ ] Area has `repositories.ts` exporting array: `export const myRepositories = [RepoA, RepoB]`
- [ ] `service.ts` imports and spreads into `domain.providers` and `infrastructure.repositories`

**Example:**

```typescript
// providers.ts
export const catalystProviders = [ArtifactService, ProviderService];

// service.ts
domain: {
  providers: [...catalystProviders, ...passportProviders];
}
```

### ✅ 3. Repository Extends BaseRepository

```typescript
@singleton()
export class UserRepository extends BaseRepository<User, User, UserOutput> {
  constructor() {
    super({
      type: ORMType.Mongoose, // or ORMType.Sequelize
      name: "User",
      schema: UserSchema,
    });
  }
}
```

### ✅ 4. Handler Uses resolveDependency

```typescript
import { resolveDependency } from "@sentzunhat/zacatl";
import { TaskService } from "../../../domain/providers/task.service.js";

export async function handler(request: FastifyRequest, reply: FastifyReply) {
  const service = resolveDependency<TaskService>("TaskService");
  // Use service...
}
```

### ✅ 5. ESM Imports (Critical!)

- [ ] All imports end with `.js` (even for `.ts` files)
- [ ] `package.json` has `"type": "module"`
- [ ] `tsconfig.json` has `"module": "ES2022"` or `"ESNext"`

### ✅ 6. Server Startup

```typescript
// server.ts
import { buildService } from "./service.js";

async function start() {
  const service = await buildService();
  await service.start();
}

start().catch((error) => {
  console.error("Startup failed:", error);
  process.exit(1);
});
```

---

## File-by-File Breakdown

### Pattern: Port/Adapter per Concern

Each feature (e.g., "create user", "list tasks") gets its own folder with:

- `handler.ts` - Fastify route handler (port)
- `schema.ts` - Request/response validation (adapter)

**Why?** Clean separation, easy to test, scales to 100+ endpoints without chaos.

### Example: Create User Feature

**Folder:** `src/areas/passport/application/route-handlers/create-user/`

**handler.ts:**

```typescript
import type { FastifyRequest, FastifyReply } from "fastify";
import { resolveDependency } from "@sentzunhat/zacatl";
import { UserService } from "../../../domain/providers/user.service.js";

interface CreateUserBody {
  email: string;
  password: string;
  name: string;
}

export async function createUserHandler(
  request: FastifyRequest<{ Body: CreateUserBody }>,
  reply: FastifyReply,
) {
  const userService = resolveDependency<UserService>("UserService");

  const user = await userService.createUser(request.body);

  return reply.code(201).send({
    id: user.id,
    email: user.email,
    name: user.name,
  });
}
```

**schema.ts:**

```typescript
import { Type } from "@sinclair/typebox";

export const CreateUserSchema = {
  body: Type.Object({
    email: Type.String({ format: "email" }),
    password: Type.String({ minLength: 8 }),
    name: Type.String({ minLength: 1 }),
  }),
  response: {
    201: Type.Object({
      id: Type.String(),
      email: Type.String(),
      name: Type.String(),
    }),
  },
};
```

**routes.ts (area aggregator):**

```typescript
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import { createUserHandler } from "./create-user/handler.js";
import { CreateUserSchema } from "./create-user/schema.js";
import { loginHandler } from "./login/handler.js";
import { LoginSchema } from "./login/schema.js";

export async function passportRoutes(
  app: FastifyInstance,
  opts: FastifyPluginOptions,
) {
  app.post("/auth/register", { schema: CreateUserSchema }, createUserHandler);
  app.post("/auth/login", { schema: LoginSchema }, loginHandler);
}
```

---

## Common Patterns

### 1. Error Handling

```typescript
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "@sentzunhat/zacatl";

export async function handler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params;

  if (!id) {
    throw new BadRequestError("ID is required");
  }

  const service = resolveDependency<TaskService>("TaskService");
  const task = await service.getTaskById(id);

  if (!task) {
    throw new NotFoundError("Task not found");
  }

  return reply.send(task);
}
```

### 2. Hooks (Middleware)

**Auth Hook** (`src/areas/passport/application/hook-handlers/auth.hook.ts`):

```typescript
import type { FastifyInstance, FastifyPluginOptions } from "fastify";

export async function authHook(
  app: FastifyInstance,
  opts: FastifyPluginOptions,
) {
  app.addHook("onRequest", async (request, reply) => {
    const token = request.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    // Validate token, attach user to request
    // request.user = await validateToken(token);
  });
}
```

**Register in service.ts:**

```typescript
architecture: {
  application: {
    hooks: [authHook],
    routes: [...]
  }
}
```

### 3. Background Jobs

**Job Definition** (`src/areas/catalyst/infrastructure/jobs/email-notifier.job.ts`):

```typescript
import { singleton } from "tsyringe";

@singleton()
export class EmailNotifierJob {
  async execute() {
    console.log("Sending email notifications...");
    // Job logic here
  }
}
```

**Job Registration** (`src/areas/catalyst/infrastructure/jobs/jobs.ts`):

```typescript
import { EmailNotifierJob } from "./email-notifier.job.js";

export const catalystJobs = [EmailNotifierJob];
```

**Service.ts:**

```typescript
infrastructure: {
  jobs: catalystJobs;
}
```

### 4. Database Migrations

```typescript
// src/main/infrastructure/migrations/001-create-users-table.ts
export async function up(db: Db) {
  await db.createCollection("users");
}

export async function down(db: Db) {
  await db.dropCollection("users");
}
```

### 5. Validation with TypeBox

```typescript
import { Type } from "@sinclair/typebox";

export const UpdateTaskSchema = {
  params: Type.Object({
    id: Type.String({ format: "uuid" }),
  }),
  body: Type.Object({
    title: Type.Optional(Type.String({ minLength: 1 })),
    completed: Type.Optional(Type.Boolean()),
  }),
};
```

---

## AI Agent Prompt Template

**Use this prompt when asking an AI to scaffold a zacatl HTTP service:**

```
Create a Fastify HTTP service using @sentzunhat/zacatl framework with:

1. Project structure:
   - src/server.ts (entry point)
   - src/service.ts (service configuration)
   - src/[AREA_NAME]/ (domain area)

2. Domain area should have:
   - application/route-handlers/ (HTTP handlers + schemas)
   - domain/providers/ (business services)
   - infrastructure/repositories/ (database access)

3. Each route handler gets its own folder with:
   - handler.ts (Fastify handler using resolveDependency)
   - schema.ts (TypeBox validation)

4. Aggregation files:
   - routes.ts (exports Fastify plugin with all routes)
   - providers.ts (exports array of domain services)
   - repositories.ts (exports array of repositories)

5. Use:
   - @singleton() decorator on services and repositories
   - BaseRepository<Input, Query, Output> for database access
   - ESM imports with .js extension
   - resolveDependency<T>("ClassName") in handlers

6. Features to implement:
   [LIST YOUR ENDPOINTS HERE, e.g., POST /tasks, GET /tasks/:id]

Reference structure from ictlan-service (multi-area pattern).
```

---

## Next Steps

1. **Start with Quick Start template** - Get one endpoint working
2. **Add more handlers** - Follow port/adapter pattern (handler.ts + schema.ts)
3. **Extract to services** - Move business logic to domain/providers
4. **Add database** - Create repositories in infrastructure/
5. **Scale to multi-area** - Split bounded contexts when you have 10+ endpoints

**Need help?**

- See [ai-agent-non-http-setup.md](./ai-agent-non-http-setup.md) for CLI/worker patterns
- Check [dependencies-reference.md](../references/dependencies-reference.md) for what's included
- Review production example: ictlan-service structure (150+ directories)

---

**Generated for:** Zacatl v0.0.23+  
**Last Updated:** January 31, 2026
