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
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
      },
    },
  },
});
```

## Start Service

```typescript
await service.start({ port: 3000 });
// Server running on http://localhost:3000
```

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
    server?: {
      name: string;
      server: {
        type: "SERVER" | "GATEWAY";
        vendor: "FASTIFY" | "EXPRESS";
        instance: FastifyInstance | Express;
      };
      databases?: Array<{
        vendor: "SEQUELIZE" | "MONGOOSE";
        instance: unknown;
        connectionString?: string;
      }>;
    };
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

---

**Next**: [Errors →](./errors.md)
