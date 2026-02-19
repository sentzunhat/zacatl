# Dependency Injection Registration Patterns

_Last Updated: 2026-02-04_

**Related:** [Service Adapter Pattern](../service/service-adapter-pattern.md)

## Overview

This document defines the **canonical DI registration patterns** for Zacatl services using `tsyringe`.

## Registration Methods

### `registerInstance()`

**Use for:** Services and repositories you instantiate yourself with dependencies.

**Pattern:**

```typescript
const repository = new MyRepository();
container.registerInstance(MyRepository, repository);

const service = new MyService(repository);
container.registerInstance(MyService, service);
```

**Why:** You control instantiation and can pass dependencies explicitly.

### `registerSingleton()`

**Use for:** Handlers that depend on services via DI.

**Pattern:**

```typescript
container.registerSingleton(GetAllHandler, GetAllHandler);
container.registerSingleton(CreateHandler, CreateHandler);
```

**Why:** Handlers have `@injectable()` decorator and dependencies injected via `@inject()`. The container auto-resolves them.

## ❌ Deprecated Patterns

### DO NOT USE: `useValue` / `useClass`

```typescript
// ❌ WRONG - Old tsyringe syntax
container.register("Repository", { useValue: repository });
container.register(Service, { useClass: Service });
```

**Why deprecated:**

- Verbose and error-prone
- Inconsistent with modern tsyringe usage
- Makes DI flow harder to trace

## Complete Registration Flow

### 1. Infrastructure Layer (Repositories)

```typescript
// Repositories implement port interfaces
import { MySequelizeRepository } from "./infrastructure/repositories/my.repository";
import { MyRepositoryPort } from "./domain/ports/my-repository.port";

const myRepository = new MySequelizeRepository();
container.registerInstance(MyRepositoryPort, myRepository);
```

**Key points:**

- Instantiate with `new`
- Register with class/abstract token (matches `@inject(MyRepositoryPort)`)
- Repository is concrete implementation of a port contract

### 2. Domain Layer (Services)

```typescript
// Services depend on repository ports
import { MyService } from "./domain/services/my.service";

const myService = new MyService(myRepository);
container.registerInstance(MyService, myService); // Class token
```

**Key points:**

- Pass repository as constructor argument
- Register with class token for type safety

### 3. Application Layer (Handlers)

```typescript
// Handlers depend on services via @inject
import { GetAllHandler } from "./application/handlers/get-all.handler";
import { CreateHandler } from "./application/handlers/create.handler";

container.registerSingleton(GetAllHandler, GetAllHandler);
container.registerSingleton(CreateHandler, CreateHandler);
```

**Key points:**

- Use `registerSingleton` (not `registerInstance`)
- Container auto-resolves dependencies marked with `@inject()`
- Each handler is a singleton

## Injection Patterns

### Constructor Injection

```typescript
import { injectable, inject } from "tsyringe";

@injectable()
export class MyService {
  constructor(
    @inject(MyRepositoryPort) private readonly myRepository: MyRepositoryPort,
  ) {}
}

@injectable()
export class MyHandler extends AbstractRouteHandler<Body, Query, Reply> {
  constructor(@inject(MyService) private readonly myService: MyService) {
    super();
  }
}
```

**Key points:**

- Use `@injectable()` on class
- Use `@inject(ClassToken)` for class-based tokens
- Use abstract class ports for contract-driven injection

## Registration Order

**Critical:** Register dependencies in correct order.

```typescript
// 1. Infrastructure first (no dependencies)
const repository = new MyRepository();
container.registerInstance(MyRepository, repository);

// 2. Domain services next (depend on repositories)
const service = new MyService(repository);
container.registerInstance(MyService, service);

// 3. Handlers last (depend on services via @inject)
container.registerSingleton(MyHandler, MyHandler);
```

**Why:** Each layer depends on the previous layer. Out-of-order registration causes resolution failures.

## Common Mistakes

### 1. Forgetting `@injectable()`

```typescript
// ❌ WRONG
export class MyHandler extends AbstractRouteHandler<...> {
  constructor(private service: MyService) {}
}

// ✅ CORRECT
@injectable()
export class MyHandler extends AbstractRouteHandler<...> {
  constructor(@inject(MyService) private service: MyService) {}
}
```

### 2. Using `resolve()` instead of `registerSingleton()`

```typescript
// ❌ WRONG - Don't manually resolve handlers
const handler = container.resolve(MyHandler);

// ✅ CORRECT - Let Service class resolve
container.registerSingleton(MyHandler, MyHandler);
// Then use in Service config:
routes: [MyHandler];
```

### 3. Registering instances in routes array

```typescript
// ❌ WRONG
const handler = new MyHandler(service);
routes: [handler];

// ✅ CORRECT
container.registerSingleton(MyHandler, MyHandler);
routes: [MyHandler];
```

## Token Types

### Class Tokens (Recommended)

```typescript
container.registerInstance(MyService, service);

// Injected as:
@inject(MyService) private service: MyService
```

**Use when:** You want to inject a concrete class.

### Abstract Class Tokens (Manual Binding)

```typescript
abstract class MyRepositoryPort {
  abstract findById(id: string): Promise<MyEntity | null>;
}

container.registerInstance(MyRepositoryPort, repository);

// Injected as:
@inject(MyRepositoryPort) private repo: MyRepositoryPort
```

**Use when:** You need a swappable contract. Register the binding manually before creating a `Service`.

## Complete Example

```typescript
import "@sentzunhat/zacatl/third-party/reflect-metadata";
import { container } from "@sentzunhat/zacatl/dependency-injection";

// Infrastructure
import { SequelizeGreetingRepository } from "./infrastructure/repositories/greeting.repository";
import { GreetingRepositoryAdapter } from "./domain/ports/greeting.repository";

// Domain
import { GreetingService } from "./domain/services/greeting.service";

// Application
import { GetAllGreetingsHandler } from "./application/handlers/get-all-greetings.handler";
import { CreateGreetingHandler } from "./application/handlers/create-greeting.handler";

// ═══════════════════════════════════════════════════════════
// DI REGISTRATION
// ═══════════════════════════════════════════════════════════

// 1. Infrastructure Layer
const greetingRepository = new SequelizeGreetingRepository();
container.registerInstance(GreetingRepositoryAdapter, greetingRepository);

// 2. Domain Layer
const greetingService = new GreetingService(greetingRepository);
container.registerInstance(GreetingService, greetingService);

// 3. Application Layer
container.registerSingleton(GetAllGreetingsHandler, GetAllGreetingsHandler);
container.registerSingleton(CreateGreetingHandler, CreateGreetingHandler);
```

## Debugging DI Issues

### "Cannot resolve dependency"

**Cause:** Dependency not registered before resolution.

**Fix:** Check registration order. Register dependencies before dependents.

### "No matching constructor"

**Cause:** Missing `@injectable()` decorator.

**Fix:** Add `@injectable()` to class definition.

### "Cannot inject undefined"

**Cause:** Missing `@inject()` decorator on constructor parameter.

**Fix:** Add `@inject(ClassToken)` to constructor parameter.

## Summary

| Layer          | Method              | Token Type     | Example                                          |
| -------------- | ------------------- | -------------- | ------------------------------------------------ |
| Infrastructure | `registerInstance`  | Abstract/Class | `container.registerInstance(MyRepoPort, repo)`   |
| Domain         | `registerInstance`  | Class          | `container.registerInstance(MyService, service)` |
| Application    | `registerSingleton` | Class          | `container.registerSingleton(Handler, Handler)`  |

**Remember:**

- Infrastructure → Domain → Application (bottom to top)
- `@injectable()` on all DI-managed classes
- `@inject(ClassToken)` for constructor parameters
- No `useValue` or `useClass`
