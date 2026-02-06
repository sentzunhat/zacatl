# Architecture Decision Record: Platform Refactoring

**Version:** 2.0  
**Date:** 2026-02-05  
**Status:** Implemented

---

## Title

Simple Platform Wrapper for v0.1.0

---

## Context

The Zacatl Service class directly instantiated Server, CLI, and Desktop instances, creating tight coupling between Service orchestration and platform-specific logic.

**Business driver**: v0.1.0 establishes a cleaner separation between Service (orchestrator) and Platform (wrapper for server/cli/desktop instances).

---

## Decision

**Create a single `Platform` class that wraps server, cli, or desktop instances.**

### Implementation

```typescript
// Single Platform class
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
    // ... i18n setup, validation, layers ...

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
- Each platform type remains independent

✅ **Extensibility**

- Easy to add new platform types
- Service accesses platform instances directly via `platform.server`, `platform.cli`, `platform.desktop`

✅ **Type Safety**

- TypeScript knows which property exists based on ServiceType
- Strong typing for all platform instances

---

## Implementation Status

### Phase 1: Platform Class (Completed)

- [x] Create single `Platform` class
- [x] Remove factory pattern
- [x] Remove separate platform classes
- [x] Update exports

### Phase 2: Service Refactor (Completed)

- [x] Update Service to create Platform instance
- [x] Service accesses platform.server/cli/desktop directly

### Phase 3: Testing (Next)

- [ ] Update 183 tests
- [ ] Maintain 79%+ coverage

### Phase 4: Release (Next)

- [ ] Update changelog
- [ ] Bump version to 0.1.0

---

## Migration Path

No breaking changes - Platform class is internal to Service.

---

## Related Documentation

- [Dependency Injection Guide](../guides/dependency-injection.md)
- [Architecture Index](../index.md)
- [Changelog](../../changelog.md)
