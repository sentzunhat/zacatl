# Migration Quick Start

⚡ **5-minute guide** to migrate from old `MicroService` to new `Service` pattern.

## What Changed?

| Old (v0.0.19 and earlier)       | New (v0.0.27+)     |
| ------------------------------- | ------------------ |
| `MicroService` class            | `Service` class    |
| `architecture.server`           | `platforms.server` |
| Manual DI registration          | Auto DI via config |
| `hookHandlers`, `routeHandlers` | `hooks`, `routes`  |

## Before & After

### Entry Point (index.ts)

**❌ Old Pattern:**

```typescript
import { MicroService, DatabaseVendor, ServerVendor } from "@sentzunhat/zacatl";
import { container } from "tsyringe";

// Manual DI
for (const client of clients) {
  container.register(client, { useValue: new client() });
}

const microService = new MicroService({
  architecture: {
    application: {
      entryPoints: {
        rest: {
          routeHandlers: [UserHandler],
          hookHandlers: [AuthHook],
        },
      },
    },
    domain: { providers: [UserService] },
    infrastructure: { repositories: [UserRepo] },
    server: {
      name: "my-service",
      server: { type: "SERVER", vendor: "FASTIFY", instance: fastify },
      databases: [{ vendor: "MONGOOSE", instance: mongoose }],
    },
  },
});
```

**✅ New Pattern:**

```typescript
import { Service } from "@sentzunhat/zacatl/service";
import {
  ServiceType,
  ServerType,
  ServerVendor,
  DatabaseVendor,
} from "@sentzunhat/zacatl";

// No manual DI needed!
const service = new Service({
  type: ServiceType.SERVER,
  platforms: {
    server: {
      name: "my-service",
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
      },
      databases: [{ vendor: DatabaseVendor.MONGOOSE, instance: mongoose }],
    },
  },
  layers: {
    infrastructure: { repositories: [UserRepo] },
    domain: { services: [UserService] },
    application: {
      entryPoints: {
        rest: {
          routes: [UserHandler],
          hooks: [AuthHook],
        },
      },
    },
  },
});
```

## Migration Checklist

- [ ] **1. Update imports**: `MicroService` → `Service`
- [ ] **2. Add reflect-metadata**: `import "reflect-metadata"` at top
- [ ] **3. Rename properties**:
  - `architecture.server` → `platforms.server`
  - `routeHandlers` → `routes`
  - `hookHandlers` → `hooks`
  - `providers` → `services`
- [ ] **4. Add type field**: `type: ServiceType.SERVER`
- [ ] **5. Remove manual DI**: Delete `container.register()` loops
- [ ] **6. Update config pattern**: See [detailed guide](./old-to-new-api.md)

## Next Steps

- 📖 [Detailed API Changes](./old-to-new-api.md)
- 🎯 [Step-by-Step Migration](./step-by-step.md)
- ⚡ [Best Practices](./best-practices.md)
- 🏆 [Example: Mictlan Migration](./EXAMPLE-MICTLAN.md)
