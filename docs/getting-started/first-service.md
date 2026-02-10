# First Service

Build a simple REST API with Zacatl.

## Create Entry Point

`src/index.ts`:

```typescript
import Fastify from "fastify";
import {
  Service,
  ServiceType,
  ServerType,
  ServerVendor,
} from "@sentzunhat/zacatl";

const fastify = Fastify({ logger: true });

// Simple route
fastify.get("/health", async () => ({
  status: "ok",
  timestamp: new Date(),
}));

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    application: {
      entryPoints: {
        rest: {
          hooks: [],
          routes: [],
        },
      },
    },
    domain: { services: [] },
    infrastructure: { repositories: [] },
  },
  platforms: {
    server: {
      name: "my-first-service",
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
      },
    },
  },
});

await service.start({ port: 3000 });
console.log("Server running on http://localhost:3000");
```

## Run It

```bash
npx tsx src/index.ts
```

Test it:

```bash
curl http://localhost:3000/health
```

## Add Business Logic

`src/services/user-service.ts`:

```typescript
export class UserService {
  getUser(id: string) {
    return {
      id,
      name: "John Doe",
      email: "john@example.com",
    };
  }
}
```

## Add HTTP Handler

`src/handlers/user-handler.ts`:

```typescript
import { FastifyRequest, FastifyReply } from "fastify";
import { UserService } from "../services/user-service";

export class UserHandler {
  constructor(private userService: UserService) {}

  getUser = async (
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply,
  ) => {
    const user = this.userService.getUser(request.params.id);
    return reply.send(user);
  };
}
```

## Register Routes

`src/routes/user-routes.ts`:

```typescript
import { FastifyInstance } from "fastify";
import { UserHandler } from "../handlers/user-handler";
import { UserService } from "../services/user-service";

export const userRoutes = (fastify: FastifyInstance) => {
  const userService = new UserService();
  const userHandler = new UserHandler(userService);

  fastify.get("/users/:id", userHandler.getUser);
};
```

## Update Service

```typescript
import { userRoutes } from "./routes/user-routes";

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    application: {
      entryPoints: {
        rest: {
          hooks: [],
          routes: [],
        },
      },
    },
    domain: {
      services: [UserService],
    },
    infrastructure: {
      repositories: [],
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

Test it:

```bash
curl http://localhost:3000/users/123
```

---

**Next**: [Database Setup →](./database-setup.md)
