# Agent Guidance: Building Platform Examples

> **Last Updated:** February 4, 2026  
> **Status:** Pre-agent launch - templates and guidance ready  
> **Goal:** Build 4 production-ready backend examples (2 frameworks × 2 databases)

## Quick Overview

You'll be building one of two parallel project tracks:

- **Agent A (Fastify):** `platform-fastify/01-with-sqlite/` + `platform-fastify/02-with-mongodb/`
- **Agent B (Express):** `platform-express/01-with-sqlite/` + `platform-express/02-with-mongodb/`

All examples use **identical domain logic, handlers, and architecture**. Only the HTTP framework and database ORM differ.

---

## What's Already Working ✅

- Build system compiles successfully (`npm run build` at root)
- Shared domain logic exists: `examples/shared/domain/`
  - `GreetingService` (business logic)
  - `GreetingRepository` interface (storage ports)
  - `Greeting` models
- Route handler pattern validated: `AbstractRouteHandler<TBody, TQuery, TReply>` with `@singleton`
- DI registration approach confirmed
- Path mapping (tsconfig.dev.json) enables dev-from-src

---

## Your Assignment

### Ports & Port Assignment

**Fastify examples (Agent A):**

- `platform-fastify/01-with-sqlite/` → Port **8081**
- `platform-fastify/02-with-mongodb/` → Port **8082**

**Express examples (Agent B):**

- `platform-express/01-with-sqlite/` → Port **8083**
- `platform-express/02-with-mongodb/` → Port **8084**

**⚠️ Strict:** Use only your assigned ports. If port is already in use, kill the process before starting.

### Directory Structure Per Example

```
platform-[framework]/0[1-2]-with-[database]/
├── src/
│   ├── index.ts                    # DI setup & app bootstrap
│   ├── configuration/
│   │   ├── service.config.ts       # Handler registration
│   │   └── environment.ts          # .env loading & validation
│   ├── infrastructure/
│   │   ├── models/
│   │   │   └── greeting.model.ts   # ORM model (Sequelize or Mongoose)
│   │   ├── repositories/
│   │   │   └── greeting.repository.ts  # Repository impl (Sequelize or Mongoose)
│   │   └── database.ts             # DB connection & initialization
│   ├── interfaces/
│   │   └── handlers/
│   │       ├── list-greetings.handler.ts
│   │       ├── get-greeting.handler.ts
│   │       ├── create-greeting.handler.ts
│   │       ├── update-greeting.handler.ts
│   │       └── delete-greeting.handler.ts
│   └── adapters/
│       └── [framework-specific]/
│           ├── index.ts             # Framework integration
│           └── routes.ts            # Route definitions
├── tsconfig.json
├── tsconfig.dev.json               # Path mapping for dev (see template)
├── package.json
├── .env.example
├── .gitignore
├── README.md
└── test/
    └── (leave empty for now)
```

---

## Architecture Pattern (Required)

### 1. Route Handlers - `AbstractRouteHandler<TBody, TQuery, TReply>`

```typescript
// interfaces/handlers/create-greeting.handler.ts
import { AbstractRouteHandler } from "@sentzunhat/zacatl/service";
import { singleton, inject } from "tsyringe";
import { GreetingService } from "../../domain/services/greeting.service";

interface CreateGreetingRequest {
  message: string;
}

interface CreateGreetingReply {
  id: string;
  message: string;
  createdAt: string;
}

@singleton()
export class CreateGreetingHandler extends AbstractRouteHandler<
  CreateGreetingRequest,
  never,
  CreateGreetingReply
> {
  constructor(
    @inject(GreetingService) private greetingService: GreetingService,
  ) {
    super();
  }

  async execute(body: CreateGreetingRequest): Promise<CreateGreetingReply> {
    const greeting = await this.greetingService.create(body.message);
    return {
      id: greeting.id,
      message: greeting.message,
      createdAt: greeting.createdAt,
    };
  }
}
```

### 2. Service Configuration - Register All Handlers

```typescript
// configuration/service.config.ts
import { CreateGreetingHandler } from "../interfaces/handlers/create-greeting.handler";
import { ListGreetingsHandler } from "../interfaces/handlers/list-greetings.handler";
import { GetGreetingHandler } from "../interfaces/handlers/get-greeting.handler";
import { UpdateGreetingHandler } from "../interfaces/handlers/update-greeting.handler";
import { DeleteGreetingHandler } from "../interfaces/handlers/delete-greeting.handler";

export const handlers = [
  CreateGreetingHandler,
  ListGreetingsHandler,
  GetGreetingHandler,
  UpdateGreetingHandler,
  DeleteGreetingHandler,
];
```

### 3. Dependency Injection - Config Configuration

Instead of manual registration, pass the classes to the `Service` configuration. The framework handles registration.

```typescript
// src/config.ts
import { GreetingService } from "./domain/services/greeting.service";
import { GreetingRepository } from "./infrastructure/repositories/greeting.repository";
import { GetAllGreetingsHandler } from "./application/handlers/get-all-greetings.handler";

// Register implementations in the config object
const serviceConfig = {
  // ...
  layers: {
    infrastructure: {
      repositories: [GreetingRepository],
    },
    domain: {
      services: [GreetingService],
    },
    application: {
      entryPoints: {
        rest: {
          routes: [GetAllGreetingsHandler],
        },
      },
    },
  },
};

// Initialize Service
const service = new Service(serviceConfig);
```

**⚠️ Note:** Ensure all classes use `@singleton()` decorator and inject dependencies using `@inject(Class)`.

---

## 5+ Endpoints Required

Each example must implement these endpoints. Use these exact paths:

### 1. **POST** `/greetings` - Create greeting

```
Request:  { "message": "Hello", "language": "en" }  # SQLite uses "message"
Request:  { "text": "Hello", "language": "en" }     # MongoDB uses "text"
Response: { "id": "uuid", "message": "Hello", "language": "en", "createdAt": "2024-01-01T00:00:00Z" }
```

### 2. **GET** `/greetings` - List all greetings

```
Response: { "data": [ { "id": "uuid", "message": "...", "language": "...", "createdAt": "..." } ] }
```

### 3. **GET** `/greetings/:id` - Get single greeting

```
Response: { "id": "uuid", "message": "Hello", "language": "en", "createdAt": "..." }
```

### 4. **GET** `/greetings/random/:language` - Get random greeting by language

```
Response: { "id": "uuid", "message": "Hello", "language": "en", "createdAt": "..." }
```

### 5. **DELETE** `/greetings/:id` - Delete greeting

```
Response: { "id": "uuid", "deleted": true }
```

**Note**: Update operations (PATCH) are optional. The current implementations focus on create, read, and delete operations.

---

## Database Setup

### SQLite (Sequelize)

```typescript
// infrastructure/database.ts
import { Sequelize } from "sequelize";
import path from "path";

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(process.cwd(), "database.sqlite"),
  logging: false,
});

export default sequelize;
```

**No server setup needed.** Database file auto-creates on first run.

### MongoDB (Mongoose)

```typescript
// infrastructure/database.ts
import mongoose from "mongoose";

const dbUri = process.env.MONGODB_URI || "mongodb://localhost:27017/greetings";

export async function initializeDatabase() {
  await mongoose.connect(dbUri);
  console.log("Connected to MongoDB");
}
```

**Requirement:** MongoDB must be running before app starts.

```bash
# Quick setup
docker run -d -p 27017:27017 --name mongo mongo:latest
```

---

## Quick Diagnosis Checklist

| Error                                               | Check                                                                   | Fix                                                      |
| --------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------- |
| `"TypeInfo not known for Handler"`                  | Are all handlers in `Service` config and decorated with `@singleton()`? | Add handler classes to the config before `new Service()` |
| `"Cannot find @sentzunhat/zacatl"`                  | Is `tsconfig.dev.json` present with paths mapped?                       | Use provided template below                              |
| `"Port 808X already in use"`                        | Is another backend running?                                             | Kill process: `lsof -ti:808X \| xargs kill`              |
| `"ENOENT database.sqlite"`                          | Is Sequelize init() called before sync()?                               | Ensure model initialization before Service start         |
| `"Connection refused"`                              | Is MongoDB running (if using Mongoose)?                                 | Start mongo or provide docker-compose                    |
| `"Cannot find module '@sentzunhat/zacatl/service'"` | Are you importing from wrong path?                                      | Use `'@sentzunhat/zacatl/service'` exactly               |

---

## Template Files

### tsconfig.dev.json

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@sentzunhat/zacatl/*": ["../../../build/*"],
      "@sentzunhat/zacatl-examples-shared-domain": [
        "../shared/domain/build/index.js"
      ]
    }
  },
  "ts-node": {
    "compilerOptions": {
      "module": "commonjs"
    }
  }
}
```

### .env.example

```env
NODE_ENV=development
PORT=808X  # Use your assigned port (8081-8084)
LOG_LEVEL=info

# SQLite (Sequelize examples)
DATABASE_PATH=./database.sqlite

# MongoDB (Mongoose examples)
MONGODB_URI=mongodb://localhost:27017/greetings-app
```

### base handler class (reference)

```typescript
import { AbstractRouteHandler } from "@sentzunhat/zacatl/service";
import { singleton, inject } from "tsyringe";
import { YourService } from "../domain/services/your.service";

@singleton()
export class YourHandler extends AbstractRouteHandler<TBody, TQuery, TReply> {
  constructor(@inject(YourService) private service: YourService) {
    super();
  }

  async execute(body: TBody, query?: TQuery): Promise<TReply> {
    // Your logic here
    return {
      /* response */
    };
  }
}
```

---

## Validation Checklist

Before considering your example "done":

- [ ] `npm install` succeeds
- [ ] `npm run dev` starts server on assigned port without errors
- [ ] `curl http://localhost:808X/greetings` returns valid JSON (or empty list)
- [ ] `curl -X POST http://localhost:808X/greetings -H "Content-Type: application/json" -d '{"message":"test"}'` creates greeting
- [ ] `curl http://localhost:808X/greetings` returns list with 1+ greetings
- [ ] `curl http://localhost:808X/greetings/{id}` retrieves specific greeting
- [ ] `curl -X PATCH http://localhost:808X/greetings/{id} -d '{"message":"updated"}'` updates greeting
- [ ] `curl -X DELETE http://localhost:808X/greetings/{id}` deletes greeting
- [ ] README.md documents setup and port usage
- [ ] `.env.example` provided with all required vars
- [ ] `npm run build` produces no errors

---

## Key Architectural Principles

1. **Handlers are singletons** - Never `new Handler()`, always inject via container
2. **Services are stateless** - No instance data, only logic
3. **Repositories hide database** - Services don't know if it's SQLite or Mongoose
4. **DI via Service config** - All singletons listed in config before `new Service()`
5. **Identical behavior across platforms** - Same endpoints, same responses, different internals

---

## Support & Blockers

**If you hit a blocker:**

1. Check the Diagnosis Checklist above
2. Verify your assigned port isn't in use
3. Confirm handlers, services, and repositories are listed in the `Service` config
4. Review the AbstractRouteHandler pattern - make sure you're extending it correctly
5. Check path mappings in tsconfig.dev.json

**Common issues to avoid:**

- ❌ Don't register handlers in a separate file without importing them in index.ts
- ❌ Don't create handler instances manually (`new CreateGreetingHandler()`)
- ❌ Don't use different port than assigned (causes conflicts)
- ❌ Don't skip `.env.example` - document your environment variables
- ❌ Don't mix CommonJS and ES modules in same file

---

## Success Looks Like

```bash
✓ npm install
✓ npm run dev
   Server listening on port 808X
✓ curl http://localhost:808X/greetings
   {"data":[]}
✓ npm run build
   build/ directory created with .js and .d.ts files
```

**One example = 1-2 hours of work.** You're building two, so ~3-4 hours total.  
**You've got this! 🚀**
