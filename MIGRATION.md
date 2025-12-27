# Migration Guide: Fastify + React to Zacatl

This guide outlines the steps to migrate an existing application built with Fastify (backend) and React (frontend) to the Zacatl architecture.

## 1. Architecture Overview

Zacatl enforces a clean architecture with strict separation of concerns:

- **Platform**: Bootstrapping, Server (Fastify/Express), Database connections.
- **Infrastructure**: Repositories, External Services.
- **Domain**: Business Logic, Services.
- **Application**: Route Handlers, Hook Handlers, Entry Points.

## 2. Backend Migration (Fastify)

### 2.1. Server Configuration

In Zacatl, the server is configured in `src/micro-service/architecture/platform/server/server.ts` (orchestrated by `MicroService`).
You don't create the Fastify instance manually. Instead, you provide a configuration object.

**Old (Fastify):**

```typescript
const fastify = require("fastify")({ logger: true });
fastify.listen({ port: 3000 });
```

**New (Zacatl):**
Define your configuration in `src/index.ts` or a config file:

```typescript
const config: ConfigMicroService = {
  architecture: {
    platform: {
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastifyInstance, // Optional: pass existing instance or let Zacatl create one
      },
      // ...
    },
  },
};
```

### 2.2. Routes

Move your route definitions to **Route Handlers**.

**Old (Fastify):**

```typescript
fastify.get("/items", async (request, reply) => {
  return { hello: "world" };
});
```

**New (Zacatl):**
Create a class extending `GetRouteHandler` (or `PostRouteHandler`, etc.) in `src/micro-service/architecture/application/entry-points/rest/route-handlers/`.

```typescript
import { GetRouteHandler } from "../get-route-handler";

export class GetItemsHandler extends GetRouteHandler<
  void,
  void,
  void,
  void,
  { hello: string }
> {
  constructor() {
    super({
      url: "/items",
      schema: {
        /* Fastify Schema */
      },
    });
  }

  public async execute(
    request: Request,
    reply: FastifyReply
  ): Promise<{ hello: string }> {
    return { hello: "world" };
  }
}
```

Then register this handler in `src/micro-service/architecture/application/application.ts`.

### 2.3. Plugins & Decorators

Move shared logic (database clients, utilities) to **Infrastructure** or **Domain**.

- **Database**: Use `Infrastructure` to register repositories.
- **Utilities**: Use `Domain` services or `Utils`.

**Old (Fastify):**

```typescript
fastify.decorate("db", dbClient);
```

**New (Zacatl):**
Inject dependencies via the constructor of your Route Handlers or Domain Services. Zacatl uses a DI container.

## 3. Frontend Migration (React)

Zacatl supports serving a frontend application (SPA) alongside the API.

### 3.1. Page Module

The `PageModule` in `src/micro-service/architecture/platform/page/page.ts` handles static file serving and SPA fallback.

**Configuration:**
In your `ConfigMicroService`:

```typescript
page: {
  root: __dirname, // or project root
  page: {
    staticDir: "dist", // Path to your React build output
    apiPrefix: "/api"  // API requests won't be rewritten to index.html
  }
}
```

### 3.2. Development

For development, you can proxy requests to your Vite/Webpack dev server:

```typescript
page: {
  page: {
    devServerUrl: "http://localhost:5173"; // Vite default
  }
}
```

## 4. Database Migration

Zacatl provides a repository pattern abstraction for Mongoose and Sequelize.

**Old:** Direct Mongoose/Sequelize calls in routes.
**New:** Create Repository classes in `src/micro-service/architecture/infrastructure/repositories/`.

```typescript
export class UserRepository extends BaseRepository<UserDoc, User> {
  constructor() {
    super({ type: "mongoose", schema: UserSchema, name: "User" });
  }
}
```

## 5. Summary of Steps

1.  **Scaffold** the Zacatl structure.
2.  **Move Models** to `infrastructure/repositories`.
3.  **Move Business Logic** to `domain/`.
4.  **Convert Routes** to `RouteHandler` classes in `application/`.
5.  **Configure PageModule** to point to your React `dist/` folder.
6.  **Update Imports** and Dependency Injection.
