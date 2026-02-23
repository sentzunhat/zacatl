# Unified Dependency Export Strategy

## Overview

Zacatl v0.0.39+ consolidates all third-party dependencies into **single point of control** via the main library package. This approach eliminates version conflicts, reduces bundle size in consuming applications, and ensures consistent behavior across your entire ecosystem.

### Core Principle

**All examples and consuming applications import dependencies exclusively from `@sentzunhat/zacatl` and its subpath exports**, never directly from `npm` packages.

---

## Exported Dependencies

### Framework Adapters (Direct Exports)

These are re-exported from the main entry point for convenience:

| Export         | Source    | Purpose                  |
| -------------- | --------- | ------------------------ |
| `Fastify`      | `fastify` | HTTP framework (v5.7.4)  |
| `Router`       | `fastify` | Fastify router utilities |
| `express`      | `express` | HTTP framework (v5.2.1)  |
| `Application`  | `express` | Express app type         |
| `Router`       | `express` | Express router type      |
| `Request`      | `express` | Express request type     |
| `Response`     | `express` | Express response type    |
| `NextFunction` | `express` | Express middleware type  |

### Subpath Exports

Subpath exports avoid naming conflicts and provide tree-shakeable imports:

#### HTTP Frameworks

```typescript
// Fastify
import { Fastify, Router } from '@sentzunhat/zacatl/third-party/fastify';

// Express
import {
  express,
  Application,
  Router,
  Request,
  Response,
  NextFunction,
} from '@sentzunhat/zacatl/third-party/express';

// HTTP Proxy Middleware (Express/Fastify)
import {
  createProxyMiddleware,
  ProxyOptions,
} from '@sentzunhat/zacatl/third-party/http-proxy-middleware';
```

#### ORMs

```typescript
// Mongoose (MongoDB ODM)
import { mongoose, Schema, Model, Document } from '@sentzunhat/zacatl/third-party/mongoose';

// Sequelize (SQL ORM)
import { Sequelize, DataTypes, Op } from '@sentzunhat/zacatl/third-party/sequelize';
```

#### Utilities

```typescript
// Dependency Injection
import '@sentzunhat/zacatl/third-party/reflect-metadata';
import { container } from '@sentzunhat/zacatl/dependency-injection';

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
import { mongoose } from '@sentzunhat/zacatl/third-party/mongoose';
import { Sequelize } from '@sentzunhat/zacatl/third-party/sequelize';
import { v4 as uuidv4 } from '@sentzunhat/zacatl/third-party/uuid';
import { z } from '@sentzunhat/zacatl/third-party/zod';
```

---

## Complete Example: Express + MongoDB

```typescript
import '@sentzunhat/zacatl/third-party/reflect-metadata';
import { express, Application } from '@sentzunhat/zacatl/third-party/express';
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/mongoose';
import { z } from '@sentzunhat/zacatl/third-party/zod';
import { v4 as uuidv4 } from '@sentzunhat/zacatl/third-party/uuid';
import { Service } from '@sentzunhat/zacatl/service';

// ✅ All dependencies flow through library exports
const app: Application = express();
const db = mongoose;

// Service configuration
const service = new Service({
  handler: {
    type: 'express',
    adapter: app,
    routes: [...routes],
  },
  handler: {
    db: {
      type: 'mongoose',
      adapter: db,
      config: { uri: 'mongodb://...' },
    },
  },
});

// Start service
await service.start({ port: 4000 });
```

---

## Package.json Configuration

### Main Library (Maintained by Zacatl)

```json
{
  "name": "@sentzunhat/zacatl",
  "version": "0.0.39",
  "type": "module",
  "dependencies": {
    "fastify": "^5.7.4",
    "express": "^5.2.1",
    "mongoose": "^9.0.0",
    "sequelize": "^6.0.0",
    "sqlite3": "^5.1.7",
    "pg": "^8.18.0",
    "zod": "^4.3.6",
    "uuid": "^13.0.0",
    "pino": "^10.3.0",
    "i18n": "^0.15.3",
    "js-yaml": "^4.1.1",
    "tsyringe": "^4.10.0",
    "reflect-metadata": "^0.2.2",
    "http-proxy-middleware": "^3.0.5"
  },
  "exports": {
    ".": "./build/index.js",
    "./service": "./build/service/index.js",
    "./third-party/express": "./build/third-party/express.js",
    "./third-party/fastify": "./build/third-party/fastify.js",
    "./third-party/mongoose": "./build/third-party/mongoose.js",
    "./third-party/sequelize": "./build/third-party/sequelize.js"
  }
}
```

### Example Application (Consuming Zacatl)

```json
{
  "name": "my-api-express-mongodb",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@sentzunhat/zacatl": "^0.0.39",
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

- ✅ Only `@sentzunhat/zacatl` as dependency (not express, mongoose, sequelize, etc.)
- ✅ Framework dependencies resolve through workspace (in monorepo) or library's node_modules
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
export * from './http-proxy-middleware';

// ✅ ORM exports available via subpaths to avoid conflicts
// @sentzunhat/zacatl/third-party/mongoose
// @sentzunhat/zacatl/third-party/sequelize
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
import { mongoose } from '@sentzunhat/zacatl/third-party/mongoose';
```

### Step 4: Run Integration Tests

```bash
# Install dependencies (resolve through workspaces/library)
npm install

# Build all examples
npm run build

# Run examples to verify imports resolve
npm run backend:start
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
ls build/third-party/
# Should show: express.js, fastify.js, mongoose.js, sequelize.js, etc.
```

---

## Resources

- [Service Architecture](./README.md) - Service layer implementation
- [Dependency Injection](../dependency-injection/README.md) - DI container setup
- [Error Handling](../error/README.md) - Unified error types
- [QA & Testing](../roadmap/qa-testing-guide.md) - Full integration test examples
