# Architecture & Module Organization

This guide covers folder structure, layering patterns, module boundaries, and dependency management for a scalable TypeScript project.

## Table of Contents

1. [Folder Structure](#folder-structure)
2. [Layered Architecture](#layered-architecture)
3. [Module Organization](#module-organization)
4. [Dependency Injection](#dependency-injection)
5. [Adapter Pattern](#adapter-pattern)
6. [Import Paths & Aliases](#import-paths--aliases)

---

## Folder Structure

### Project Root Layout

```
src/
├── index.ts                    # Main barrel export
├── optionals.ts                # Optional APIs
├── configuration/              # Config loading & validation
├── dependency-injection/       # DI container wrappers
├── error/                      # Error classes & types
├── logs/                       # Logging abstractions
├── localization/               # i18n/translation adapters
├── service/                    # Service orchestration
│   ├── types/                  # Service types (ServiceType, etc.)
│   ├── platforms/              # Platform implementations (server, cli, desktop)
│   ├── layers/                 # Application, Domain, Infrastructure
│   │   ├── application/        # Use cases, handlers, ports
│   │   ├── domain/             # Business logic, services
│   │   └── infrastructure/     # Repositories, adapters
│   └── service.ts              # Main Service class
├── third-party/                # Framework & library wrappers
│   ├── express.ts              # Express export
│   ├── fastify.ts              # Fastify export
│   ├── mongoose.ts             # Mongoose export
│   ├── sequelize.ts            # Sequelize export
│   ├── zod.ts                  # Zod export
│   └── ...other libs
└── utils/                      # Utility functions

test/
├── unit/                       # Unit tests
│   ├── service/
│   ├── error/
│   └── ...matching src/ structure
└── helpers/                    # Test utilities

docs/
├── changelog.md                # Release notes
├── guidelines/                 # Style & workflow guides
│   ├── architecture.md         # This file
│   └── framework-overview.md   # High-level framework map
├── skills/                     # Procedures (versioning, etc.)
└── <feature>/README.md         # Per-module documentation

build/                          # Compiled output (generated)
```

### Semantic Folder Naming

- Use **kebab-case** for all folder names
- Name folders after their primary responsibility
- Use **plural names** for collections, **singular** for concepts

```
// ✅ Good structure
src/
  error-guards/      # Utilities for error handling
  dependency-injection/
  service/
  routes/
  handlers/
  repositories/

// ❌ Avoid
src/
  errorGuards/       # camelCase
  DependencyInjection/  # PascalCase
  Services/          # Vague
  misc/              # Too vague
  utils/misc/types/  # Too deep
```

### Max Folder Depth

Keep folder nesting to **3–4 levels deep**:

```
// ✅ Good (3 levels)
src/
  service/
    layers/
      application/

// ❌ Too deep (5+ levels)
src/
  service/
    layers/
      application/
        entry-points/
          rest/
            handlers/
              concrete/
```

---

## Layered Architecture

Zacatl uses **Hexagonal (Ports & Adapters) Architecture** with four main layers:

### 1. Application Layer

**Purpose:** User-facing use cases, HTTP handlers, CLI commands

**Contains:**

- Route handlers (REST endpoints)
- CLI commands
- UI event handlers
- Request/response validation
- HTTP hooks (middleware)

**Key Pattern:** Request → Handler → Service → Response

```typescript
// ✅ Structure
src/service/layers/application/
├── entry-points/        # External interfaces
│   ├── rest/           # HTTP routes
│   │   └── handlers/   # Method-specific handlers
│   └── cli/            # CLI commands
├── types/
└── index.ts

// Example Handler
export abstract class GetRouteHandler<TResponse> {
  abstract execute(): Promise<TResponse>;

  async handle(req: FastifyRequest) {
    return this.execute();
  }
}

// Concrete Implementation
export class GetGreetingsHandler extends GetRouteHandler<Greeting[]> {
  constructor(private service: GreetingService) { }

  async execute(): Promise<Greeting[]> {
    return this.service.getAll();
  }
}
```

### 2. Domain Layer

**Purpose:** Core business logic, independent of frameworks/libraries

**Contains:**

- Domain services (orchestrate business logic)
- Domain models/entities
- Business rules & domain exceptions
- Port definitions (interfaces)

**Pattern:** Pure TypeScript classes with no external dependencies

```typescript
// ✅ Domain Service
export class GreetingService {
  constructor(private repo: GreetingRepository) {}

  async getAll(): Promise<Greeting[]> {
    return this.repo.findAll();
  }

  async create(input: CreateGreetingInput): Promise<Greeting> {
    if (!input.message?.trim()) {
      throw new InvalidGreetingError('Message cannot be empty');
    }
    return this.repo.save(input);
  }
}

// ❌ Don't put HTTP-specific code here
export class GreetingService {
  constructor(
    private fastify: FastifyInstance, // Framework-specific!
    private repo: GreetingRepository,
  ) {}
}
```

### 3. Infrastructure Layer

**Purpose:** External integrations, database, third-party services

**Contains:**

- Repository implementations
- Database clients (Mongoose, Sequelize)
- External API clients
- Logger adapters

**Pattern:** Implement domain ports with concrete technologies

```typescript
// ✅ Repository Implementation
export class GreetingRepository implements GreetingPort {
  constructor(private db: Sequelize) {}

  async findAll(): Promise<Greeting[]> {
    return this.db.models.Greeting.findAll();
  }

  async save(greeting: CreateGreetingInput): Promise<Greeting> {
    return this.db.models.Greeting.create(greeting);
  }
}

// ✅ Logger Adapter
export class PinoLoggerAdapter implements LoggerPort {
  constructor(private pino: PinoLogger) {}

  log(message: string) {
    this.pino.info(message);
  }
}
```

### 4. Platforms Layer

**Purpose:** Runtime initialization, HTTP server setup, DI wiring

**Contains:**

- Server startup (Express, Fastify)
- Database connections
- DI container initialization
- CLI platform setup

**Pattern:** Orchestrate layers and initialize external systems

```typescript
// ✅ Platforms Setup
const service = new Service({
  type: ServiceType.SERVER,

  layers: {
    application: { entryPoints: { rest: { routes: [...] } } },
    domain: { providers: [GreetingService] },
    infrastructure: { repositories: [GreetingRepository] },
  },

  platforms: {
    server: {
      name: "my-api",
      server: {
        type: ApiServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastifyInstance,
      },
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

### Layer Dependency Rules

```
Application → (depends on) → Domain
      ↓
Infrastructure → (depends on) → Domain
      ↓
Platforms → (orchestrates all layers)
```

**Golden Rule:**

- ✅ Application can use Domain
- ✅ Infrastructure can use Domain
- ❌ Domain should NOT depend on Application or Infrastructure
- ❌ Circle dependencies are forbidden

---

## Module Organization

### Index.ts Pattern (Barrel Exports)

Every meaningful folder has an `index.ts` that re-exports public APIs:

```typescript
// src/error/index.ts
export * from './bad-request';
export * from './unauthorized';
export * from './custom';
export type { CustomErrorsArgs } from './custom';

// Usage
import { BadRequestError, UnauthorizedError } from '@zacatl/error';
```

**Benefits:**

- Cleaner imports (`from "@zacatl/error"` vs `from "@zacatl/error/bad-request"`)
- Single point for public vs. internal APIs
- Easier refactoring (move files without breaking imports)

### Per-Module Documentation

Each major module should have a `README.md`:

```
src/
  dependency-injection/
    README.md         # Explains DI pattern, how to use
  service/
    README.md         # Service architecture overview
  error/
    README.md         # Error types, when to use each
```

---

## Dependency Injection

### Container Pattern

Use a DI container to manage dependencies (e.g., `tsyringe`):

```typescript
// Register dependencies
import { container } from 'tsyringe';

container.register(GreetingService, {
  useClass: GreetingService,
});

container.register('GreetingRepository', {
  useClass: GreetingRepository,
});

// Resolve
const service = container.resolve(GreetingService);
```

### Auto-Registration

Leverage automatic registration during layer initialization:

```typescript
// ✅ Don't manually register every class
// Instead, let the framework auto-register based on layer config

new Domain({
  providers: [GreetingService, UserService], // Auto-registered
});

new Infrastructure({
  repositories: [GreetingRepository, UserRepository], // Auto-registered
});
```

### Injection via Constructor

Always inject dependencies through the constructor:

```typescript
// ✅ Good
export class GreetingService {
  constructor(private repo: GreetingRepository, private logger: Logger) {}
}

class GetGreetingsHandler extends GetRouteHandler {
  constructor(private service: GreetingService) {}
}

// ❌ Avoid
export class GreetingService {
  private repo = container.resolve(GreetingRepository); // Coupling
}
```

---

## Adapter Pattern

Use adapters to abstract third-party libraries and frameworks:

### Framework Adapters (Express, Fastify)

```typescript
// src/service/layers/application/entry-points/rest/fastify/handlers/abstract.ts
export abstract class AbstractRouteHandler<TRequest, TResponse> {
  abstract execute(input: TRequest): Promise<TResponse>;

  async handle(request: FastifyRequest): Promise<TResponse> {
    // Framework-specific to domain translation
    const input = this.validateRequest(request);
    return this.execute(input);
  }
}

// Same pattern for Express
export abstract class AbstractRouteHandler<TRequest, TResponse> {
  abstract execute(input: TRequest): Promise<TResponse>;

  async handle(req: Request, res: Response): Promise<void> {
    const input = this.validateRequest(req);
    const result = await this.execute(input);
    res.json(result);
  }
}
```

### Database Adapters

```typescript
// Repository Port (Domain)
export interface GreetingPort {
  findAll(): Promise<Greeting[]>;
  save(input: CreateGreetingInput): Promise<Greeting>;
}

// Mongoose Implementation
export class MongooseGreetingRepository implements GreetingPort {
  constructor(private mongoose: Mongoose) {}
  async findAll() {
    /* ... */
  }
  async save(input) {
    /* ... */
  }
}

// Sequelize Implementation
export class SequelizeGreetingRepository implements GreetingPort {
  constructor(private sequelize: Sequelize) {}
  async findAll() {
    /* ... */
  }
  async save(input) {
    /* ... */
  }
}

// Domain doesn't know which implementation is used!
```

---

## Import Paths & Aliases

### Path Aliases (tsconfig.json & vite.config.mjs)

Configure short import paths for better readability:

```jsonc
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@zacatl/configuration": ["src/configuration/index.ts"],
      "@zacatl/error": ["src/error/index.ts"],
      "@zacatl/service": ["src/service/index.ts"],
      "@zacatl/*": ["src/*"]
    }
  }
}
```

### Import Organization

Order imports as:

1. **External packages** (Node, npm modules)
2. **Internal path aliases** (@zacatl/\*)
3. **Relative imports** (./types, ../utils)

```typescript
// ✅ Good
import { FastifyRequest, FastifyReply } from 'fastify';
import { Service } from '@zacatl/service';
import { logger } from '@zacatl/logs';
import { GreetingService } from '../domain';
import type { RouteConfig } from './types';

// ❌ Avoid (mixed order)
import { GreetingService } from '../domain';
import { FastifyRequest } from 'fastify';
import { logger } from '@zacatl/logs';
```

### Subpath Exports for Libraries

```json
{
  "exports": {
    ".": {
      "types": "./build/index.d.ts",
      "import": "./build/index.js"
    },
    "./third-party/fastify": {
      "types": "./build/third-party/fastify.d.ts",
      "import": "./build/third-party/fastify.js"
    },
    "./error": {
      "types": "./build/error/index.d.ts",
      "import": "./build/error/index.js"
    }
  }
}
```

**Usage:**

```typescript
// ✅ Framework-specific import only where needed
import { FastifyInstance } from '@zacatl/third-party/fastify';

// ✅ Core library imports
import { Service } from '@zacatl/zacatl';
import { BadRequestError } from '@zacatl/error';
```

---

## Dependency Lifecycle

### Singleton (Shared Instance)

Use for services that should exist once across the app:

```typescript
container.register(
  GreetingService,
  {
    useClass: GreetingService,
  },
  { lifetime: Lifetime.SINGLETON },
); // tsyringe syntax
```

**Good for:**

- Database connections
- Loggers
- Configuration services
- Repository instances

### Transient (New Instance Per Resolution)

Use for stateful objects that should be isolated:

```typescript
container.register(
  RequestHandler,
  {
    useClass: RequestHandler,
  },
  { lifetime: Lifetime.TRANSIENT },
);
```

**Good for:**

- Request context objects
- Temporary data processors
- Per-request services

---

## Common Pitfalls & Solutions

### Pitfall 1: Domain Layer Depends on Frameworks

**❌ Problem:**

```typescript
// src/service/layers/domain/greeting-service.ts
import { FastifyRequest } from 'fastify'; // Framework in domain!

export class GreetingService {
  async create(req: FastifyRequest) {
    // Couples domain to Fastify
  }
}
```

**✅ Solution:**

```typescript
// Domain accepts plain objects
export class GreetingService {
  async create(input: CreateGreetingInput) {
    // Framework-agnostic
    if (!input.message?.trim()) {
      throw new BadRequestError({ message: 'Message is required' });
    }
    return this.repository.save(input);
  }
}

// Handler translates framework request → domain input
export class CreateGreetingHandler extends PostRouteHandler {
  async execute(request: FastifyRequest): Promise<Greeting> {
    const input: CreateGreetingInput = {
      message: request.body.message,
      author: request.body.author,
    };
    return this.service.create(input);
  }
}
```

### Pitfall 2: Circular Dependencies

**❌ Problem:**

```typescript
// user-service.ts
import { OrderService } from './order-service';

export class UserService {
  constructor(private orderService: OrderService) {}
}

// order-service.ts
import { UserService } from './user-service'; // Circular!

export class OrderService {
  constructor(private userService: UserService) {}
}
```

**✅ Solution:**

```typescript
// Refactor to break cycle — use events or separate shared service
export class UserService {
  constructor(private eventBus: EventBus) {}

  async createUser(input: CreateUserInput) {
    const user = await this.repository.save(input);
    this.eventBus.emit('user.created', { userId: user.id });
    return user;
  }
}

export class OrderService {
  constructor(private eventBus: EventBus) {
    this.eventBus.on('user.created', this.handleUserCreated);
  }

  private handleUserCreated(event: UserCreatedEvent) {
    // React to user creation
  }
}
```

### Pitfall 3: God Objects / Services Doing Too Much

**❌ Problem:**

```typescript
export class UserService {
  async createUser() {}
  async updateUser() {}
  async deleteUser() {}
  async sendWelcomeEmail() {} // Different responsibility!
  async generateReport() {} // Different responsibility!
  async processPayment() {} // Different responsibility!
}
```

**✅ Solution:**

```typescript
// Split into focused services
export class UserService {
  async createUser() {}
  async updateUser() {}
  async deleteUser() {}
}

export class EmailService {
  async sendWelcomeEmail(user: User) {}
}

export class ReportService {
  async generateUserReport(userId: string) {}
}

export class PaymentService {
  async processPayment(payment: Payment) {}
}
```

### Pitfall 4: Hard-Coded Dependencies

**❌ Problem:**

```typescript
export class GreetingService {
  private repository = new GreetingRepository(); // Hard-coded!
  private logger = console; // Hard-coded!
}
```

**✅ Solution:**

```typescript
export class GreetingService {
  constructor(private repository: GreetingRepository, private logger: Logger) {} // Injected dependencies
}
```

### Pitfall 5: Mixing Concerns in Handlers

**❌ Problem:**

```typescript
export class GetGreetingsHandler extends GetRouteHandler {
  async execute(): Promise<Greeting[]> {
    // Don't put business logic here!
    const greetings = await this.repository.findAll();

    // Filtering logic belongs in domain
    return greetings.filter((g) => g.message.length > 5);
  }
}
```

**✅ Solution:**

```typescript
// Domain service handles business logic
export class GreetingService {
  async getValidGreetings(): Promise<Greeting[]> {
    const greetings = await this.repository.findAll();
    return greetings.filter((g) => g.message.length > 5);
  }
}

// Handler delegates to service
export class GetGreetingsHandler extends GetRouteHandler {
  constructor(private service: GreetingService) {}

  async execute(): Promise<Greeting[]> {
    return this.service.getValidGreetings();
  }
}
```

### Pitfall 6: Leaking Infrastructure Details

**❌ Problem:**

```typescript
// Exposes Mongoose document type to domain layer
export interface GreetingPort {
  findAll(): Promise<Document<Greeting>[]>; // Mongoose-specific!
}
```

**✅ Solution:**

```typescript
// Port uses plain domain types
export interface GreetingPort {
  findAll(): Promise<Greeting[]>; // Plain objects
}

// Repository handles conversion
export class MongooseGreetingRepository implements GreetingPort {
  async findAll(): Promise<Greeting[]> {
    const docs = await this.model.find();
    return docs.map((doc) => doc.toObject()); // Convert to plain object
  }
}
```

---

## Real-World Examples from Codebase

### Example 1: CustomError Base Class

```typescript
// src/error/custom.ts
export class CustomError extends Error {
  public readonly custom: boolean;
  public readonly code: ErrorCode;
  public readonly correlationId: string;
  public readonly metadata?: Record<string, unknown>;
  public readonly component?: string;
  public readonly operation?: string;

  constructor(args: CustomErrorArgs & { correlationId?: string }) {
    super(args.message);
    this.id = uuidv4();
    this.correlationId = args.correlationId ?? uuidv4();
    this.custom = true;
    this.name = this.constructor.name;
    this.code = args.code;
    this.metadata = args.metadata;
    this.component = args.component;
    this.operation = args.operation;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      correlationId: this.correlationId,
      metadata: this.metadata,
      component: this.component,
      operation: this.operation,
    };
  }
}
```

### Example 2: Dependency Injection Container

```typescript
// src/dependency-injection/container.ts
export const registerDependencies = <T extends object>(
  dependencies: Constructor<T>[],
  lifecycle: Lifecycle = Lifecycle.SINGLETON,
): void => {
  dependencies.forEach((dep) => {
    const token = dep.name || dep;
    registerSingleton(token, dep);
  });
};

export const resolveDependencies = <T extends object>(dependencies: Constructor<T>[]): T[] => {
  return dependencies.map((dep) => {
    const token = dep.name || dep;
    return resolveDependency<T>(token);
  });
};
```

### Example 3: Configuration Loading with Validation

```typescript
// src/configuration/json.ts
export const loadJSON = <T>(filePath: string, schema: ZodSchema<T>): T => {
  try {
    if (!existsSync(filePath)) {
      throw new BadResourceError({
        message: `Configuration file not found: ${filePath}`,
        component: 'ConfigLoader',
        operation: 'loadJSON',
      });
    }

    const fileContent = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(fileContent);

    // Validate with Zod schema
    const result = schema.safeParse(parsed);

    if (!result.success) {
      throw new ValidationError({
        message: 'Configuration validation failed',
        metadata: { errors: result.error.errors, filePath },
        component: 'ConfigLoader',
        operation: 'loadJSON',
      });
    }

    return result.data;
  } catch (error) {
    if (error instanceof CustomError) throw error;

    throw new InternalServerError({
      message: `Failed to load configuration from ${filePath}`,
      error: error as Error,
      component: 'ConfigLoader',
      operation: 'loadJSON',
    });
  }
};
```

---

## Summary

| Aspect        | Rule                                    |
| ------------- | --------------------------------------- |
| Folder Depth  | 3–4 levels max                          |
| Folder Naming | kebab-case                              |
| Architecture  | Hexagonal/Layered (4 layers)            |
| Layer Rules   | Domain independent; unidirectional deps |
| DI Pattern    | Constructor injection via container     |
| Adapters      | One per framework/database variant      |
| Imports       | Path aliases + consistent order         |
| Index Files   | Barrel exports in every module          |
