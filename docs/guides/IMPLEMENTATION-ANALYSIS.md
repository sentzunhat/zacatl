# Implementation Pattern Analysis & Recommendations

_Date: 2026-02-04_

## Summary

All examples have been updated to follow the **canonical Service Adapter Pattern**. The mictlan service was using an older pattern that we've now deprecated.

## ✅ What We Fixed

### 1. Removed Separate `init-di.ts` Files

- **Problem**: Mictlan used a separate DI initialization file
- **Solution**: Move all DI registration directly into `index.ts` main function
- **Why**: Simpler, more explicit, easier to understand the dependency flow

### 2. Removed Provider/Repository Arrays

- **Problem**: Old examples used `providers: [{ service: X, dependencies: [] }]`
- **Solution**: Always use `providers: []` and `repositories: []`
- **Why**: DI registration happens manually in index.ts, not via config arrays

### 3. Fixed DI Registration Pattern

- **Problem**: Mix of `registerSingleton()` for services, `useValue`, `useClass`
- **Solution**:
  - Repositories: `container.registerInstance(RepoClass, new RepoClass())`
  - Services: `container.registerInstance(ServiceClass, new ServiceClass(repo))`
  - Handlers: `container.registerSingleton(Handler, Handler)`

## 📁 Example Project Structure

### Current Structure (Recommended)

```
examples/
├── platform-express/
│   ├── 01-with-sqlite/          # Single service example
│   │   ├── src/
│   │   ├── package.json
│   │   └── README.md
│   └── 02-with-mongodb/         # With frontend
│       ├── frontend/            # React app
│       │   ├── src/
│       │   └── package.json
│       ├── backend/             # OR 'server/' folder
│       │   ├── src/
│       │   └── package.json
│       └── README.md
```

### Alternative Structure (Also Valid)

```
examples/
└── 02-fullstack-app/
    ├── client/                  # Frontend
    │   └── package.json
    ├── api/                     # Backend
    │   └── package.json
    └── README.md
```

## 🎯 Canonical Pattern (Final)

```typescript
/**
 * Entry Point - index.ts
 */

import "reflect-metadata";
import express from "express";
import { Sequelize } from "sequelize";
import { container } from "tsyringe";
import { Service } from "@sentzunhat/zacatl/service";

async function main() {
  const app = express();
  const sequelize = new Sequelize(/* config */);

  // ═══════════════════════════════════════════════════════════
  // DEPENDENCY INJECTION REGISTRATION
  // ═══════════════════════════════════════════════════════════

  // 1. Infrastructure Layer
  const repository = new MyRepositoryAdapter();
  container.registerInstance(MyRepositoryAdapter, repository);

  // 2. Domain Layer
  const service = new MyService(repository);
  container.registerInstance(MyService, service);

  // 3. Application Layer
  container.registerSingleton(MyHandler, MyHandler);

  // ═══════════════════════════════════════════════════════════
  // SERVICE CONFIGURATION
  // ═══════════════════════════════════════════════════════════

  const serviceConfig = {
    type: ServiceType.SERVER,
    platforms: {
      server: {
        name: "my-service",
        server: {
          type: ServerType.SERVER,
          vendor: ServerVendor.EXPRESS,
          instance: app,
        },
        databases: [{ vendor: DatabaseVendor.SEQUELIZE, instance: sequelize }],
      },
    },
    layers: {
      application: {
        entryPoints: { rest: { hooks: [], routes: [MyHandler] } },
      },
      domain: { providers: [] }, // ⚠️ ALWAYS EMPTY
      infrastructure: { repositories: [] }, // ⚠️ ALWAYS EMPTY
    },
  };

  const service = new Service(serviceConfig);
  await service.start({ port: 8080 });
}

main();
```

## 🚀 Recommendations for Zacatl Library

### Consider for Future Versions

1. **Simplified Config** - Could we eliminate the need for empty `providers`/`repositories` arrays entirely?

   ```typescript
   // Current (verbose)
   layers: {
     application: { entryPoints: { rest: { hooks: [], routes: [...] } } },
     domain: { providers: [] },
     infrastructure: { repositories: [] },
   }

   // Could become?
   layers: {
     rest: { routes: [...] }
   }
   ```

2. **DI Auto-Detection** - Service class could detect registered dependencies automatically
   - No need to pass handler classes if they're already in container
   - Service scans container for all `AbstractRouteHandler` instances

3. **Clearer Type Naming**
   - `ServiceConfiguration` is long and complex
   - Consider `ServiceConfig` or `ZacatlConfig`

4. **Template/Scaffolding Command**
   ```bash
   npx zacatl create my-service --platform express --db sequelize
   # Generates the exact canonical pattern
   ```

## 📝 Example Structure Guidance

### For Simple API Examples

- Keep it flat: `src/`, `package.json`, `README.md`
- No need for frontend/backend split

### For Fullstack Examples

- **Option A**: `frontend/` and `backend/` folders at root
  - Each has its own `package.json`
  - Clear separation
  - Can run independently

- **Option B**: `client/` and `server/` folders
  - Same as Option A, different naming
  - Use "server" to be clearer about the backend role

### What We Implemented

- Simple examples (01-with-sqlite): Flat structure
- Fullstack examples (02-with-mongodb): `frontend/` + `backend/` structure

## ✅ Current Status

All examples now follow the canonical pattern:

- ✅ Express + SQLite (updated)
- ✅ Express + MongoDB (updated)
- ✅ Fastify + SQLite (updated)
- ✅ Fastify + MongoDB (has backend/ folder structure)

## 🔄 Migration from Mictlan Pattern

If you have code using the mictlan pattern with `init-di.ts`:

1. Remove `init-di.ts` file
2. Move DI registration to `index.ts` main function
3. Change `providers: [{ service: X }]` to `providers: []`
4. Change `repositories: [{ token: "X" }]` to `repositories: []`
5. Use `registerInstance()` for repos/services, `registerSingleton()` for handlers

---

**Next Steps**: Update documentation to reference this canonical pattern, create scaffolding templates, consider library simplifications.
