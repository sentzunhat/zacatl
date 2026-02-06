# Zacatl Framework Overview

## What is Zacatl?

Zacatl is a **production-ready TypeScript microservice framework** designed for building scalable, maintainable APIs and distributed systems.

It provides:

1. **Clean Architecture** - Layered/hexagonal pattern with strict separation of concerns
2. **Dependency Injection** - Built-in DI container via tsyringe
3. **Type Safety** - Full TypeScript with strict typing and generics
4. **Validation** - Request/response validation with Zod
5. **Error Handling** - Structured errors with correlation IDs
6. **Logging** - Structured logging with Pino
7. **Configuration** - YAML/JSON config with environment support
8. **Database Abstraction** - Pluggable ORM adapters (Sequelize, Mongoose, custom)
9. **Internationalization** - i18n with pluggable adapters
10. **Testing** - Vitest setup with comprehensive examples

## Who Should Use Zacatl?

✅ **Good fit:**

- Building microservices or APIs
- Need clean, testable architecture
- Want type-safe database access
- Need i18n/multi-language support
- Large teams (enforces patterns)
- AI-assisted development (clear structure for LLMs)

❌ **Not the best fit:**

- Simple CRUD apps (might be over-engineered)
- Static site generation
- Client-side only projects

## Core Principles

### 1. Layered Architecture

```
┌─────────────────────────────────┐
│   Application Layer             │ (Use cases, business logic)
│   ├─ Services                   │
│   └─ Route Handlers             │
├─────────────────────────────────┤
│   Domain Layer                  │ (Interfaces, contracts)
│   ├─ Repository Interfaces      │
│   ├─ Service Interfaces         │
│   └─ Types                      │
├─────────────────────────────────┤
│   Infrastructure Layer          │ (Implementations)
│   ├─ Database Repositories      │
│   ├─ ORM Adapters              │
│   └─ External Services         │
├─────────────────────────────────┤
│   Platform Layer                │ (Framework)
│   ├─ Express/Fastify Server    │
│   ├─ Logging                    │
│   ├─ Configuration             │
│   └─ DI Container              │
└─────────────────────────────────┘
```

### 2. Dependency Injection

All dependencies are injected, never instantiated directly:

```typescript
// ✅ Good: Dependencies injected
export class UserService {
  constructor(
    private userRepository: IUserRepository,
    private logger: Logger,
  ) {}
}

// ❌ Bad: Hard-coded dependencies
export class UserService {
  private userRepository = new UserRepository();
  private logger = new Logger();
}
```

### 3. Adapter Pattern

External concerns (databases, servers) are abstracted:

```typescript
// Define interface (domain)
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
}

// Implement for Sequelize (infrastructure)
export class SequelizeUserRepository implements IUserRepository {
  // ...
}

// Implement for Mongoose (infrastructure)
export class MongooseUserRepository implements IUserRepository {
  // ...
}

// Use in service (application) - doesn't know which implementation
export class UserService {
  constructor(private repo: IUserRepository) {}
}
```

## What's Included

### ✅ Built-in Modules

| Module                   | Status           | Purpose                           |
| ------------------------ | ---------------- | --------------------------------- |
| **Configuration**        | ✅ 96% coverage  | YAML/JSON loading, Zod validation |
| **Dependency Injection** | ✅ 92% coverage  | tsyringe integration              |
| **Error Handling**       | ✅ 100% coverage | 7 error types, structured errors  |
| **Logging**              | ✅ 100% coverage | Pino + Console adapters           |
| **i18n/Localization**    | ✅ 100% coverage | Filesystem & memory adapters      |
| **ORM Adapters**         | ✅ 100% coverage | Sequelize & Mongoose              |
| **Server Adapters**      | ✅ 55% coverage  | Express & Fastify                 |
| **Runtime Detection**    | ✅ 90% coverage  | Node.js/Bun detection             |

### ✅ Testing Infrastructure

| Feature           | Coverage | Tests                |
| ----------------- | -------- | -------------------- |
| **Total**         | 79.09%   | 161 tests            |
| **Error Types**   | 100%     | 12 tests             |
| **Logging**       | 100%     | 10 tests             |
| **i18n**          | 100%     | 26 tests             |
| **Configuration** | 96%      | 30 tests             |
| **ORM Adapters**  | 100%     | 11 tests (Sequelize) |

## Architecture Example

Here's a complete feature using all layers:

### 1. Domain (Ports)

```typescript
// src/domain/user-repository.port.ts
export abstract class UserRepository {
  abstract findById(id: string): Promise<User | null>;
  abstract create(userData: CreateUserInput): Promise<User>;
}

// src/domain/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}
```

### 2. Application (Business Logic)

```typescript
// src/application/services/UserService.ts
import { inject, injectable } from "tsyringe";
import { UserRepository } from "../domain/user-repository.port";
import { AppLogger } from "../infrastructure/logging/app-logger";

@injectable()
export class UserService {
  constructor(
    @inject(UserRepository) private userRepo: UserRepository,
    @inject(AppLogger) private logger: AppLogger,
  ) {}

  async createUser(input: CreateUserInput): Promise<User> {
    this.logger.info("Creating user", { email: input.email });

    const user = await this.userRepo.create(input);

    this.logger.info("User created", { userId: user.id });
    return user;
  }
}
```

### 3. Infrastructure (Database)

```typescript
// src/infrastructure/repositories/SequelizeUserRepository.ts
@injectable()
export class SequelizeUserRepository implements IUserRepository {
  constructor(
    private userModel: typeof UserModel,
    private adapter: SequelizeAdapter<UserModel, CreateUserInput, User>,
  ) {}

  async create(data: CreateUserInput): Promise<User> {
    const instance = await this.userModel.create(data);
    return this.adapter.toLean(instance);
  }
}
```

### 4. Platform (Routes)

```typescript
// src/routes/UserRoutes.ts
import { injectable, inject } from "tsyringe";
import { Router } from "express";

export const createUserRouter = (container: DependencyContainer) => {
  const router = Router();
  const userService = container.resolve(UserService);

  router.post("/users", async (req, res) => {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  return router;
};
```

## Getting Started

### Install

```bash
npm install @sentzunhat/zacatl
```

### 5-Minute Example

See [Quick Start - 5 Minutes](./getting-started/QUICKSTART_5MIN.md)

### Full Examples

See [docs/examples/](./examples/)

## Key Features Explained

### Type Safety

All modules export TypeScript types:

```typescript
// Config is fully typed
const config: UjtiConfig = await loadConfig();
config.gateway.location; // ✅ TypeScript knows this property exists

// Errors are typed
if (error instanceof BadRequestError) {
  error.statusCode; // ✅ TS knows this is 400
}
```

### Validation

Zod schemas validate data at boundaries:

```typescript
const CreateUserSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["admin", "user"]),
});

const input = CreateUserSchema.parse(req.body);
// input is now fully typed and validated
```

### Structured Logging

All logs include context:

```typescript
logger.info("user_created", {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
});

// Output:
// {"level":"info","msg":"user_created","userId":"123","email":"user@example.com",...}
```

### Error Handling

Errors are structured and include correlation IDs:

```typescript
try {
  // ...
} catch (error) {
  // All errors have these properties:
  error.message; // Human-readable message
  error.code; // HTTP status (400, 404, 500, etc.)
  error.correlationId; // Track request across logs
  error.metadata; // Additional context
}
```

## What's NOT Included

Zacatl doesn't include:

- ❌ HTTP framework (use Express, Fastify, Hapi)
- ❌ Database driver (use Sequelize, Mongoose, Prisma)
- ❌ Authentication/Authorization (use Passport, JWT, etc.)
- ❌ Message Queue (use Bull, RabbitMQ, Kafka)
- ❌ GraphQL support (use Apollo, TypeGraphQL)

**But** Zacatl provides adapters and patterns to integrate these easily.

## Performance

Zacatl is lightweight:

- **Bundle size**: ~15KB (minified)
- **Dependencies**: 5 core dependencies (zod, pino, tsyringe, etc.)
- **Runtime**: <50ms overhead per request

Real performance depends on:

- Your database queries
- Network latency
- Business logic complexity

## Production Ready

Zacatl includes:

✅ Error handling with proper HTTP status codes  
✅ Structured logging for debugging  
✅ Configuration management for different environments  
✅ Type safety to catch bugs at compile time  
✅ Unit tests with 79% code coverage  
✅ ACID transactions support via adapters

## Next Steps

1. **[Quick Start](./getting-started/QUICKSTART_5MIN.md)** - Get running in 5 minutes
2. **[Installation](./getting-started/INSTALLATION.md)** - Detailed setup
3. **[Architecture Fundamentals](./architecture/FUNDAMENTALS.md)** - Understand patterns
4. **[Building Repositories](./guides/REPOSITORIES.md)** - First feature

---

**Have questions?** Check [FAQ.md](./FAQ.md) or [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
