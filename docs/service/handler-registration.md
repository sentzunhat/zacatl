# Handler Registration Patterns

This guide explains how REST entry point handlers (hooks and routes) are registered when using the `Service` class.

## How It Works

The `Service` class orchestrates handler registration automatically:

1. **`Application` layer** — during construction, registers all hooks and routes with `container.registerSingleton()`, then immediately resolves them.
2. **`Service.start()`** — calls `platforms.registerEntrypoints(entryPoints)`, which passes the `rest` entry points to the server platform.
3. **`Server.registerEntrypoints(rest)`** — iterates hooks and routes, calling the underlying HTTP adapter (Fastify or Express) to register each one.

You do not need to call any registration methods manually when using the `Service` class.

## Standard Usage

Declare handlers in the `Service` configuration. The framework handles the rest:

```typescript
import Fastify from "fastify";
import { Service, ServiceType, ServerType, ServerVendor } from "@sentzunhat/zacatl";
import { container } from "@sentzunhat/zacatl/third-party";

// Register repositories and services before constructing Service
const repo = new UserRepository();
container.registerInstance(UserRepository, repo);

const userService = new UserService(repo);
container.registerInstance(UserService, userService);

container.registerSingleton(GetUsersHandler, GetUsersHandler);
container.registerSingleton(CreateUserHandler, CreateUserHandler);

const fastify = Fastify();

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    application: {
      entryPoints: {
        rest: {
          hooks: [AuthHook],
          routes: [GetUsersHandler, CreateUserHandler],
        },
      },
    },
  },
  platforms: {
    server: {
      name: "user-service",
      port: 3000,
      server: { type: ServerType.SERVER, vendor: ServerVendor.FASTIFY, instance: fastify },
      databases: [],
    },
  },
});

await service.start();
```

## Registration Order

Register dependencies in this order **before** constructing `Service`:

```typescript
// 1. Repositories (no dependencies)
const repo = new MyRepository();
container.registerInstance(MyRepository, repo);

// 2. Domain services (depend on repositories)
const myService = new MyService(repo);
container.registerInstance(MyService, myService);

// 3. Handlers (resolved via @inject by the container)
container.registerSingleton(MyHandler, MyHandler);
```

## `HandlersType` Enum

The `HandlersType` enum is exported for internal use by adapters:

```typescript
import { HandlersType } from "@sentzunhat/zacatl";

HandlersType.HOOK;  // "HOOK"
HandlersType.ROUTE; // "ROUTE"
```

## Best Practices

1. Register all dependencies before constructing `Service`.
2. Use `container.registerSingleton` for handlers decorated with `@injectable()`.
3. Use `container.registerInstance` for manually constructed repositories and services.
4. Keep the `routes` array in `layers.application.entryPoints.rest` — do not register routes with the HTTP framework directly.

