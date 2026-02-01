# Service API

Main service class for building microservices.

## Import

```typescript
import { Service } from "@sentzunhat/zacatl";
```

## Create Service

```typescript
import Fastify from "fastify";
import { Service } from "@sentzunhat/zacatl";

const fastify = Fastify();

const service = new Service({
  architecture: {
    application: {
      entryPoints: {
        rest: {
          hookHandlers: [cors, helmet],
          routeHandlers: [userRoutes, productRoutes],
        },
      },
    },
    domain: {
      providers: [UserService, ProductService],
    },
    infrastructure: {
      repositories: [UserRepository, ProductRepository],
    },
    server: {
      name: "my-service",
      server: {
        type: "SERVER",
        vendor: "FASTIFY",
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

## Stop Service

```typescript
await service.stop();
```

## Configuration Interface

```typescript
interface IServiceConfig {
  architecture: {
    application?: {
      entryPoints: {
        rest: {
          hookHandlers: Function[];
          routeHandlers: Function[];
        };
      };
    };
    domain: {
      providers: Function[];
    };
    infrastructure: {
      repositories: Function[];
    };
    server: {
      name: string;
      server: {
        type: "SERVER";
        vendor: "FASTIFY" | "EXPRESS";
        instance: FastifyInstance | Express;
      };
      databases?: Array<{
        vendor: "SEQUELIZE" | "MONGOOSE";
        instance: any;
        connectionString?: string;
      }>;
    };
  };
}
```

---

**Next**: [Errors →](./errors.md)
