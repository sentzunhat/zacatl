# Server Platform API

API reference for the current server platform, including HTTP servers, page servers, and the transitional database connection configuration.

## Overview

The server platform hosts REST APIs and static pages. Database connection
configuration and setup currently live under `platforms.server`, but the agreed
ownership is `Layers → Infrastructure` for connections, ORM adapters and
repositories. The physical move and any consumer migration belong to a separate
work item. Service-managed ORM instances and Mongoose index policy are already
scoped per Service; direct/manual adapter use keeps the global fallback.

For the relationship between `Service`, the sibling `Layers` and `Platforms`
modules, and their nested ports and adapters, see the
[Service architecture map](./architecture.md).

## Platform Status in Current `src`

- `ServiceType.SERVER` is implemented and runnable.
- `ServiceType.CLI` and `ServiceType.DESKTOP` are currently contract stubs and throw when started.

## Import

```typescript
import { DatabaseVendor } from '@sentzunhat/zacatl/service';
import type { ServerConfig } from '@sentzunhat/zacatl/service/platforms/server/server';
import { ServerVendor, ServerType } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';
```

---

## Third-Party Dependencies

Zacatl exposes selected framework and database integrations through explicit
subpaths. Database drivers remain optional peer dependencies; install the
packages your application uses. See [Unified Dependency Export Strategy](./dependency-exports.md)
for the current import paths and dependency guidance.

**Key Exports:**

- HTTP Frameworks: `@sentzunhat/zacatl/third-party/express`, `@sentzunhat/zacatl/third-party/fastify`
- Databases: `@sentzunhat/zacatl/third-party/databases/mongoose`, `@sentzunhat/zacatl/third-party/databases/sequelize`
- Utilities: `@sentzunhat/zacatl/third-party/zod`, `@sentzunhat/zacatl/third-party/uuid`, `@sentzunhat/zacatl/third-party/pino`, and more

---

## Configuration Types

Service coordinates startup and shutdown. Layers/Infrastructure owns
connections, ORM adapters, and repositories; Platforms/Server owns HTTP, API
routes, and pages. The current configuration still places database connection
entries under `platforms.server.databases`; Service prepares the infrastructure
connections before Server begins listening.

### Service startup and shutdown

`Service.start()` registers application routes and hooks, prepares configured
databases and page handlers, waits for `layers.start()` readiness, and then
starts the platform listener. The HTTP listener is not opened until repository
readiness succeeds.

If startup fails, Service attempts platform cleanup and rethrows the original
startup error. Database preparation tracks each adapter before connecting, so
cleanup can disconnect adapters that connected before a later connection or
`onDatabaseConnected` callback failed. Shutdown attempts database disconnect
even when HTTP close fails; when both fail, the HTTP close error is preserved
as the primary error. A failed adapter disconnect remains tracked so a later
`stop()` can retry it. Duplicate connections with the same vendor and
connection name are rejected before they can replace an adapter already owned
by the Service; names may be reused with different vendors. If shutdown is
requested while database setup is still connecting, cleanup waits for that
setup to settle before disconnecting and releasing adapter ownership.

Calling `start()` again after `stop()` is not a documented restart contract.
Do not rely on restarting the same Service instance; create a new instance or
process for a new lifecycle. The current Fastify plus in-memory SQLite restart
probe failed on a second start.

### `ServerConfig`

Main configuration object for the server platform.

```typescript
type ServerConfig = {
  name: string;
  server: HttpServerConfig;
  databases: Array<DatabaseConfig>;
  page?: ServerPageConfig;
  port: number;
  entryPoints?: RestApplicationEntryPoints;
};
```

**Properties:**

- `name` - Unique name for the server instance
- `server` - HTTP server configuration (Fastify or Express)
- `databases` - Transitional array of database connections (Mongoose, Sequelize or node:sqlite)
- `page` - Optional page server configuration for SPAs and static files
- `entryPoints` - REST application routes and hooks (usually defined in `layers.application` instead)
- `port` - Port number to listen on; defaults to `9669` and can be overridden by `Service.start({ port })`

---

### `HttpServerConfig`

HTTP server configuration for API and gateway servers.

```typescript
type HttpServerConfig = {
  type: ServerType; // "SERVER" | "GATEWAY"
  vendor: ServerVendor; // "FASTIFY" | "EXPRESS"
  instance: unknown; // FastifyInstance | Express
  host?: string; // Bind address; defaults to 0.0.0.0 for container reachability
  gateway?: GatewayService; // Required if type is GATEWAY
  prefixes?: ApiPrefixes; // Named route prefixes (e.g. { api: "/api", webhooks: "/webhooks" })
};
```

**Properties:**

- `type` - Server type: `SERVER` (standard REST API) or `GATEWAY` (reverse proxy)
- `vendor` - HTTP framework: `FASTIFY` or `EXPRESS`
- `instance` - The Fastify or Express instance (create before passing to config)
- `host` - Optional bind address; `Service.start({ host })` overrides it. Defaults to `0.0.0.0` for Docker port publishing.
- `prefixes` - Optional named route prefixes. When `prefixes.api` is set, Zacatl prepends it to each route handler URL; when omitted, handler URLs are registered unchanged. Page SPA fallback inherits these prefixes unless `page.prefixes` overrides them; with neither configured, its exclusion defaults to `/api`.
- `gateway` - Gateway configuration with proxy routes (required when `type` is `GATEWAY`)

---

### `PageServerConfig`

Configuration for serving frontend applications (React, Vue, Svelte, etc.) and static files.

```typescript
type PageServerConfig = {
  devServerUrl?: string;
  staticDir?: string;
  customRegister?: (context: PageRegistrationContext) => Promise<void> | void;
  prefixes?: ApiPrefixes;
};
```

`PageRegistrationContext` provides `adapter`, `rawServer`, `isApiRequest(url)`,
and `resolve(token)`. Import it from
`@sentzunhat/zacatl/service/platforms/server/types/server-config` when
annotating the callback type. Migrate positional callbacks from
`(adapter, rawServer, container)` to `({ adapter, rawServer, resolve,
isApiRequest })`; use `resolve(Token)` for Service-owned dependencies.

**Properties:**

- `devServerUrl` - Development server URL for proxying (e.g., Vite dev server at `http://localhost:5173`)
- `staticDir` - Directory containing built static files (e.g., `./dist/client`)
- `customRegister` - Callback for app-specific plugins and handlers. `resolve(token)` uses this Service's Application scope; direct unmanaged Server construction retains its global resolution path. `isApiRequest(url)` recognizes the configured API route prefix, including its subpaths. When no API prefix is configured it returns false. The helper identifies API requests; the custom handler must leave them to the API's JSON 404 behavior. Zacatl does not convert a custom HTML 404 response to JSON automatically.
- `prefixes` - Path groups excluded from SPA fallback. Defaults to `server.prefixes`, then `{ api: "/api" }`.

---

### `DatabaseConfig`

Database connection configuration supporting Mongoose (MongoDB), Sequelize (SQL), and the Node 26 built-in SQLite runtime.

```typescript
interface DatabaseConnection {
  url: string; // connection URI, file path, or ':memory:'; replaces older connectionString config
  name?: string; // stable DI token name for multi-database setups
}

type DatabaseConfig = {
  vendor: DatabaseVendor; // "MONGOOSE" | "SEQUELIZE" | "SQLITE"
  connection: DatabaseConnection;
  instance?: DatabaseInstance; // Mongoose | Sequelize — not required for SQLITE
  onDatabaseConnected?: (dbInstance: DatabaseInstance) => Promise<void> | void;
};
```

**Properties:**

- `vendor` - Database vendor: `MONGOOSE`, `SEQUELIZE`, or `SQLITE`
- `connection.url` - For SQLite: a file path (e.g. `'app.db'`) or `':memory:'`. For others: the full connection URI.
- `connection.name` - Optional. Stable token name for multi-database setups: repositories reference it via `connection: { name: '...' }` in their config. Omit for a single database per vendor; Zacatl falls back to the vendor default token.
- A vendor/name pair identifies one Service-owned database connection. Do not
  configure the same vendor and name more than once; a name can be reused for
  a different vendor.
- `instance` - The Mongoose or Sequelize instance. **Not required for `SQLITE`** — the adapter opens the file internally.
- `onDatabaseConnected` - Optional callback invoked after a successful
  connection (use for model initialization, syncing, etc.). If it throws,
  startup fails and Service cleanup attempts to close the connected adapter.

---

## Enums

### `ServerVendor`

HTTP server framework vendor.

```typescript
enum ServerVendor {
  FASTIFY = 'FASTIFY',
  EXPRESS = 'EXPRESS',
}
```

---

### `ServerType`

Type of API server.

```typescript
enum ServerType {
  SERVER = 'SERVER', // Standard REST API server
  GATEWAY = 'GATEWAY', // API Gateway with reverse proxy
}
```

---

### `DatabaseVendor`

Database vendor/ORM.

```typescript
enum DatabaseVendor {
  MONGOOSE = 'MONGOOSE', // MongoDB via Mongoose
  SEQUELIZE = 'SEQUELIZE', // SQL databases via Sequelize
  SQLITE = 'SQLITE', // SQLite via node:sqlite on Zacatl's Node 26 runtime (no external package)
}
```

**SQLite example** (no `instance` needed):

```typescript
import { DatabaseVendor } from '@sentzunhat/zacatl/service';

databases: [
  {
    vendor: DatabaseVendor.SQLITE,
    connection: { url: 'app.db' }, // or ':memory:'
  },
];
```

Access the underlying `DatabaseSync` instance via `DatabaseServer.getAdapter(DatabaseVendor.SQLITE)` for raw prepared statements.

---

## Ports and Adapters (Same Layer)

Ports and adapters are documented together to reflect the hexagonal architecture. Ports and their adapters live in the same feature folder to make layer boundaries obvious.

```text
src/service/platforms/server/
├── api/
│   ├── port.ts                 # ApiServerPort interface
│   ├── adapters.ts             # FastifyApiAdapter, ExpressApiAdapter
│   └── api-server.ts           # ApiServer implementation
├── page/
│   ├── port.ts                 # PageServerPort interface
│   ├── adapters.ts             # FastifyPageAdapter, ExpressPageAdapter
│   └── page-server.ts          # PageServer implementation
├── database/
│   ├── port.ts                 # DatabaseServerPort interface
│   ├── adapters.ts             # MongooseAdapter, SequelizeAdapter, SQLiteAdapter
│   └── database-server.ts      # DatabaseServer implementation
├── types/
│   └── server-config.ts        # Configuration types
└── server.ts                   # Server orchestrator
```

The pattern keeps port and adapter definitions with their implementations, making relationships clear and facilitating discovery.

---

### `ApiServerPort`

Port interface for REST API servers. Adapters implement this interface for Fastify and Express.

```typescript
interface ApiServerPort {
  registerRoute(handler: RouteHandler): void;
  registerHook(handler: HookHandler): void;
  registerProxy(config: ProxyConfig): void;
  listen(host: string, port: number): Promise<void>;
  getRawServer(): unknown;
}
```

**Methods:**

- `registerRoute()` - Register a REST route handler
- `registerHook()` - Register middleware/hook (CORS, helmet, etc.)
- `registerProxy()` - Register a reverse proxy route (gateway mode)
- `listen(host, port)` - Start listening on the supplied host and port
- `getRawServer()` - Get the underlying Fastify or Express instance

This is an intentional breaking adapter contract during pre-0.1.0 development:
custom adapters must accept and use both host and port. The built-in Fastify and
Express adapters do so; Zacatl's Service defaults to `0.0.0.0` for container
reachability.

---

### `PageServerPort`

Port interface for frontend/page servers. Handles static files and SPA routing.

```typescript
interface PageServerPort {
  registerStaticFiles(config: StaticConfig): void;
  registerSpaFallback(prefixes: ApiPrefixes, staticDir: string): void;
  register(): Promise<void>;
  getRawServer?(): unknown;
}
```

**Methods:**

- `registerStaticFiles()` - Serve static files from a directory
- `registerSpaFallback()` - Enable SPA routing (fallback to index.html for non-API routes)
- `register()` - Complete adapter registration
- `getRawServer()` - Optional access to the underlying Fastify or Express instance

---

### `DatabaseServerPort`

Port interface for database connections.

```typescript
interface DatabaseServerPort {
  connect(serviceName: string, config: DatabaseConfig): Promise<void>;
  disconnect?(): Promise<void>;
}
```

**Methods:**

- `connect()` - Establish database connection
- `disconnect()` - Close database connection (optional)

---

### Adapter Classes

### Fastify Adapters

#### `FastifyApiAdapter`

REST API adapter for Fastify.

```typescript
import { createApiAdapter as createFastifyApiAdapter } from '@sentzunhat/zacatl/service/platforms/server/providers/fastify/api-adapter';
```

#### `FastifyPageAdapter`

Page server adapter for Fastify.

```typescript
import { createPageAdapter as createFastifyPageAdapter } from '@sentzunhat/zacatl/service/platforms/server/providers/fastify/page-adapter';
```

---

### Express Adapters

#### `ExpressApiAdapter`

REST API adapter for Express.

```typescript
import { createApiAdapter as createExpressApiAdapter } from '@sentzunhat/zacatl/service/platforms/server/providers/express/api-adapter';
```

#### `ExpressPageAdapter`

Page server adapter for Express.

```typescript
import { createPageAdapter as createExpressPageAdapter } from '@sentzunhat/zacatl/service/platforms/server/providers/express/page-adapter';
```

---

## Examples

SQLite can be used in two different ways:

- Native `DatabaseVendor.SQLITE` (no ORM instance required)
- Sequelize configured with SQLite dialect (`DatabaseVendor.SEQUELIZE`)

### Example 1: Fastify API Server (Basic)

Simple REST API server with Fastify.

```typescript
import Fastify from 'fastify';
import { Service, ServiceType } from '@sentzunhat/zacatl/service';
import { ServerVendor, ServerType } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';

const fastify = Fastify();

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    application: {
      entryPoints: { rest: { hooks: [], routes: [] } },
    },
    domain: { services: [] },
    infrastructure: { repositories: [] },
  },
  platforms: {
    server: {
      name: 'my-api',
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

await service.start();
// Server running at http://localhost:3000
```

---

### Example 2: Fastify with Native SQLite Vendor

Fastify server with `DatabaseVendor.SQLITE` (no Sequelize instance).

```typescript
import Fastify from 'fastify';
import {
  Service,
  ServiceType,
  ServerVendor,
  ServerType,
  DatabaseVendor,
} from '@sentzunhat/zacatl/service';

const fastify = Fastify();

const service = new Service({
  type: ServiceType.SERVER,
  platforms: {
    server: {
      name: 'fastify-sqlite',
      port: 3001,
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
      },
      databases: [
        {
          vendor: DatabaseVendor.SQLITE,
          connection: { url: 'app.db' },
        },
      ],
    },
  },
  layers: {
    infrastructure: {
      repositories: [/* ... */],
    },
    domain: {
      services: [/* ... */],
    },
    application: {
      entryPoints: {
        rest: {
          routes: [/* ... */],
        },
      },
    },
  },
});

await service.start();
```

---

### Example 3: Express Server

Simple Express REST API server.

```typescript
import express from 'express';
import { Service } from '@sentzunhat/zacatl/service';
import { ServerVendor, ServerType } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';

const app = express();

const service = new Service({
  type: 'SERVER',
  platforms: {
    server: {
      name: 'express-api',
      port: 8083,
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.EXPRESS,
        instance: app,
      },
      databases: [],
    },
  },
  layers: {
    application: {
      entryPoints: {
        rest: {
          routes: [/* your routes */],
        },
      },
    },
  },
});

await service.start();
// Server running at http://localhost:8083
```

---

### Example 4: Full-Stack App with Page Server

Fastify server with React SPA + API + Sequelize using SQLite dialect.

```typescript
import Fastify from 'fastify';
import { Sequelize } from 'sequelize';
import { Service, DatabaseVendor } from '@sentzunhat/zacatl/service';
import { ServerVendor, ServerType } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';

const fastify = Fastify();
const sequelize = new Sequelize('sqlite:database.sqlite');

const service = new Service({
  type: 'SERVER',
  platforms: {
    server: {
      name: 'full-stack-app',
      port: 8081,
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
      },
      page: {
        staticDir: './dist/client', // Built React/Vue/Svelte app
        prefixes: { api: '/api', webhooks: '/webhooks' }, // API routes excluded from SPA fallback
      },
      databases: [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelize,
          connection: { url: 'sqlite:database.sqlite' },
          onDatabaseConnected: async (db) => {
            await (db as Sequelize).sync();
          },
        },
      ],
    },
  },
  layers: {
    infrastructure: {
      repositories: [/* ... */],
    },
    domain: {
      services: [/* ... */],
    },
    application: {
      entryPoints: {
        rest: {
          routes: [/* API routes */],
        },
      },
    },
  },
});

await service.start();
// API: http://localhost:8081/api/*
// SPA: http://localhost:8081/*
```

---

### Example 5: API Gateway with Proxy

Fastify gateway server that proxies requests to multiple backend services.

```typescript
import Fastify from 'fastify';
import { Service } from '@sentzunhat/zacatl/service';
import { ServerVendor, ServerType } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';

const fastify = Fastify();

const service = new Service({
  type: 'SERVER',
  platforms: {
    server: {
      name: 'api-gateway',
      port: 9000,
      server: {
        type: ServerType.GATEWAY,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
        gateway: {
          proxies: [
            {
              upstream: 'http://localhost:3001',
              prefix: '/users',
            },
            {
              upstream: 'http://localhost:3002',
              prefix: '/products',
            },
            {
              upstream: 'http://localhost:3003',
              prefix: '/orders',
            },
          ],
        },
      },
      databases: [],
    },
  },
});

await service.start();
// Gateway running at http://localhost:9000
// /users/* → http://localhost:3001/users/*
// /products/* → http://localhost:3002/products/*
// /orders/* → http://localhost:3003/orders/*
```

---

### Example 6: Multi-Database Setup

Server with both MongoDB (Mongoose) and PostgreSQL (Sequelize).

```typescript
import Fastify from 'fastify';
import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';
import { Service, DatabaseVendor } from '@sentzunhat/zacatl/service';
import { ServerVendor, ServerType } from '@sentzunhat/zacatl/service/platforms/server/types/server-config';

const fastify = Fastify();
const sequelize = new Sequelize('postgres://localhost:5432/mydb');

const service = new Service({
  type: 'SERVER',
  platforms: {
    server: {
      name: 'multi-db-api',
      port: 4000,
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
      },
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: mongoose,
          connection: { url: 'mongodb://localhost:27017/mydb' },
          indexes: {
            bootMode:
              process.env.APP_ENV === 'local' ||
              process.env.APP_ENV === 'development' ||
              process.env.NODE_ENV === 'test'
                ? 'create'
                : 'off',
          },
          onDatabaseConnected: async () => {
            console.log('MongoDB connected');
          },
        },
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelize,
          connection: { url: 'postgres://localhost:5432/mydb' },
          onDatabaseConnected: async (db) => {
            await (db as Sequelize).sync();
            console.log('PostgreSQL connected');
          },
        },
      ],
    },
  },
  layers: {
    infrastructure: {
      repositories: [/* ... */],
    },
    domain: {
      services: [/* ... */],
    },
    application: {
      entryPoints: {
        rest: {
          routes: [/* ... */],
        },
      },
    },
  },
});

await service.start();
```

---

## Common Patterns

### Development Mode with Vite/Webpack Dev Server

Proxy to frontend dev server during development:

```typescript
const service = new Service({
  platforms: {
    server: {
      page: {
        devServerUrl: 'http://localhost:5173', // Vite dev server
        prefixes: { api: '/api' },
      },
      // ...
    },
  },
});
```

### Custom Server Registration

For advanced server configuration:

```typescript
const service = new Service({
  platforms: {
    server: {
      page: {
        customRegister: async ({ rawServer, resolve, isApiRequest }) => {
          const fastify = rawServer as FastifyInstance;
          const pageRenderer = resolve(PageRenderer);
          registerHtmlNotFound(fastify, pageRenderer, isApiRequest);
          await fastify.register(somePlugin);
        },
      },
      // ...
    },
  },
});
```

`PageRenderer` and `registerHtmlNotFound` are application code. The latter
should return the normal JSON 404 when `isApiRequest(request.url)` is true, and render
HTML only for page requests. Keep its response policy in the application.

---

## Testing

Zacatl tests live under `test/` at the repo root. Run them from the root:

```bash
npm test
npm run test:watch
npm run test:coverage
```

When adding new server platform behavior, add unit tests in `test/unit/` alongside existing service and platform specs.

---

## Related

- [Service API](./api.md) - Main Service class configuration
- [Configuration](../configuration/README.md) - Full configuration reference
- [QA & Testing Guide](../roadmap/qa-testing-guide.md) - Testing patterns and known issues
- [Express Integration](./express.md) - Express.js framework guide
- [Examples](../../examples/) - Real-world examples
- [Fastify SQLite React Example](../../examples/fastify-sqlite-react/)
- [Express SQLite React Example](../../examples/express-sqlite-react/)

---

**Next**: [Repository API →](./repository.md)
