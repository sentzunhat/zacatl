# Server Platform API

Complete API reference for the server platform, including HTTP servers, page servers, and database connections.

## Overview

The server platform provides infrastructure for building web applications with REST APIs, static file hosting, and database connectivity. It uses the **Hexagonal Architecture** (Ports and Adapters pattern) to abstract HTTP server implementations (Fastify, Express) and database vendors (Mongoose, Sequelize).

## Import

```typescript
import { ConfigServer, ServerVendor, ServerType, DatabaseVendor } from '@sentzunhat/zacatl';
```

---

## Third-Party Dependencies

All HTTP frameworks, databases, and utilities used by the server platform are **exported via the library** for consistent versioning across your application. See [Unified Dependency Export Strategy](./dependency-exports.md) for detailed import patterns and package management.

**Key Exports:**

- HTTP Frameworks: `@sentzunhat/zacatl/third-party/express`, `./fastify`
- Databases: `@sentzunhat/zacatl/third-party/mongoose`, `./sequelize`
- Utilities: `./zod`, `./uuid`, `./pino`, and more

---

## Configuration Types

### `ConfigServer`

Main configuration object for the server platform.

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

**Properties:**

- `name` - Unique name for the server instance
- `server` - HTTP server configuration (Fastify or Express)
- `databases` - Array of database connections (Mongoose, Sequelize)
- `page` - Optional page server configuration for SPAs and static files
- `port` - Port number to listen on
- `entryPoints` - REST application routes and hooks (usually defined in `layers.application` instead)

---

### `HttpServerConfig`

HTTP server configuration for API and gateway servers.

```typescript
type HttpServerConfig = {
  type: ServerType; // "SERVER" | "GATEWAY"
  vendor: ServerVendor; // "FASTIFY" | "EXPRESS"
  instance: unknown; // FastifyInstance | Express
  gateway?: GatewayService; // Required if type is GATEWAY
};
```

**Properties:**

- `type` - Server type: `SERVER` (standard REST API) or `GATEWAY` (reverse proxy)
- `vendor` - HTTP framework: `FASTIFY` or `EXPRESS`
- `instance` - The Fastify or Express instance (create before passing to config)
- `gateway` - Gateway configuration with proxy routes (required when `type` is `GATEWAY`)

---

### `PageServerConfig`

Configuration for serving frontend applications (React, Vue, Svelte, etc.) and static files.

```typescript
type PageServerConfig = {
  devServerUrl?: string;
  staticDir?: string;
  customRegister?: (server: unknown) => Promise<void> | void;
  apiPrefix?: string;
};
```

**Properties:**

- `devServerUrl` - Development server URL for proxying (e.g., Vite dev server at `http://localhost:5173`)
- `staticDir` - Directory containing built static files (e.g., `./dist/client`)
- `customRegister` - Custom registration function for advanced server configuration
- `apiPrefix` - API route prefix to exclude from SPA fallback (default: `/api`)

---

### `DatabaseConfig`

Database connection configuration supporting Mongoose (MongoDB) and Sequelize (SQL).

```typescript
type DatabaseConfig = {
  vendor: DatabaseVendor; // "MONGOOSE" | "SEQUELIZE"
  instance: DatabaseInstance; // Mongoose | Sequelize
  connectionString: string;
  onDatabaseConnected?: (dbInstance: DatabaseInstance) => Promise<void> | void;
};
```

**Properties:**

- `vendor` - Database vendor: `MONGOOSE` or `SEQUELIZE`
- `instance` - The Mongoose or Sequelize instance
- `connectionString` - Database connection string (e.g., `sqlite:database.sqlite`, `mongodb://localhost:27017/mydb`)
- `onDatabaseConnected` - Optional callback invoked after successful connection (use for model initialization, syncing, etc.)

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
}
```

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
│   ├── adapters.ts             # MongooseAdapter, SequelizeAdapter
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
  listen(port: number): Promise<void>;
  getRawServer(): unknown;
}
```

**Methods:**

- `registerRoute()` - Register a REST route handler
- `registerHook()` - Register middleware/hook (CORS, helmet, etc.)
- `registerProxy()` - Register a reverse proxy route (gateway mode)
- `listen()` - Start listening on specified port
- `getRawServer()` - Get the underlying Fastify or Express instance

---

### `PageServerPort`

Port interface for frontend/page servers. Handles static files and SPA routing.

```typescript
interface PageServerPort {
  registerStaticFiles(config: StaticConfig): void;
  registerSpaFallback(apiPrefix: string, staticDir: string): void;
  register(server: unknown): Promise<void>;
}
```

**Methods:**

- `registerStaticFiles()` - Serve static files from a directory
- `registerSpaFallback()` - Enable SPA routing (fallback to index.html for non-API routes)
- `register()` - Custom registration handler

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
import { FastifyApiAdapter } from '@sentzunhat/zacatl/service/platforms/server/adapters';
```

#### `FastifyPageAdapter`

Page server adapter for Fastify.

```typescript
import { FastifyPageAdapter } from '@sentzunhat/zacatl/service/platforms/server/adapters';
```

---

### Express Adapters

#### `ExpressApiAdapter`

REST API adapter for Express.

```typescript
import { ExpressApiAdapter } from '@sentzunhat/zacatl/service/platforms/server/adapters';
```

#### `ExpressPageAdapter`

Page server adapter for Express.

```typescript
import { ExpressPageAdapter } from '@sentzunhat/zacatl/service/platforms/server/adapters';
```

---

## Examples

### Example 1: Fastify API Server (Basic)

Simple REST API server with Fastify.

```typescript
import Fastify from 'fastify';
import { Service, ServiceType, ServerVendor, ServerType } from '@sentzunhat/zacatl';

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

### Example 2: Fastify with SQLite Database

Fastify server with Sequelize + SQLite.

```typescript
import Fastify from 'fastify';
import { Sequelize } from 'sequelize';
import { Service, ServerVendor, ServerType, DatabaseVendor } from '@sentzunhat/zacatl';

const fastify = Fastify();
const sequelize = new Sequelize('sqlite:database.sqlite');

const service = new Service({
  type: 'SERVER',
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
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelize,
          connectionString: 'sqlite:database.sqlite',
          onDatabaseConnected: async (db) => {
            await (db as Sequelize).sync({ alter: true });
            console.log('Database synchronized');
          },
        },
      ],
    },
  },
  layers: {
    infrastructure: {
      repositories: [
        /* ... */
      ],
    },
    domain: {
      services: [
        /* ... */
      ],
    },
    application: {
      entryPoints: {
        rest: {
          routes: [
            /* ... */
          ],
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
import { Service, ServerVendor, ServerType } from '@sentzunhat/zacatl';

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
          routes: [
            /* your routes */
          ],
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

Fastify server with React SPA + API + Database.

```typescript
import Fastify from 'fastify';
import { Sequelize } from 'sequelize';
import { Service, ServerVendor, ServerType, DatabaseVendor } from '@sentzunhat/zacatl';

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
        apiPrefix: '/api', // API routes excluded from SPA fallback
      },
      databases: [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelize,
          connectionString: 'sqlite:database.sqlite',
          onDatabaseConnected: async (db) => {
            await (db as Sequelize).sync();
          },
        },
      ],
    },
  },
  layers: {
    infrastructure: {
      repositories: [
        /* ... */
      ],
    },
    domain: {
      services: [
        /* ... */
      ],
    },
    application: {
      entryPoints: {
        rest: {
          routes: [
            /* API routes */
          ],
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
import { Service, ServerVendor, ServerType } from '@sentzunhat/zacatl';

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
import { Service, ServerVendor, ServerType, DatabaseVendor } from '@sentzunhat/zacatl';

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
          connectionString: 'mongodb://localhost:27017/mydb',
          onDatabaseConnected: async () => {
            console.log('MongoDB connected');
          },
        },
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelize,
          connectionString: 'postgres://localhost:5432/mydb',
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
      repositories: [
        /* ... */
      ],
    },
    domain: {
      services: [
        /* ... */
      ],
    },
    application: {
      entryPoints: {
        rest: {
          routes: [
            /* ... */
          ],
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
        apiPrefix: '/api',
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
        customRegister: async (server) => {
          const fastify = server as FastifyInstance;
          // Register custom plugins, middleware, etc.
          await fastify.register(somePlugin);
        },
      },
      // ...
    },
  },
});
```

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
- [Platform Fastify Examples](../../examples/platform-fastify/)
- [Platform Express Examples](../../examples/platform-express/)

---

**Next**: [Repository API →](./repository.md)
