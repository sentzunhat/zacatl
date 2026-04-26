# Subpath Import Guide — @sentzunhat/zacatl

Since **0.0.56**, Zacatl has **no root package barrel**. Import from explicit subpaths instead of `from '@sentzunhat/zacatl'`.

---

## Before (pre-0.0.56)

```typescript
// ❌ No longer supported — root barrel removed
import { Service, NotFoundError, container, mongoose, Schema } from '@sentzunhat/zacatl';
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/mongoose';
import { container } from '@sentzunhat/zacatl/third-party/tsyringe';
```

## After (0.0.56+)

```typescript
// ✅ Explicit module subpaths
import { Service, BaseRepository, ORMType } from '@sentzunhat/zacatl/service';
import { NotFoundError } from '@sentzunhat/zacatl/error';
import { resolveDependency } from '@sentzunhat/zacatl/dependency-injection';
import { container, inject, singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import { Sequelize, DataTypes } from '@sentzunhat/zacatl/third-party/databases/sequelize';
import { z } from '@sentzunhat/zacatl/third-party/zod';
```

---

## Public API modules

| What you need | Import path |
| ------------- | ----------- |
| `Service`, `BaseRepository`, `ORMType`, route handlers | `@sentzunhat/zacatl/service` |
| Error classes | `@sentzunhat/zacatl/error` |
| `registerDependency`, `resolveDependency`, … | `@sentzunhat/zacatl/dependency-injection` |
| `loadJSON`, `loadYML` | `@sentzunhat/zacatl/configuration` |
| `configureI18nNode`, locale helpers | `@sentzunhat/zacatl/localization` |
| `createLogger`, `requestContext` | `@sentzunhat/zacatl/logs` |
| `Optional`, command runner utilities | `@sentzunhat/zacatl/utils` |
| tsyringe, zod, express, fastify re-exports | `@sentzunhat/zacatl/third-party` or deeper subpaths |

See the [main README](../../README.md#-public-api-modules) for the full module table.

---

## Third-party nested paths (ORM & DI)

Database and DI re-exports use **nested subpaths only** — flat paths such as `/third-party/mongoose` or `/third-party/tsyringe` are not published.

| Package | Import path |
| ------- | ----------- |
| Mongoose | `@sentzunhat/zacatl/third-party/databases/mongoose` |
| Sequelize | `@sentzunhat/zacatl/third-party/databases/sequelize` |
| sqlite3 driver | `@sentzunhat/zacatl/third-party/databases/sqlite3` |
| node:sqlite helper | `@sentzunhat/zacatl/third-party/databases/nodesqlite` |
| tsyringe | `@sentzunhat/zacatl/third-party/dependency-injection/tsyringe` |
| reflect-metadata | `@sentzunhat/zacatl/third-party/dependency-injection/reflect-metadata` |
| Zod | `@sentzunhat/zacatl/third-party/zod` |

---

## Complete example

```typescript
import { Service, ServiceType, ServerType, ServerVendor, BaseRepository, ORMType } from '@sentzunhat/zacatl/service';
import { NotFoundError } from '@sentzunhat/zacatl/error';
import { resolveDependency } from '@sentzunhat/zacatl/dependency-injection';
import { inject, singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import { z } from '@sentzunhat/zacatl/third-party/zod';

@singleton()
class GreetingRepository extends BaseRepository<{ message: string }, { message: string }> {
  constructor() {
    super({ type: ORMType.Mongoose, schema: new Schema({ message: String }) });
  }
}

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    application: { entryPoints: { rest: { hooks: [], routes: [] } } },
    domain: { services: [] },
    infrastructure: { repositories: [GreetingRepository] },
  },
  platforms: {
    server: {
      name: 'greeting-service',
      server: { type: ServerType.SERVER, vendor: ServerVendor.FASTIFY, instance: fastify },
    },
  },
});
```

---

## In-repo development (`@zacatl/*`)

Examples and tests inside this repository map `@zacatl/*` to `build-src-esm` or `src` via `tsconfig.json`. That alias is **not** part of the published npm package.

```typescript
// Inside the zacatl repo / examples only
import { Service } from '@zacatl/service';
import { inject, singleton } from '@zacatl/third-party/dependency-injection/tsyringe';
import { mongoose, Schema } from '@zacatl/third-party/databases/mongoose';
```

Templates: [examples/shared/zacatl-build-paths.json](../../examples/shared/zacatl-build-paths.json).

---

## Migration checklist (0.0.55 → 0.0.56)

1. Replace `from '@sentzunhat/zacatl'` with the matching subpath (`/service`, `/error`, `/dependency-injection`, …).
2. Replace flat third-party paths:
   - `/third-party/mongoose` → `/third-party/databases/mongoose`
   - `/third-party/sequelize` → `/third-party/databases/sequelize`
   - `/third-party/tsyringe` → `/third-party/dependency-injection/tsyringe`
   - `/third-party/reflect-metadata` → `/third-party/dependency-injection/reflect-metadata`
3. Run `npm run type:check` in your consumer project after upgrading.

---

## Related

- [Third-Party README](./README.md)
- [Import strategies](./orm/orm-import-strategies.md)
- [Dependencies reference](./dependencies-reference.md)
- [Release notes — 0.0.56](../changelog.md)
