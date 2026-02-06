# Architecture Decision Record: Platform & Server Refactoring

**Version:** 2.0  
**Date:** 2026-02-05  
**Status:** Accepted → Implemented

---

## Title

Simple Platform Wrapper for v0.1.0

---

## Context

The current Zacatl architecture couples platform detection, service orchestration, and route/hook registration responsibilities into a single `Service` class. As the framework grows to support multiple platforms (Server, CLI, Desktop) and different adapters (Fastify, Express), this monolithic approach creates friction:

- **Tight coupling**: Service class handles platform-specific logic for all platforms
- **Hard to extend**: Adding a new platform requires modifying Service class
- **Registration complexity**: Route/hook registration logic mixed with Service lifecycle
- **Testability**: Difficult to unit test platform behavior in isolation

**Business driver**: v0.1.0 marks a major refactoring. We want to establish a scalable foundation for future platform support (CLI plugins, desktop app variants, edge computing).

---

## Problem Statement

How do we separate concerns so that:

1. Each platform (Server/CLI/Desktop) is a first-class citizen with its own initialization and registration
2. Service becomes a simple orchestrator, not a registration handler
3. Platforms can be extended without modifying core Service logic
4. Keep the design simple and straightforward - no factories or complex patterns

---

## Decision

**Create a single `Platform` class that wraps server, cli, or desktop instances.**

We will:

1. **Create one `Platform` class** that has properties for each platform type
2. **Platform exposes underlying instances** (server, cli, desktop) directly
3. **Service creates Platform** with type and config in constructor
4. **Service accesses platform instances** via `platform.server`, `platform.cli`, `platform.desktop`
5. **No factory pattern** - simple constructor-based instantiation
6. **Keep names lowercase and simple** - following framework guidelines

Create `ServerRegistration`, `CLIRegistration`, `DesktopRegistration` classes that Server/CLI/Desktop delegate to.

**Pros:**

- Separates concerns somewhat
- More testable

**Cons:**

- Still class-heavy, not functional
- Doesn't reduce complexity, just reorganizes it
- Doesn't align with "functions for module communication"

**Decision:** ❌ Rejected

### Option 3: Platform Abstraction + Functional Registration (CHOSEN)

Create abstract `Platform` base class, implement `ServerPlatform`, `CLIPlatform`, `DesktopPlatform`. Move route/hook registration to pure functions that platforms compose.

**Pros:**

- Clean separation of concerns
- Functional registration aligns with module communication
- Easy to add new platforms
- Platform classes own their lifecycle
- Pure functions for registration are testable
- Aligns with existing Layers pattern (layers register dependencies)

**Cons:**

- Larger refactor
- More files to maintain
- Requires new function signatures for registration
- Tests need updating

**Decision:** ✅ **CHOSEN**

---

## Decision

**Adopt Option 3: Platform Abstraction + Functional Registration System**

We will:

1. **Keep abstract `Platform` class** as base for all platforms
2. **Create `ServerPlatform` class** (extends Platform) that:
   - Owns HTTP server configuration and lifecycle

---

## Implementation

### Simple Platform Class

```typescript
// Single Platform class that wraps server, cli, or desktop
export class Platform {
  server?: Server;
  cli?: CLI;
  desktop?: Desktop;

  constructor(type: ServiceType, config: ConfigPlatforms) {
    switch (type) {
      case ServiceType.SERVER:
        if (config.server) {
          this.server = new Server(config.server);
        }
        break;

      case ServiceType.CLI:
        if (config.cli) {
          this.cli = new CLI(config.cli);
        }
        break;

      case ServiceType.DESKTOP:
        if (config.desktop) {
          this.desktop = new Desktop(config.desktop);
        }
        break;
    }
  }
}
```

### Service (Simplified)

```typescript
export class Service {
  private readonly type: ServiceType;
  private platform: Platform;

  constructor(config: ConfigService) {
    // ... i18n setup ...
    this.validateConfig(config);
    this.type = config.type!;

    // Create Layers
    if (config.layers) {
      new Layers(config.layers);
    }

    // Create Platform with type and config
    this.platform = new Platform(this.type, config.platforms);
  }

  async start(input?: { port?: number }): Promise<void> {
    switch (this.type) {
      case ServiceType.SERVER:
        await this.platform.server?.start({ port: input?.port ?? 3000 });
        break;
      case ServiceType.CLI:
        await this.platform.cli?.start(input);
        break;
      case ServiceType.DESKTOP:
        await this.platform.desktop?.start(input);
        break;
    }
  }
}
```

---

## Advantages

✅ **Simple & Direct**

- One class, no factory pattern
- Easy to understand and maintain
- Direct access to underlying instances

✅ **Separation of Concerns**

- Platform logic isolated from Service
- Service becomes simple orchestrator
- Each platform type (Server/CLI/Desktop) remains independent

✅ **Extensibility**

- Easy to add new platform types
- No need to modify Service class significantly
- Platform properties can be accessed directly

✅ **Type Safety**

- TypeScript knows which property exists based on ServiceType
- Strong typing for all platform instances
- No string tokens or loose coupling

---

## Implementation Plan

### Phase 1: Platform Class (Completed)

- [x] Create single `Platform` class
- [x] Remove factory pattern
- [x] Remove separate platform classes (ServerPlatform, CLIPlatform, DesktopPlatform)
- [x] Update exports in `src/service/platforms/index.ts`

### Phase 2: Service Refactor (Completed)

- [x] Update Service to create Platform instance
- [x] Service accesses platform.server/cli/desktop directly
- [x] Update Service.start() to use platform instances

### Phase 3: Testing (Next)

- [ ] Update existing 183 tests for new architecture
- [ ] Ensure all tests pass
- [ ] Maintain 79%+ coverage

### Phase 4: Examples & Docs (Next)

- [ ] Update example projects
- [ ] Create migration guide: v0.0.27 → v0.1.0
- [ ] Update README

### Phase 5: Release (Next)

- [ ] Update changelog
- [ ] Bump version to 0.1.0
- [ ] Publish to npm
      export async function registerRestRoutes(
      handlers: RouteHandler[],
      server: Server,
      ): Promise<void> {
      for (const handler of handlers) {
      server.registerRoute(handler);
      }
      }

export async function registerRestHooks(
handlers: HookHandler[],
server: Server,
): Promise<void> {
for (const handler of handlers) {
server.registerHook(handler);
}
}

// Composition function
export async function registerAllRestHandlers(
routes: RouteHandler[],
hooks: HookHandler[],
server: Server,
): Promise<void> {
await registerRestRoutes(routes, server);
await registerRestHooks(hooks, server);
}

````

### Service (Simplified)

```typescript
export class Service {
  private platform?: Platform;

  constructor(config: ConfigService) {
    const { type, platforms } = config;

    switch (type) {
      case ServiceType.SERVER:
        this.platform = new ServerPlatform(platforms.server!);
        break;
      case ServiceType.CLI:
        this.platform = new CLIPlatform(platforms.cli!);
        break;
      case ServiceType.DESKTOP:
        this.platform = new DesktopPlatform(platforms.desktop!);
        break;
    }
  }

  async start(input?: { port?: number }): Promise<void> {
    if (this.platform) {
      await this.platform.start(input);
    }
  }
}
````

---

## Flow Diagrams

### Current Flow (v0.0.27)

```
Service constructor
  ├─ validateConfig()
  ├─ new Server(config)
  │  └─ Server.constructor()
  │     └─ initialize adapters
  └─ return

User calls service.start()
  └─ Server.start()
     ├─ Server.configure()
     │  ├─ configureDatabases()
     │  ├─ registerAllRestHandlers(entryPoints) ← REGISTRATION LOGIC IN SERVER
     │  ├─ configureServer()
     │  ├─ configurePageModule()
     │  └─ startServer()
     └─ Adapter.listen()
```

### New Flow (v0.1.0)

```
Service constructor
  ├─ validateConfig()
  └─ new ServerPlatform(config)
     ├─ Platform.constructor()
     ├─ new Server(httpConfig)
     └─ registerHandlers() ← USES REGISTRATION FUNCTIONS

User calls service.start()
  └─ ServerPlatform.start()
     ├─ initialize()
     │  ├─ setupDatabases()
     │  ├─ setupPageModule()
     │  └─ setupServer()
     └─ Server.listen()

registerRestRoutes(handlers) ← PURE FUNCTION
  └─ handlers.forEach(h => server.registerRoute(h))

registerRestHooks(hooks) ← PURE FUNCTION
  └─ hooks.forEach(h => server.registerHook(h))
```

### Dependency Flow

```
Layers registers:
  ├─ Infrastructure (Repositories) ← No deps
  ├─ Domain (Services) ← Depends on Repositories
  └─ Application (Handlers) ← Depends on Services

Platform receives handlers as array:
  ServerPlatform constructor(config)
    ├─ config.handlers = {
    │   routes: [RouteHandler], ← From Application layer
    │   hooks: [HookHandler]
    │ }
    └─ registerAllRestHandlers(routes, hooks, server)
       ├─ registerRestRoutes(routes, server) ← Pure function
       └─ registerRestHooks(hooks, server) ← Pure function
```

---

## Security Considerations

### Authentication & Authorization

- Platform initialization happens before route registration
- All routes/hooks registered before server starts listening
- No routes accessible during setup phase
- DI container locked after all registrations

### Error Handling

- Errors during registration prevent server from starting (fail-safe)
- Custom errors thrown in registration functions propagate up
- Server startup fails cleanly with helpful error messages
- No partial registration possible

### Database Connections

- Databases connected during `Platform.initialize()`
- ORM instances registered in DI container
- Routes only register after DB connections established
- Connection errors prevent server startup

### Secrets & Configuration

- No secrets passed through registration functions
- Config loaded before Platform instantiation
- Environment variables validated early
- No logging of sensitive handler metadata

---

## File Structure Changes

### New Files

```
src/service/
├─ platforms/
│  ├─ index.ts (updated exports)
│  ├─ platforms.ts (base Platform class)
│  ├─ server/
│  │  ├─ server-platform.ts (NEW)
│  │  ├─ server-registration.ts (NEW)
│  │  └─ server/ (existing)
│  ├─ cli/
│  │  ├─ cli-platform.ts (NEW)
│  │  ├─ cli-registration.ts (NEW)
│  │  └─ (existing)
│  ├─ desktop/
│  │  ├─ desktop-platform.ts (NEW)
│  │  ├─ desktop-registration.ts (NEW)
│  │  └─ (existing)
└─ service.ts (refactored)
```

### Modified Files

- `src/service/service.ts` - Simplified to orchestrator
- `src/service/platforms/server/server/server.ts` - Removed registration methods
- `src/service/platforms/cli/cli.ts` - Refactored with registration functions
- `src/service/platforms/desktop/desktop.ts` - Refactored with registration functions

---

## Migration Path for Users (v0.0.27 → v0.1.0)

### Before (v0.0.27)

```typescript
const service = new Service({
  type: ServiceType.SERVER,
  platforms: {
    server: {
      name: "my-service",
      server: { vendor: ServerVendor.FASTIFY, instance: fastify() },
      databases: [...],
      entryPoints: {
        routes: [UserRoute, ProductRoute],
        hooks: [AuthHook]
      }
    }
  }
});

await service.start({ port: 3000 });
```

### After (v0.1.0)

```typescript
// Entry points now passed to ServerPlatform, not through Service
const serverPlatform = new ServerPlatform({
  name: "my-service",
  server: { vendor: ServerVendor.FASTIFY, instance: fastify() },
  databases: [...],
  handlers: {
    routes: [UserRoute, ProductRoute],
    hooks: [AuthHook]
  }
});

await serverPlatform.start({ port: 3000 });

// OR via Service (for backward compat)
const service = new Service({
  type: ServiceType.SERVER,
  platforms: { server: {...} }
});

await service.start({ port: 3000 });
```

---

## Status

**Current:** Proposed  
**Next Step:** Accept ADR → Implement Phase 1-2 (Design & Platform Classes)  
**Success Criteria:**

- [ ] All 4 Platform classes implemented
- [ ] All registration functions defined
- [ ] 183 tests updated (≥79% coverage)
- [ ] 3 examples refactored
- [ ] v0.1.0 published to npm
- [ ] Migration guide available

---

## Questions for Review

1. Does the Platform abstraction + registration function approach align with your intent?
2. Should `Server` be a separate class from `ServerPlatform`, or fold them together?
3. For CLI/Desktop platforms, should handlers be passed the same way (as arrays)?
4. Should we keep `Service` class for backward compat, or make `Platform` the primary API?
5. Are registration functions the right level of abstraction, or should we use higher-level composition?

---

## Related Documentation

- [Dependency Injection Guide](../guides/dependency-injection.md)
- [Service Adapter Pattern](../guides/service-adapter-pattern.md)
- [Architecture Index](../index.md)
- [Changelog](../../changelog.md)
