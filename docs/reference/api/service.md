# Service API

Main service class for building microservices.

## Import

```typescript
import { Service } from "@sentzunhat/zacatl";
```

## Create Service

```typescript
import Fastify from "fastify";
import {
  Service,
  ServiceType,
  ServerType,
  ServerVendor,
} from "@sentzunhat/zacatl";

const fastify = Fastify();

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    application: {
      entryPoints: {
        rest: {
          hooks: [cors, helmet],
          routes: [UserRoutes, ProductRoutes],
        },
      },
    },
    domain: {
      providers: [UserService, ProductService],
    },
    infrastructure: {
      repositories: [UserRepository, ProductRepository],
    },
  },
  platforms: {
    server: {
      name: "my-service",
      port: 3000,
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
      },
      databases: [],
    },
  },
});
```

## Start Service

```typescript
await service.start();
// Server running on http://localhost:3000
```

The port is specified in the `platforms.server.port` configuration.

## Configuration Interface

```typescript
interface ConfigService {
  type?: "SERVER" | "CLI" | "DESKTOP";

  layers?: {
    application?: {
      entryPoints: {
        rest?: {
          hooks?: Array<Constructor<HookHandler>>;
          routes: Array<Constructor<RouteHandler>>;
        };
        cli?: {
          commands: Array<Constructor<Command>>;
        };
        ipc?: {
          handlers: Array<Constructor<IPCHandler>>;
        };
      };
    };
    domain?: {
      providers: Array<Constructor<ProviderPort>>;
    };
    infrastructure?: {
      repositories: Array<Constructor<Repository>>;
    };
  };

  platforms?: {
    server?: ConfigServer; // See Server Platform API reference
    cli?: {
      name: string;
      version: string;
      description?: string;
    };
    desktop?: {
      name: string;
      version: string;
      description?: string;
    };
  };

  localization?: {
    locales: {
      default: string;
      supported: string[];
    };
    directory: string;
  };
}
```

## Server Platform Configuration

The `platforms.server` property uses the `ConfigServer` type, which includes:

```typescript
type ConfigServer = {
  name: string;
  server: HttpServerConfig;
  databases: Array<DatabaseConfig>;
  page?: ServerPageConfig;
  port: number;
  entryPoints?: RestApplicationEntryPoints;
};
```

For detailed documentation on server configuration types, adapters, and examples, see:

- **[Server Platform API →](./server.md)** - Complete server platform reference

---

## Related

- [Server Platform API](./server.md) - HTTP servers, page servers, and databases
- [Configuration](./configuration.md) - Full configuration reference
- [Errors](./errors.md) - Error handling

---

**Next**: [Server Platform API →](./server.md)
