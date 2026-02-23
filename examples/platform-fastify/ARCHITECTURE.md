# Zacatl Examples - Folder Structure & Architecture Guide

This document defines the recommended folder structure and architecture pattern for all Zacatl Fastify examples.

## Core Principles

1. **Layered Architecture**: Clear separation between application, domain, and infrastructure layers
2. **Hexagonal/Ports-and-Adapters**: Domain layer defines contracts (ports), infrastructure provides implementations (adapters)
3. **Feature-Based Organization**: One feature per folder (e.g., `greetings/`, `users/`, `posts/`)
4. **Flat Within Features**: Minimize nesting depth - files should be quick to navigate
5. **Type Safety**: Extensive use of interfaces and TypeScript for compile-time safety
6. **ESM Native**: No CommonJS, clean `.js` import extensions via post-build script

## Recommended Folder Structure

```
src/
├── application/                    # Entry points (HTTP handlers, CLI commands, etc.)
│   └── handlers/
│       └── greetings/             # Feature: Greetings
│           ├── create-greeting/
│           │   └── handler.ts
│           ├── delete-greeting/
│           │   └── handler.ts
│           ├── get-all-greetings/
│           │   └── handler.ts
│           ├── get-greeting-by-id/
│           │   └── handler.ts
│           ├── get-random-greeting/
│           │   └── handler.ts
│           ├── greeting.schema.ts  # Zod schemas for validation
│           └── greeting.serializer.ts # Response serializers
│
├── domain/                         # Business logic (technology-independent)
│   ├── greetings/                 # Feature: Greetings
│   │   ├── greeting.model.ts      # Domain model (entity)
│   │   ├── greeting.service.ts    # Service adapter (implementation)
│   │   └── greeting.service.port.ts # Service interface
│   │
│   ├── models/                    # Domain models
│   │   ├── greeting.ts
│   │   └── user.ts
│   │
│   └── dtos/                      # Data transfer objects (if needed)
│       └── greeting.dto.ts
│
├── infrastructure/                 # Technology implementations
│   ├── greetings/                 # Feature: Greetings
│   │   ├── models/
│   │   │   └── greeting.model.ts  # Sequelize/Mongoose model
│   │   ├── repositories/
│   │   │   ├── greeting/
│   │   │   │   ├── adapter.ts     # Repository implementation
│   │   │   │   └── port.ts        # Repository interface
│   │   │   └── repositories.ts    # DI exports
│   │   └── migrations/            # Database migrations (if applicable)
│   │       └── 001-create-greeting.sql
│   │
│   └── database/                  # Database configuration
│       ├── connection.ts
│       └── migrations.ts
│
├── config.ts                       # Application configuration
├── di.ts                          # Dependency injection setup
├── index.ts                       # Application entry point
└── init-di.ts                     # DI initialization for decorators
```

## Detailed Layer Responsibilities

### Application Layer (`application/`)

**Purpose**: HTTP request entry points, validation, orchestration

**Responsibilities**:

- Parse incoming requests
- Validate using schemas (Zod)
- Call domain services
- Serialize responses
- Handle HTTP-specific concerns (status codes, headers)

**Key Patterns**:

```typescript
// application/handlers/greetings/create-greeting/handler.ts
@singleton()
export class CreateGreetingHandler extends AbstractRouteHandler<
  CreateGreetingBody, // Request body type
  void, // Query params type
  GreetingResponse // Response type
> {
  constructor(
    @inject(GreetingServiceAdapter)
    private readonly greetingService: GreetingServiceAdapter,
  ) {
    super({
      url: '/greetings',
      method: 'POST',
      schema: { body: CreateGreetingBodySchema },
    });
  }

  async handler(
    request: Request<CreateGreetingBody>,
    reply: FastifyReply,
  ): Promise<GreetingResponse> {
    const greeting = await this.greetingService.createGreeting(request.body);
    return toGreetingResponse(greeting);
  }
}
```

**Best Practices**:

- Keep handlers thin
- Move complex logic to services
- Use schema validation for all inputs
- Use serializers for consistent responses
- Don't import directly from infrastructure

### Domain Layer (`domain/`)

**Purpose**: Business logic, rules, and models (framework/database agnostic)

**Responsibilities**:

- Define business entities
- Implement business rules
- Define service contracts (ports)
- Handle domain-specific validations

**Key Patterns**:

**Model **:

```typescript
// domain/greetings/greeting.model.ts
export interface Greeting {
  id: string;
  message: string;
  language: string;
  createdAt: Date;
}

export interface CreateGreetingInput {
  message: string;
  language: string;
}
```

**Service Port (Interface)**:

```typescript
// domain/greetings/greeting.service.port.ts
export interface GreetingServicePort {
  getGreeting(id: string): Promise<Greeting | null>;
  getAllGreetings(language?: string): Promise<Greeting[]>;
  createGreeting(input: CreateGreetingInput): Promise<Greeting>;
  deleteGreeting(id: string): Promise<boolean>;
}
```

**Service Adapter (Implementation)**:

```typescript
// domain/greetings/greeting.service.ts
@singleton()
export class GreetingServiceAdapter implements GreetingServicePort {
  constructor(
    @inject(GreetingRepositoryAdapter)
    private readonly greetingRepository: GreetingRepositoryAdapter,
  ) {}

  async createGreeting(input: CreateGreetingInput): Promise<Greeting> {
    // Business logic: validate, normalize, etc.
    if (!input.message?.trim()) {
      throw new Error('Message cannot be empty');
    }

    const normalized: CreateGreetingInput = {
      ...input,
      language: input.language.toLowerCase(),
    };

    // Delegate to repository
    return this.greetingRepository.create(normalized);
  }
}
```

**Best Practices**:

- Define interfaces (ports) in `.port.ts` files
- Implement adapters in `.ts` files
- Contain all business logic here
- Test domain logic independently
- Don't import from infrastructure (except ports)
- Keep it simple and focused

### Infrastructure Layer (`infrastructure/`)

**Purpose**: Technology implementations (database, external APIs, caching, etc.)

**Responsibilities**:

- Define database models
- Implement repositories
- Handle database connections
- Execute persistence logic

**Key Patterns**:

**Repository Port (Interface)**:

```typescript
// infrastructure/greetings/repositories/greeting/port.ts
export interface GreetingRepositoryPort {
  findById(id: string): Promise<Greeting | null>;
  findAll(filter?: { language?: string }): Promise<Greeting[]>;
  create(input: CreateGreetingInput): Promise<Greeting>;
  delete(id: string): Promise<Greeting | null>;
}
```

**Repository Adapter**:

```typescript
// infrastructure/greetings/repositories/greeting/adapter.ts
@singleton()
export class GreetingRepositoryAdapter
  extends SequelizeRepository<GreetingModel, CreateGreetingInput, Greeting>
  implements GreetingRepositoryPort
{
  constructor() {
    super({ model: GreetingModel });
  }

  async findAll(filter?: { language?: string }): Promise<Greeting[]> {
    const where = filter?.language ? { language: filter.language } : {};
    const models = await GreetingModel.findAll({ where });
    return models.map((m) => this.toLean(m));
  }
}
```

**Best Practices**:

- Repositories implement domain service ports
- Keep infrastructure concerns isolated
- Use adapters from Zacatl for consistency
- Don't leak database models to domain layer
- Handle all persistence here

## Adding a New Feature

To add a new feature (e.g., `posts`), follow this template:

### 1. Create Domain Layer

```typescript
// domain/posts/post.model.ts
export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: Date;
}

export interface CreatePostInput {
  title: string;
  content: string;
  authorId: string;
}
```

```typescript
// domain/posts/post.service.port.ts
export interface PostServicePort {
  getPost(id: string): Promise<Post | null>;
  getAllPosts(): Promise<Post[]>;
  createPost(input: CreatePostInput): Promise<Post>;
  updatePost(id: string, input: Partial<CreatePostInput>): Promise<Post>;
  deletePost(id: string): Promise<boolean>;
}
```

```typescript
// domain/posts/post.service.ts
@singleton()
export class PostServiceAdapter implements PostServicePort {
  constructor(
    @inject(PostRepositoryAdapter)
    private readonly postRepository: PostRepositoryAdapter,
  ) {}

  // Implement methods...
}
```

### 2. Create Infrastructure Layer

```typescript
// infrastructure/posts/models/post.model.ts
export class PostModel extends Model implements Omit<Post, 'id'> {
  declare title: string;
  declare content: string;
  declare authorId: string;
}

PostModel.init(
  {
    /* ... */
  },
  { sequelize, tableName: 'posts' },
);
```

```typescript
// infrastructure/posts/repositories/post/port.ts
export interface PostRepositoryPort {
  // Same as domain layer...
}
```

```typescript
// infrastructure/posts/repositories/post/adapter.ts
@singleton()
export class PostRepositoryAdapter
  extends SequelizeRepository<PostModel, CreatePostInput, Post>
  implements PostRepositoryPort
{
  constructor() {
    super({ model: PostModel });
  }
}
```

### 3. Create Application Layer

```typescript
// application/handlers/posts/create-post/handler.ts
@singleton()
export class CreatePostHandler extends AbstractRouteHandler<CreatePostInput, void, PostResponse> {
  constructor(
    @inject(PostServiceAdapter)
    private readonly postService: PostServiceAdapter,
  ) {
    super({
      url: '/posts',
      method: 'POST',
      schema: { body: CreatePostBodySchema },
    });
  }

  async handler(request: Request<CreatePostInput>, reply: FastifyReply): Promise<PostResponse> {
    const post = await this.postService.createPost(request.body);
    return toPostResponse(post);
  }
}
```

### 4. Register in DI

```typescript
// di.ts
import { PostServiceAdapter } from './domain/posts/post.service';
import { PostRepositoryAdapter } from './infrastructure/posts/repositories/post/adapter';
import { CreatePostHandler } from './application/handlers/posts/create-post/handler';

// These are auto-registered via @singleton() decorators
```

## File Naming Conventions

| Layer                    | Pattern                                               | Example                      |
| ------------------------ | ----------------------------------------------------- | ---------------------------- |
| Application Handlers     | `{action}-{entity}/handler.ts`                        | `create-greeting/handler.ts` |
| Domain Models            | `{entity}.model.ts`                                   | `greeting.model.ts`          |
| Domain Services          | `{entity}.service.ts` (adapter)                       | `greeting.service.ts`        |
| Domain Contracts         | `{entity}.service.port.ts` (interface)                | `greeting.service.port.ts`   |
| Infrastructure Models    | `{entity}.model.ts`                                   | `greeting.model.ts`          |
| Infrastructure Repos     | `{entity}.ts` (in `repositories/{entity}/adapter.ts`) | `adapter.ts`                 |
| Infrastructure Contracts | `port.ts` (in `repositories/{entity}/`)               | `port.ts`                    |

## Dependency Flow

```
Application Layer
    ↓ (depends on)
Domain Layer (Ports)
    ↓ (depends on)
Infrastructure Layer (Adapters)
```

The domain never imports from application or infrastructure. Application imports from domain. Infrastructure imports from domain ports.

## Common Mistakes to Avoid

1. ❌ Importing infrastructure models into handlers

   - ✅ Use domain models instead

2. ❌ Business logic in handlers

   - ✅ Move to domain services

3. ❌ Multiple responsibilities per layer

   - ✅ Keep layers focused

4. ❌ Mixing ports and adapters

   - ✅ Keep interfaces (`.port.ts`) separate from implementations

5. ❌ Deep nesting (more than 3-4 levels)

   - ✅ Flatten within features

6. ❌ Circular dependencies
   - ✅ Follow the dependency flow

## Best Practices

✅ **Define interfaces first** - Start with ports, implement adapters

✅ **Keep it DRY** - Extract common logic to services

✅ **Use dependency injection** - All major classes use `@singleton()` and `@inject()`

✅ **Type everything** - Full TypeScript typing, no `any`

✅ **Single responsibility** - Each class does one thing

✅ **Test layers independently** - Mock dependencies at layer boundaries

✅ **Document public APIs** - Clear JSDoc for service contracts

✅ **Keep domain logic pure** - No side effects, deterministic outcomes
