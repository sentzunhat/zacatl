# Unified Dependency Export Strategy

## Overview

Zacatl consolidates all third-party dependencies into **single point of control** via the main library package. This approach eliminates version conflicts, reduces bundle size in consuming applications, and ensures consistent behavior across your entire ecosystem.

### Core Principle

**All examples and consuming applications import dependencies from `@sentzunhat/zacatl/*` subpath exports**, never directly from standalone `npm` packages.

---

## Exported Dependencies

### Framework Adapters (Subpath Exports)

These are exported via explicit subpaths for clarity and tree-shaking:

| Export         | Source    | Purpose                 |
| -------------- | --------- | ----------------------- |
| `Fastify`      | `fastify` | HTTP framework (v5.7.4) |
| `express`      | `express` | HTTP framework (v5.2.1) |
| `Application`  | `express` | Express app type        |
| `Router`       | `express` | Express router type     |
| `Request`      | `express` | Express request type    |
| `Response`     | `express` | Express response type   |
| `NextFunction` | `express` | Express middleware type |

### Subpath Exports

Subpath exports avoid naming conflicts and provide tree-shakeable imports:

#### HTTP Frameworks

```typescript
// Fastify
import {
  Fastify,
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
} from '@sentzunhat/zacatl/third-party/fastify';

// Fastify + Zod type provider (runtime compilers)
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from '@sentzunhat/zacatl/third-party/fastify';

// Express
import {
  express,
  Application,
  Router,
  Request,
  Response,
  NextFunction,
} from '@sentzunhat/zacatl/third-party/express';

// HTTP Proxy Middleware (Express proxies; optional peer: npm install http-proxy-middleware)
import {
  createProxyMiddleware,
  ProxyOptions,
} from '@sentzunhat/zacatl/third-party/http-proxy-middleware';
```

#### ORMs

```typescript
// Mongoose (MongoDB ODM)
import { mongoose, Schema, Model, Document } from '@sentzunhat/zacatl/third-party/databases/mongoose';

// Sequelize (SQL ORM)
import { Sequelize, DataTypes, Op } from '@sentzunhat/zacatl/third-party/databases/sequelize';
```

#### Utilities

```typescript
// Dependency Injection
import '@sentzunhat/zacatl/third-party/dependency-injection/reflect-metadata';
import { container } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';

// Validation
import { z } from '@sentzunhat/zacatl/third-party/zod';

// UUID Generation
import { v4 as uuidv4 } from '@sentzunhat/zacatl/third-party/uuid';

// Logging
import pino from '@sentzunhat/zacatl/third-party/pino';

// i18n Localization
import i18n from '@sentzunhat/zacatl/third-party/i18n';

// YAML Parsing
import yaml from '@sentzunhat/zacatl/third-party/js-yaml';
```

---

## Usage Patterns

### Before (❌ Not Recommended)

```typescript
// ❌ Direct npm package imports
import express from 'express';
import { Fastify } from 'fastify';
import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
```

### After (✅ Recommended)

```typescript
// ✅ Import from library
import { express } from '@sentzunhat/zacatl/third-party/express';
import { Fastify } from '@sentzunhat/zacatl/third-party/fastify';
import { mongoose } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import { Sequelize } from '@sentzunhat/zacatl/third-party/databases/sequelize';
import { v4 as uuidv4 } from '@sentzunhat/zacatl/third-party/uuid';
import { z } from '@sentzunhat/zacatl/third-party/zod';
```

---

## Complete Example: Express + MongoDB

```typescript
import '@sentzunhat/zacatl/third-party/dependency-injection/reflect-metadata';
import { express, Application } from '@sentzunhat/zacatl/third-party/express';
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import { z } from '@sentzunhat/zacatl/third-party/zod';
import { v4 as uuidv4 } from '@sentzunhat/zacatl/third-party/uuid';
import {
  DatabaseVendor,
  Service,
  ServiceType,
  ServerType,
  ServerVendor,
} from '@sentzunhat/zacatl/service';

// ✅ All dependencies flow through library exports
const app: Application = express();
const db = mongoose;

// Service configuration
const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    application: { entryPoints: { rest: { routes: [] } } },
    domain: { services: [] },
    infrastructure: { repositories: [] },
  },
  platforms: {
    server: {
      name: 'example-service',
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.EXPRESS,
        instance: app,
      },
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: db,
          connection: { url: 'mongodb://localhost/example' },
        },
      ],
      port: 4000,
    },
  },
});

// Start service
await service.start({ host: '0.0.0.0', port: 4000 });
```

---

## Package.json Configuration

### Main Library (Maintained by Zacatl)

**Published tarball**: The npm package ships with an `exports` map generated by [prepare-publish.ts](../../scripts/publish/prepare-publish.ts). The map is written to `publish/package.json`; the script copies the local compilation outputs into the publish tree and rewrites export targets:

- `build-src-esm/` → `build/esm/`
- `build-src-cjs/` → `build/cjs/`

Before writing the export map, `prepare-publish.ts` prunes nested `index.*`
barrels from `publish/build/{esm,cjs}` unless they are still exported entry
points. That keeps the tarball focused on the public surface without deleting
subpaths that `publish/package.json` still exposes.

**Local development**: After `npm run build`, the postbuild flow runs `local:exports` and writes a generated `exports` map into the root `package.json`. Its targets point at the local compilation directories, `build-src-esm/` and `build-src-cjs/`:

```
@sentzunhat/zacatl/third-party/fastify
  → node_modules/@sentzunhat/zacatl/build-src-esm/third-party/fastify.js
```

The map is generated from build artifacts by `scripts/dev/sync-local-exports.ts`; it is not a claim that package subpaths resolve by direct filesystem access without an export map.

**Published package exports** (in `publish/package.json`) follow the three-condition format:

```json
{
  "./third-party/fastify": {
    "types": "./build/esm/third-party/fastify.d.ts",
    "import": "./build/esm/third-party/fastify.js",
    "require": "./build/cjs/third-party/fastify.js"
  }
}
```

(The paths above are for `publish/package.json`: `publish/build/esm/` and
`publish/build/cjs/`. The root package's local generated map targets
`build-src-esm/` and `build-src-cjs/`.)

The current manifest includes the reorganized public paths. Configuration is
exported under `./utils/configuration` (and its `json` and `yml` leaves);
localization is under `./third-party/localization`. The ESLint shareable config
tree is exported as `./third-party/eslint` and its named `.mjs` subpaths, while
the vendor wrapper is `./third-party/eslint-plugins`. The config tree has ESM
targets only; the vendor wrapper has `types`, `import`, and `require` targets.

Nested `index.*` barrel files are pruned from the published tarball. Consumers
should import explicit leaf modules or named entry files that are exported from
`publish/package.json`.

### Development vs Publish Export Patterns

Use this table as the quick reference for when export maps are generated, where
they are written, and which command/script is responsible.

| Context                          | Trigger                                                  | Export targets                               | Output file and source script                                                             |
| -------------------------------- | -------------------------------------------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Local build                      | `npm run build` (postbuild runs `local:exports`)          | `build-src-esm/` and `build-src-cjs/`        | root `package.json`; [`sync-local-exports.ts`](../../scripts/dev/sync-local-exports.ts)   |
| Manual local export regeneration | `npm run local:exports`                                  | `build-src-esm/` and `build-src-cjs/`        | root `package.json`; [`sync-local-exports.ts`](../../scripts/dev/sync-local-exports.ts)   |
| Publish packaging                | `npm run prepare-publish` (also used by publish scripts) | `publish/build/esm/` and `publish/build/cjs/` | `publish/package.json`; [`prepare-publish.ts`](../../scripts/publish/prepare-publish.ts)  |

Command references in root scripts:

- `local:exports`: [package.json](../../package.json)
- `prepare-publish`: [package.json](../../package.json)
- `publish:dry`, `publish:latest`, `publish:otp`: [package.json](../../package.json)

Recommended verification flow:

1. Build artifacts: `npm run build`
2. Optional local subpath resolution test: `npm run local:exports`
3. Generate publish metadata: `npm run prepare-publish`
4. Validate publish package without release: `npm run publish:dry`

Notes:

- The publish contract for consumers is the generated `publish/package.json`.
- Root `package.json` export entries resolve the local build outputs. The
  publish script creates a separate package manifest with publish-tree paths.

### Example Application (Consuming Zacatl)

```json
{
  "name": "my-api-express-mongodb",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@sentzunhat/zacatl": "latest",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "vite": "^5.2.0"
  }
}
```

**Key Differences:**

- ✅ `@sentzunhat/zacatl` is enough for core usage
- ✅ Add optional peers only for the adapters you use (`mongoose`, `sequelize`, `sqlite3`, `pg`, `mongodb`)
- ✅ Reduced `package.json` complexity and reproducible builds

---

## Workspace Resolution

In monorepo setups, npm resolves dependency conflicts by preferring workspace versions:

```
your-monorepo/
├── package.json              # Defines workspaces
├── node_modules/             # Shared dependencies
│   ├── express/
│   ├── mongoose/
│   └── zacatl/               # Main library
├── apps/
│   ├── backend/
│   │   └── src/index.ts      # Imports from @sentzunhat/zacatl
│   └── frontend/
└── examples/
    ├── express-mongodb/
    │   └── apps/
    │       ├── backend/      # Uses library exports
    │       └── frontend/
```

- `backend/` imports from library
- Library shares dependencies from monorepo root
- No duplicate versions in `backend/node_modules`

---

## Migration Guide

### Step 1: Update Library Exports (Already Done)

Zacatl exports all dependencies via subpaths:

```typescript
// ✅ Library exports framework adapters
export * from './fastify';
export * from './express';
// http-proxy-middleware is an optional peer: subpath only

// ✅ ORM exports available via subpaths to avoid conflicts
// @sentzunhat/zacatl/third-party/databases/mongoose
// @sentzunhat/zacatl/third-party/databases/sequelize
```

### Step 2: Remove Duplicate Dependencies from Examples

Update monorepo `package.json`:

**Before:**

```json
{
  "dependencies": {
    "@sentzunhat/zacatl": "file:../../../",
    "express": "^5.2.1",
    "mongoose": "^9.0.0",
    "react": "^18.3.1"
  }
}
```

**After:**

```json
{
  "dependencies": {
    "@sentzunhat/zacatl": "file:../../../",
    "react": "^18.3.1"
  }
}
```

### Step 3: Update Imports

Search and replace pattern across all source files:

```typescript
// ❌ Before
import express from 'express';
import { Fastify } from 'fastify';
import mongoose from 'mongoose';

// ✅ After
import { express } from '@sentzunhat/zacatl/third-party/express';
import { Fastify } from '@sentzunhat/zacatl/third-party/fastify';
import { mongoose } from '@sentzunhat/zacatl/third-party/databases/mongoose';
```

### Step 4: Run Integration Tests

```bash
# Install dependencies (resolve through workspaces/library)
npm install

# Build all examples
npm run build

# Run examples to verify imports resolve
cd examples/fastify-sqlite-react && npm run dev
```

---

## Benefits

| Benefit                   | Description                                                         |
| ------------------------- | ------------------------------------------------------------------- |
| **Single Version Source** | All consuming apps use identical dependency versions                |
| **Conflict Resolution**   | npm resolves versions at library level, not repeated per app        |
| **Smaller Bundles**       | No duplicate node_modules across multiple apps                      |
| **Easier Updates**        | Bump version in library package.json, propagates everywhere         |
| **Type Safety**           | Single definition of types (Mongoose Schema, Sequelize Model, etc.) |
| **Consistency**           | All examples follow identical patterns                              |

---

## Version Management

When updating dependencies:

1. **Update library** `package.json`:

   ```json
   {
     "dependencies": {
       "express": "^5.3.0", // ← Update here
       "mongoose": "^9.1.0" // ← Update once
     }
   }
   ```

2. **Publish to npm** (or update workspace reference in monorepo)

3. **All consuming apps automatically use new version** (on next `npm install`)

---

## Troubleshooting

### Issue: "Cannot find module 'express'"

**Solution:** Verify import path:

```typescript
// ❌ Wrong
import express from 'express';

// ✅ Correct
import { express } from '@sentzunhat/zacatl/third-party/express';
```

### Issue: Duplicate dependencies in node_modules

**Solution:** Remove from `package.json`:

```json
{
  "dependencies": {
    "express": "^5.0.0" // ← Remove this
  }
}
```

### Issue: Type errors on imported classes

**Solution:** Ensure subpath exports exist:

```bash
# Verify build includes all exports
ls build-src-esm/third-party/
# Should show: express.js, fastify.js, mongoose.js, sequelize.js, etc.
```

---

## Resources

- [Service Architecture](./README.md) - Service layer implementation
- [Dependency Injection](../dependency-injection/README.md) - DI container setup
- [Error Handling](../error/README.md) - Unified error types
- [QA & Testing](../roadmap/qa-testing-guide.md) - Full integration test examples
