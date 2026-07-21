# Third-Party Dependencies

Zacatl re-exports commonly used third-party packages for convenience and provides ORM packages via subpath imports.

## Core Re-Exports

### tsyringe (Dependency Injection)

```typescript
import { container, injectable, inject } from '@sentzunhat/zacatl/third-party';

@injectable()
class UserService {
  constructor(private userRepo: UserRepository) {}
}

container.register('UserService', { useClass: UserService });
```

### Zod (Validation)

```typescript
import { z } from '@sentzunhat/zacatl/third-party';

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});
```

> **Roadmap**: Zod is the recommended validation library. Future versions will support **Yup** for migration paths and **optional validation** for performance-critical scenarios. See [Roadmap: Schema Validation Flexibility](../roadmap/index.md#schema-validation-flexibility-v0040--v010) for details.

## ORM Packages (Subpath Imports Only)

ORM integrations are exposed via subpath imports.
Depending on which adapter you use, install the matching optional peer
dependency in your consumer project. Non-SQL consumers do not need Sequelize.

See [../third-party/orm/overview.md](../third-party/orm/overview.md) for full usage and examples.

## Why Subpath Imports for ORMs?

**Lazy loading**: Only the ORM you actually use is evaluated at runtime

```typescript
// ✅ Only evaluates Mongoose at runtime
import { mongoose } from '@sentzunhat/zacatl/third-party/databases/mongoose';

// ❌ Do not import from a removed root barrel
import { Service } from '@sentzunhat/zacatl'; // root export removed in 0.0.56
```

## Package Structure

```
src/third-party/
├── index.ts                  # tsyringe + zod + uuid re-exports (no ORM barrels)
├── databases/
│   ├── mongoose.ts           # Mongoose re-export (subpath only)
│   ├── sequelize.ts          # Sequelize re-export (subpath only)
│   ├── sqlite3.ts            # sqlite3 re-export (subpath only)
│   └── nodesqlite.ts         # node:sqlite helper (subpath only)
├── dependency-injection/
│   ├── tsyringe.ts           # DI container re-export
│   └── reflect-metadata.ts   # reflect-metadata side-effect import
├── eslint.ts                 # ESLint plugins re-export (subpath only)
├── express.ts                # Express re-export (subpath only)
├── fastify.ts                # Fastify + ZodTypeProvider
├── http-proxy-middleware.ts  # HTTP proxy re-export (subpath only)
├── i18n.ts                   # i18n re-export (subpath only)
├── js-yaml.ts                # YAML parser re-export (subpath only)
├── pino.ts                   # Pino logger re-export (subpath only)
├── uuid.ts                   # UUID utilities re-export (subpath only)
└── zod.ts                    # Validation re-export (subpath only)
```

> ORM and DI modules live under nested folders. Flat shims (`third-party/mongoose`, `third-party/tsyringe`, …) are not published.

## Version Compatibility

Zacatl uses these third-party versions:

### Core Runtime Dependencies (installed with Zacatl)

- **tsyringe**: ^4.10.0
- **zod**: ^4.3.6
- **express**: ^5.2.1
- **fastify**: ^5.7.4
- **pino**: ^10.3.0
- All other utilities (uuid, i18n, js-yaml, http-proxy-middleware, reflect-metadata)

### Optional Peer Dependencies (install based on adapter usage)

- **mongoose**: ^9.7.4 (MongoDB adapter)
- **mongodb**: ^7.2.0 (MongoDB driver)
- **sequelize**: ^6.37.8 (SQL adapter)
- **sqlite3**: ^6.0.1 (SQLite ecosystem support)
- **pg**: ^8.22.0 (PostgreSQL ecosystem support)

### Additional Drivers (not provided by Zacatl)

- **mysql2**: MySQL driver
- **pg-hstore**: PostgreSQL hstore support for Sequelize

Subpath imports are always available from `@sentzunhat/zacatl/third-party/*`.
For optional peers, install the corresponding package in your service.

## Import Patterns

### Main Package Imports

```typescript
// Core third-party re-exports (tsyringe symbols also available via nested path)
import { container, injectable } from '@sentzunhat/zacatl/third-party';
import { z } from '@sentzunhat/zacatl/third-party/zod';
```

### Nested ORM / DI Subpaths

```typescript
import { mongoose } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import { Sequelize } from '@sentzunhat/zacatl/third-party/databases/sequelize';
import { inject, singleton } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import '@sentzunhat/zacatl/third-party/dependency-injection/reflect-metadata';
```

## Database Drivers (still required for Sequelize)

```bash
# Install the dialect package matching your SQL database
npm install pg pg-hstore      # PostgreSQL
npm install mysql2            # MySQL
npm install sqlite3           # SQLite
```

## Dependency policy

- Core web/runtime dependencies are installed transitively with Zacatl.
- ORM/database ecosystems are declared as optional peers (`mongoose`, `sequelize`, `sqlite3`, `pg`, `mongodb`); install only what your project uses.
- SQL dialect extras (for example `mysql2`, `pg-hstore`) are not provided by Zacatl and must be installed by consumers when needed.

Use `npm run check:peers` to validate your environment before publishing or releasing.

## Related

- [Path Aliases](../utils/path-aliases.md)
- [ORM Overview](orm/overview.md)
- [ORM Architecture](orm/architecture.md)
