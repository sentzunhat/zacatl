# Step-by-Step Migration Guide

Follow these steps to migrate from old `MicroService` to new `Service` pattern.

## Prerequisites

- ✅ Zacatl v0.0.27 or higher installed
- ✅ TypeScript project with tsconfig.json
- ✅ Existing service using old `MicroService` API

## Step 1: Update Dependencies (2 min)

### package.json

```bash
npm install @sentzunhat/zacatl@latest
# or
bun add @sentzunhat/zacatl@latest
```

Verify version:

```bash
npm list @sentzunhat/zacatl
# Should show >= 0.0.27
```

## Step 2: Add reflect-metadata (1 min)

### Install

```bash
npm install reflect-metadata
# or
bun add reflect-metadata
```

### Import at Top of Entry File

`src/index.ts` or `src/server.ts`:

```typescript
import "reflect-metadata"; // ✅ Add this as FIRST import
import "./init-di"; // If you have this file
// ... rest of imports
```

## Step 3: Update Imports (2 min)

### Find & Replace

**Replace class import:**

```typescript
// Find
import { MicroService } from "@sentzunhat/zacatl";

// Replace with
import { Service } from "@sentzunhat/zacatl/service";
```

**Add type imports:**

```typescript
import {
  ServiceType,
  ServerType,
  ServerVendor,
  DatabaseVendor,
} from "@sentzunhat/zacatl";
```

## Step 4: Remove Manual DI (3 min)

### Delete Container Registration

**Remove this pattern:**

```typescript
// ❌ Delete these lines
import { container } from "tsyringe";

for (const client of clients) {
  const instance = new client();
  container.register(client, { useValue: instance });
}
```

**Why?** The new `Service` class handles DI registration automatically via the config.

## Step 5: Update Configuration (10 min)

This is the main change. Follow this transformation:

### 5.1 Rename Class

```typescript
// Old
const microService = new MicroService({ ... });

// New
const service = new Service({ ... });
```

### 5.2 Add Type Field

```typescript
const service = new Service({
  type: ServiceType.SERVER, // ✅ Add this
  // ... rest
});
```

### 5.3 Move Server Config

```typescript
// Old structure
{
  architecture: {
    application: { ... },
    domain: { ... },
    infrastructure: { ... },
    server: {              // ❌ At same level as other layers
      name: "my-service",
      server: { ... },
      databases: [ ... ]
    }
  }
}

// New structure
{
  type: ServiceType.SERVER,
  platforms: {             // ✅ New section
    server: {
      name: "my-service",
      server: { ... },
      databases: [ ... ]
    }
  },
  layers: {                // ✅ Renamed from 'architecture'
    application: { ... },
    domain: { ... },
    infrastructure: { ... }
  }
}
```

### 5.4 Rename Properties

**Application layer:**

```typescript
// Old
application: {
  entryPoints: {
    rest: {
      routeHandlers: [Handler1],  // ❌
      hookHandlers: [Hook1]       // ❌
    }
  }
}

// New
application: {
  entryPoints: {
    rest: {
      routes: [Handler1],   // ✅
      hooks: [Hook1]        // ✅
    }
  }
}
```

**Domain layer:**

```typescript
// Old
domain: {
  providers: [Service1]; // ❌
}

// New
domain: {
  services: [Service1]; // ✅
}
```

### 5.5 Use Enums

```typescript
// Old - String literals
server: {
  type: "SERVER",
  vendor: "FASTIFY",
  instance: fastify
}

databases: [{
  vendor: "MONGOOSE",
  instance: mongoose
}]

// New - Type-safe enums
server: {
  type: ServerType.SERVER,        // ✅
  vendor: ServerVendor.FASTIFY,   // ✅
  instance: fastify
}

databases: [{
  vendor: DatabaseVendor.MONGOOSE,  // ✅
  instance: mongoose
}]
```

## Step 6: Create Config Function (5 min)

**Best practice:** Extract config to a function.

### Create config.ts

```typescript
import type { FastifyInstance } from "fastify";
import type { Mongoose } from "mongoose";
import {
  ServiceType,
  ServerType,
  ServerVendor,
  DatabaseVendor,
} from "@sentzunhat/zacatl";

export function createServiceConfig(
  fastify: FastifyInstance,
  mongoose: Mongoose,
) {
  return {
    type: ServiceType.SERVER,
    platforms: {
      server: {
        name: "my-service",
        server: {
          type: ServerType.SERVER,
          vendor: ServerVendor.FASTIFY,
          instance: fastify,
        },
        databases: [
          {
            vendor: DatabaseVendor.MONGOOSE,
            instance: mongoose,
            connectionString:
              process.env.MONGO_URI || "mongodb://localhost:27017",
          },
        ],
      },
    },
    layers: {
      infrastructure: {
        repositories: [UserRepository],
      },
      domain: {
        services: [UserService],
      },
      application: {
        entryPoints: {
          rest: {
            routes: [GetUsersHandler, CreateUserHandler],
            hooks: [AuthHook],
          },
        },
      },
    },
  };
}
```

### Update index.ts

```typescript
import "reflect-metadata";
import Fastify from "fastify";
import mongoose from "mongoose";
import { Service } from "@sentzunhat/zacatl/service";
import { createServiceConfig } from "./config";

const fastify = Fastify({ logger: false });
const serviceConfig = createServiceConfig(fastify, mongoose);
const service = new Service(serviceConfig);

await service.start({ port: 3000 });
```

## Step 7: Update Route Handlers (5 min)

### If Using Old Handler Pattern

```typescript
// Old
import { GetRouteHandler } from "@sentzunhat/zacatl";

export class GetUsersHandler extends GetRouteHandler<...> { ... }

// New
import { AbstractRouteHandler } from "@sentzunhat/zacatl/service";

export class GetUsersHandler extends AbstractRouteHandler<...> { ... }
```

### Constructor Pattern

```typescript
@singleton()
export class GetUsersHandler extends AbstractRouteHandler<void, void, User[]> {
  constructor(
    @inject(UserService)
    private readonly userService: UserService,
  ) {
    super({
      url: "/users",
      method: "GET",
      schema: {}, // Optional Fastify schema
    });
  }

  async handler(request, reply) {
    return this.userService.getAllUsers();
  }
}
```

## Step 8: Test & Verify (5 min)

### 8.1 Type Check

```bash
npm run type:check
# or
tsc --noEmit
```

Fix any TypeScript errors.

### 8.2 Build

```bash
npm run build
```

### 8.3 Run

```bash
npm start
# or
bun src/index.ts
```

Verify:

- ✅ Server starts without errors
- ✅ Routes respond correctly
- ✅ Database connects
- ✅ DI works (services inject properly)

### 8.4 Test Endpoints

```bash
curl http://localhost:3000/users
# Should return data
```

## Step 9: Clean Up (2 min)

### Remove Old Code

Delete any:

- ❌ Manual `container.register()` calls
- ❌ Old DI initialization files (if no longer needed)
- ❌ Unused imports

### Update Comments

Change references from:

- ❌ "MicroService" → ✅ "Service"
- ❌ "providers" → ✅ "services"

## Troubleshooting

### Error: "Cannot find module '@sentzunhat/zacatl/service'"

**Solution:** Update to latest version

```bash
npm install @sentzunhat/zacatl@latest
```

### Error: "ServiceType is not defined"

**Solution:** Add imports

```typescript
import { ServiceType } from "@sentzunhat/zacatl";
```

### Error: "Reflect.metadata is not a function"

**Solution:** Import reflect-metadata first

```typescript
import "reflect-metadata"; // Must be FIRST import
```

### DI Not Working

**Solution:** Check:

1. Classes have `@singleton()` decorator
2. Constructor params have `@inject(ClassName)`
3. Classes are listed in config layers
4. reflect-metadata is imported

## Migration Checklist

- [ ] Update package version (`@sentzunhat/zacatl@latest`)
- [ ] Add `reflect-metadata` dependency
- [ ] Import `reflect-metadata` at top of entry file
- [ ] Change `MicroService` → `Service` import
- [ ] Add type imports (`ServiceType`, `ServerType`, etc.)
- [ ] Remove manual DI container code
- [ ] Add `type: ServiceType.SERVER` to config
- [ ] Rename `architecture` → `layers`
- [ ] Move `server` → `platforms.server`
- [ ] Rename `routeHandlers` → `routes`
- [ ] Rename `hookHandlers` → `hooks`
- [ ] Rename `providers` → `services`
- [ ] Change string literals to enums
- [ ] Create config function (recommended)
- [ ] Update handler imports if needed
- [ ] Run type check
- [ ] Build successfully
- [ ] Test all endpoints
- [ ] Clean up old code

## Time Estimate

- **Simple service (1-2 layers):** 15-20 minutes
- **Medium service (3+ layers):** 30-45 minutes
- **Complex service (multiple areas):** 1-2 hours

## Next Steps

- 📖 [Best Practices](./best-practices.md) - Recommended patterns
- 🏆 [Example Migration](./EXAMPLE-MICTLAN.md) - Real-world example
- ⚡ [Quick Reference](./old-to-new-api.md) - API mapping
