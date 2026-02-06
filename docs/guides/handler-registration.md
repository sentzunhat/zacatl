# Handler Registration Patterns

This guide explains how to register REST entry point handlers (hooks and routes) from the Application layer into the Server platform.

## Architecture Overview

- **Application Layer**: Manages entry points and stores handler instances
- **Server Platform**: Registers handlers with the HTTP adapter (Fastify/Express)
- **DI Container**: Centralized dependency registry using tsyringe

## Two Approaches

### Option 1: Token-Based Resolution (Recommended)

The Application automatically registers all handlers with token symbols in the DI container. Server can query these handlers without directly depending on the Application instance.

**Benefits:**

- Loose coupling between Application and Server
- Server doesn't need Application instance
- Works across service boundaries
- Consistent with DI principles

**Usage:**

```typescript
import { Server } from "@zacatl/service/platforms/server";
import { container } from "@zacatl/third-party";

// Resolve server instance
const server = container.resolve(Server);

// Register all REST handlers (hooks + routes) from container
await server.registerAllRestHandlers();

// Or register individually:
await server.registerAllHooks();
await server.registerAllRoutes();

// Start server
await server.start({ port: 3000 });
```

**How it works:**

1. Application registers handlers with tokens during initialization:

   ```typescript
   // In Application.registerRest()
   this.hooks = registerAndResolve(
     restEntryPoints.hooks,
     APPLICATION_TOKENS.HOOK_HANDLER,
   );
   ```

2. Server queries container for all instances registered with that token:

   ```typescript
   // In Server.registerAllHooks()
   const hooks = container.resolveAll<HookHandler>(
     APPLICATION_TOKENS.HOOK_HANDLER,
   );
   ```

3. Server registers each handler with the HTTP adapter (Fastify/Express)

### Option 2: Direct Application Access

Access the Application instance directly to retrieve handler arrays.

**Benefits:**

- Simple and direct
- No DI container queries needed
- Explicit dependencies

**Usage:**

```typescript
import { Application } from "@zacatl/service/layers/application";
import { Server, HandlersType } from "@zacatl/service/platforms/server";
import { container } from "@zacatl/third-party";

// Resolve both instances
const application = container.resolve(Application);
const server = container.resolve(Server);

// Register handlers from Application's public arrays
await server.registerHandlers({
  handlers: application.hooks,
  handlersType: HandlersType.HOOK,
});

await server.registerHandlers({
  handlers: application.routes,
  handlersType: HandlersType.ROUTE,
});

// Start server
await server.start({ port: 3000 });
```

## Token Registry

Available tokens for multi-instance resolution:

```typescript
import { APPLICATION_TOKENS } from "@zacatl/service/layers/application";

// Tokens
APPLICATION_TOKENS.HOOK_HANDLER; // HookHandler instances
APPLICATION_TOKENS.ROUTE_HANDLER; // RouteHandler instances
APPLICATION_TOKENS.CLI_COMMAND; // CLI commands (future)
APPLICATION_TOKENS.IPC_HANDLER; // IPC handlers (future)
```

## Complete Example

```typescript
import { Application } from "@zacatl/service/layers/application";
import { Server } from "@zacatl/service/platforms/server";
import { container } from "@zacatl/third-party";

// Configure and start Application
const application = new Application({
  autoRegister: true,
  entryPoints: {
    rest: {
      hooks: [LoggerHook, AuthHook],
      routes: [UserRoute, ProductRoute],
    },
  },
});

application.start();

// Server automatically picks up handlers from container
const server = container.resolve(Server);
await server.registerAllRestHandlers();
await server.start({ port: 3000 });
```

## Server Methods

### `registerAllRestHandlers()`

Registers all REST entry points (hooks + routes) from the container in one call.

### `registerAllHooks()`

Registers only hook handlers from the container.

### `registerAllRoutes()`

Registers only route handlers from the container.

### `registerHandlers(input)`

Low-level method to register a specific array of handlers. Useful for custom registration logic.

```typescript
await server.registerHandlers({
  handlers: [new CustomHook()],
  handlersType: HandlersType.HOOK,
});
```

## Under the Hood

The `registerAndResolve` utility function:

```typescript
export const registerAndResolve = <T>(
  dependencies: Array<Constructor<T>>,
  token?: symbol,
): T[] => {
  const instances: T[] = [];
  for (const dependency of dependencies) {
    // Register class by name
    container.register(dependency.name, { useClass: dependency });

    // Resolve instance
    const instance = container.resolve<T>(dependency.name);
    instances.push(instance);

    // Also register with token for multi-instance queries
    if (token) {
      container.register(token, { useValue: instance });
    }
  }
  return instances;
};
```

This allows:

- Single instance resolution: `container.resolve(UserRoute)`
- Multi-instance resolution by token: `container.resolveAll(APPLICATION_TOKENS.ROUTE_HANDLER)`

## Best Practices

1. **Use token-based resolution** when Server shouldn't directly depend on Application
2. **Use direct access** when you need fine-grained control or Application instance is already available
3. **Call `registerAllRestHandlers()`** in Server startup sequence for automatic handler registration
4. **Extend the pattern** for CLI and IPC entry points when implementing those features
