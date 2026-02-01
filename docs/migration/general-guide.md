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

The server is configured as part of the `Service` configuration.

**Old (Fastify):**

```typescript
const fastify = require("fastify")({ logger: true });
fastify.listen({ port: 3000 });
```

**New (Zacatl):**
Define your configuration in `src/index.ts`:

```typescript
import Fastify from "fastify";
import { Service } from "@sentzunhat/zacatl";

const fastify = Fastify();

const service = new Service({
  architecture: {
    application: {
      entryPoints: { rest: { hookHandlers: [], routeHandlers: [] } },
    },
    domain: { providers: [] },
    infrastructure: { repositories: [] },
    server: {
      name: "my-service",
      server: { type: "SERVER", vendor: "FASTIFY", instance: fastify },
      databases: [],
    },
  },
});

await service.start({ port: 3000 });
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
    reply: FastifyReply,
  ): Promise<{ hello: string }> {
    return { hello: "world" };
  }
}
```

Then register this handler in your `Service` configuration under `architecture.application.entryPoints.rest.routeHandlers`.

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

Zacatl supports serving a frontend application (SPA) alongside the API via `PageModule`.

### 3.1. Page Module Configuration

The `PageModule` handles static file serving and SPA fallback in `architecture.platform.page`.

**Configuration:**
In your `ConfigServer`, set the page properties:

```typescript
architecture: {
  platform: {
    page: {
      staticDir: "dist",     // Path to your React build output
      apiPrefix: "/api"      // API requests won't be rewritten to index.html
    }
  }
}
```

### 3.2. Development Proxy

For development, you can proxy requests to your Vite/Webpack dev server:

```typescript
architecture: {
  platform: {
    page: {
      devServerUrl: "http://localhost:5173"; // Vite default
    }
  }
}
```

## 4. Database Migration

Zacatl provides a repository pattern abstraction for Mongoose and Sequelize.

**Old:** Direct Mongoose/Sequelize calls in routes.
**New:** Create Repository classes extending `BaseRepository<D, I, O>`:

```typescript
import { BaseRepository } from "@sentzunhat/zacatl";

export class UserRepository extends BaseRepository<User, string, UserOutput> {
  constructor() {
    super({ type: "mongoose", schema: UserSchema, name: "User" });
  }
}
```

Where:

- `D` is the data type (Mongoose doc or Sequelize model)
- `I` is the ID type (string, ObjectId, etc.)
- `O` is the output type (what your API returns)

## 5. Summary of Steps

To migrate from the old micro-service architecture to the new `Service` API:

1.  **Update imports**: Change all `@zacatl/*` imports to `@sentzunhat/zacatl`
2.  **Update configuration**: Use `loadConfig()` or `loadConfigFromPaths()` to load a `ConfigService` object (must have `architecture` property)
3.  **Update route handlers**: Extend `AbstractRouteHandler`, `PostRouteHandler`, or `GetRouteHandler` with `{url, schema}` in the constructor
4.  **Register handlers**: Add handlers to `architecture.application.entryPoints.rest.routeHandlers` in the config
5.  **Update ORM adapters**: Ensure repositories extend `BaseRepository<D, I, O>` with typed generics
6.  **Initialize the Service**: Create a `Service` instance with the config object and call `await service.start()`
7.  **Test**: Run `npm test` to verify the setup
