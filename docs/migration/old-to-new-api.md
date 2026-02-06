# Old API → New API Reference

Complete mapping of API changes from v0.0.19 to v0.0.27+.

## Import Changes

### Core Service

```typescript
// Old
import { MicroService } from "@sentzunhat/zacatl";

// New
import { Service } from "@sentzunhat/zacatl/service";
```

### Types & Enums

```typescript
// Old
import { DatabaseVendor, ServerVendor, ServiceType } from "@sentzunhat/zacatl";

// New - More specific imports
import {
  ServiceType,
  ServerType,
  ServerVendor,
  DatabaseVendor,
} from "@sentzunhat/zacatl";
```

### Route/Hook Handlers

```typescript
// Old
import { RouteHandler, HookHandler } from "@sentzunhat/zacatl";

// New - From service subpath
import { AbstractRouteHandler } from "@sentzunhat/zacatl/service";
```

## Configuration Structure

### Top-Level Changes

```typescript
// Old
{
  architecture: {
    application: { ... },
    domain: { ... },
    infrastructure: { ... },
    server: { ... }  // ❌ Moved
  }
}

// New
{
  type: ServiceType.SERVER,  // ✅ New
  platforms: {               // ✅ New
    server: { ... }
  },
  layers: {                  // ✅ Renamed from architecture
    application: { ... },
    domain: { ... },
    infrastructure: { ... }
  }
}
```

### Application Layer

```typescript
// Old
application: {
  entryPoints: {
    rest: {
      routeHandlers: [Handler1, Handler2],  // ❌
      hookHandlers: [Hook1, Hook2]          // ❌
    }
  }
}

// New
application: {
  entryPoints: {
    rest: {
      routes: [Handler1, Handler2],   // ✅
      hooks: [Hook1, Hook2]           // ✅
    }
  }
}
```

### Domain Layer

```typescript
// Old
domain: {
  providers: [Service1, Service2]; // ❌
}

// New
domain: {
  services: [Service1, Service2]; // ✅
}
```

### Server Configuration

```typescript
// Old
architecture: {
  server: {
    name: "my-service",
    server: { type: "SERVER", vendor: "FASTIFY", instance: fastify },
    databases: [...]
  }
}

// New
platforms: {
  server: {
    name: "my-service",
    server: {
      type: ServerType.SERVER,        // ✅ Enum
      vendor: ServerVendor.FASTIFY,   // ✅ Enum
      instance: fastify
    },
    databases: [...]
  }
}
```

### Database Configuration

```typescript
// Old
databases: [
  {
    vendor: "MONGOOSE", // ❌ String
    instance: mongoose,
    connectionString: "...",
  },
];

// New
databases: [
  {
    vendor: DatabaseVendor.MONGOOSE, // ✅ Enum
    instance: mongoose,
    connectionString: "...",
  },
];
```

## Property Renames

| Old Name              | New Name                  | Location                     |
| --------------------- | ------------------------- | ---------------------------- |
| `MicroService`        | `Service`                 | Class name                   |
| `architecture`        | `layers`                  | Config root                  |
| `architecture.server` | `platforms.server`        | Config root                  |
| `routeHandlers`       | `routes`                  | Application.entryPoints.rest |
| `hookHandlers`        | `hooks`                   | Application.entryPoints.rest |
| `providers`           | `services`                | Domain layer                 |
| `"FASTIFY"` (string)  | `ServerVendor.FASTIFY`    | Enum                         |
| `"MONGOOSE"` (string) | `DatabaseVendor.MONGOOSE` | Enum                         |
| `"SERVER"` (string)   | `ServerType.SERVER`       | Enum                         |

## New Features

### 1. Service Type (Required)

```typescript
const service = new Service({
  type: ServiceType.SERVER, // Explicit service type
  // ... rest
});
```

Options:

- `ServiceType.SERVER` - HTTP/REST APIs
- `ServiceType.CLI` - Command-line tools
- `ServiceType.DESKTOP` - Desktop apps

### 2. Automatic DI Registration

```typescript
// Old - Manual registration required
import { container } from "tsyringe";
for (const dep of dependencies) {
  container.register(dep, { useValue: new dep() });
}

// New - Automatic via config
// Just list classes in layers, Zacatl handles registration
```

### 3. Better Type Safety

```typescript
// Old
vendor: "MONGOOSE"; // String literal

// New
vendor: DatabaseVendor.MONGOOSE; // Type-safe enum
```

## Complete Transformation

### Old Full Example

```typescript
import { MicroService } from "@sentzunhat/zacatl";
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
          routeHandlers: [GetUsersHandler, CreateUserHandler],
          hookHandlers: [AuthHook, LoggingHook],
        },
      },
    },
    domain: {
      providers: [UserService, EmailService],
    },
    infrastructure: {
      repositories: [UserRepository, EmailRepository],
    },
    server: {
      name: "user-service",
      server: {
        type: "SERVER",
        vendor: "FASTIFY",
        instance: fastifyInstance,
      },
      databases: [
        {
          vendor: "MONGOOSE",
          instance: mongooseInstance,
          connectionString: process.env.MONGO_URI,
        },
      ],
    },
  },
});

await microService.start({ port: 3000 });
```

### New Full Example

```typescript
import "reflect-metadata";
import { Service } from "@sentzunhat/zacatl/service";
import {
  ServiceType,
  ServerType,
  ServerVendor,
  DatabaseVendor,
} from "@sentzunhat/zacatl";

const service = new Service({
  type: ServiceType.SERVER,
  platforms: {
    server: {
      name: "user-service",
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastifyInstance,
      },
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: mongooseInstance,
          connectionString: process.env.MONGO_URI,
        },
      ],
    },
  },
  layers: {
    infrastructure: {
      repositories: [UserRepository, EmailRepository],
    },
    domain: {
      services: [UserService, EmailService],
    },
    application: {
      entryPoints: {
        rest: {
          routes: [GetUsersHandler, CreateUserHandler],
          hooks: [AuthHook, LoggingHook],
        },
      },
    },
  },
});

await service.start({ port: 3000 });
```

## See Also

- [Quick Start](./quickstart.md) - 5-minute overview
- [Step-by-Step Migration](./step-by-step.md) - Detailed process
- [Best Practices](./best-practices.md) - New patterns
