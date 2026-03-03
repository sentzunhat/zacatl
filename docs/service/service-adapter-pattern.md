# Service Adapter Pattern

_Last Updated: 2026-02-04_

**Single source of truth for implementation.** If you are an AI agent, start here.

**Related:**

- [AI Agent Implementation Guide](./agent-implementation-guide.md)
- [DI Registration Patterns](../dependency-injection/patterns.md)

## 🎯 Purpose

This guide shows the **canonical pattern** for building Zacatl services. This is the **ONLY** recommended approach for new implementations.

## ⚠️ Critical Rules

### ❌ NEVER Do This:

```typescript
// OLD PATTERN - Don't use
container.register('Repository', { useValue: repo });
container.register(Service, { useClass: Service });
```

### ✅ ALWAYS Do This:

```typescript
// NEW PATTERN - Use class tokens for type-safe DI
const greetingRepository = new GreetingRepositoryAdapter();
container.registerInstance(GreetingRepositoryAdapter, greetingRepository);

const greetingService = new GreetingService(greetingRepository);
container.registerInstance(GreetingService, greetingService);

container.registerSingleton(GetAllHandler, GetAllHandler);
```

## 📋 Complete Implementation Pattern

### 1. **DI Registration** (Before Service initialization)

```typescript
import { container } from 'tsyringe';

// Repositories - use registerInstance with class tokens
const repository = new MyRepositoryAdapter();
container.registerInstance(MyRepositoryAdapter, repository);

// Domain Services - instantiate and register with class tokens
const domainService = new MyDomainService(repository);
container.registerInstance(MyDomainService, domainService);

// Handlers - use registerSingleton (they depend on domain services via @inject)
container.registerSingleton(GetAllHandler, GetAllHandler);
container.registerSingleton(GetByIdHandler, GetByIdHandler);
container.registerSingleton(CreateHandler, CreateHandler);
```

### 2. **Service Configuration**

```typescript
import { Service } from '@sentzunhat/zacatl/service';
import { ServiceType, ServerType, ServerVendor, DatabaseVendor } from '@sentzunhat/zacatl';

const serviceConfig = {
  type: ServiceType.SERVER,
  platforms: {
    server: {
      name: 'my-service',
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.EXPRESS, // or FASTIFY
        instance: app,
      },
      databases: [
        {
          vendor: DatabaseVendor.SEQUELIZE, // or MONGOOSE
          instance: sequelize,
          connectionString: databaseUrl,
          onDatabaseConnected: async (db: unknown) => {
            // Initialize models/schemas
            initModels(db);
            await db.sync({ alter: true });
          },
        },
      ],
    },
  },
  layers: {
    application: {
      entryPoints: {
        rest: {
          hooks: [],
          routes: [GetAllHandler, GetByIdHandler, CreateHandler, DeleteHandler],
        },
      },
    },
    domain: {
      providers: [], // ⚠️ ALWAYS EMPTY ARRAY
    },
    infrastructure: {
      repositories: [], // ⚠️ ALWAYS EMPTY ARRAY
    },
  },
};
```

### 3. **Service Initialization**

```typescript
const service = new Service(serviceConfig);
const port = process.env['PORT'] ? parseInt(process.env['PORT']!, 10) : 8080;
await service.start({ port });
```

## 🏗️ Handler Pattern with AbstractRouteHandler

All handlers **MUST** extend `AbstractRouteHandler`:

```typescript
import { injectable, inject } from 'tsyringe';
import { AbstractRouteHandler } from '@sentzunhat/zacatl/service';
import { HttpMethod } from '@sentzunhat/zacatl';
import { GreetingService } from '../domain/services/greeting.service';

interface CreateBody {
  message: string;
  language: string;
}

@injectable()
export class CreateGreetingHandler extends AbstractRouteHandler<
  CreateBody,
  never,
  { id: string; message: string }
> {
  constructor(
    @inject(GreetingService)
    private readonly greetingService: GreetingService,
  ) {
    super();
  }

  method = HttpMethod.POST;
  path = '/greetings';

  async execute(body: CreateBody): Promise<{ id: string; message: string }> {
    const greeting = await this.greetingService.createGreeting(body);
    return { id: greeting.id, message: greeting.message };
  }
}
```

## 📁 File Structure

```
src/
├── index.ts                          # Entry point with DI + Service config
├── application/
│   └── handlers/
│       ├── get-all.handler.ts        # extends AbstractRouteHandler
│       ├── get-by-id.handler.ts
│       ├── create.handler.ts
│       └── delete.handler.ts
├── domain/
│   ├── models/                       # Domain entities
│   ├── ports/                        # Repository interfaces
│   └── services/                     # Domain services
└── infrastructure/
    ├── models/                       # DB models (Sequelize/Mongoose)
    └── repositories/                 # Repository implementations
```

## 🚫 Common Mistakes

### 1. Using `providers` array

```typescript
// ❌ WRONG
domain: {
  providers: [{ service: MyService, dependencies: [] }];
}

// ✅ CORRECT
domain: {
  providers: []; // Always empty
}
```

### 2. Using old DI syntax

```typescript
// ❌ WRONG
container.register(Service, { useClass: Service });
container.register('Repository', { useValue: repo });

// ✅ CORRECT - Use class tokens for type safety
container.registerInstance(MyService, new MyService(repo));
container.registerInstance(MyRepositoryAdapter, new MyRepositoryAdapter());
container.registerSingleton(MyHandler, MyHandler);
```

### 3. Not extending AbstractRouteHandler

```typescript
// ❌ WRONG
export class MyHandler {
  async handle(req: Request, res: Response) { ... }
}

// ✅ CORRECT
export class MyHandler extends AbstractRouteHandler<Body, Query, Reply> {
  method = HttpMethod.GET;
  path = "/my-path";
  async execute(body: Body, query: Query): Promise<Reply> { ... }
}
```

## 🎯 Quick Reference Checklist

When implementing a new service, verify:

- [ ] All repositories instantiated with `new` and registered via `registerInstance`
- [ ] All domain services instantiated with dependencies and registered via `registerInstance`
- [ ] All handlers registered via `registerSingleton`
- [ ] All handlers extend `AbstractRouteHandler`
- [ ] `domain.providers` is empty array `[]`
- [ ] `infrastructure.repositories` is empty array `[]`
- [ ] Routes array contains handler classes (not instances)
- [ ] Service config passed to `new Service(config)`
- [ ] No manual Express/Fastify route registration

## 💡 Why This Pattern?

1. **Consistent DI**: Service class expects dependencies already registered
2. **Type Safety**: TypeScript ensures correct handler types
3. **No Boilerplate**: Service handles routing automatically from AbstractRouteHandler
4. **Testable**: DI makes mocking trivial
5. **Framework Agnostic**: Same pattern works for Express, Fastify, etc.

## 📚 Complete Examples

See these examples for full implementations:

- `examples/express-mongodb-react/backend/src/index.ts`
- `examples/fastify-sqlite-react/backend/src/index.ts`
- `examples/fastify-mongodb-react/backend/src/index.ts`

Each example follows this exact pattern - use them as reference templates.
