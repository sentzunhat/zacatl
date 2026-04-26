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
Depending on which adapter you use, install the matching optional peer dependency
in your consumer project.

See [../third-party/orm/overview.md](../third-party/orm/overview.md) for full usage and examples.

## Why Subpath Imports for ORMs?

**Lazy loading**: Only the ORM you actually use is evaluated at runtime

```typescript
// ✅ Only evaluates Mongoose at runtime
import { mongoose } from '@sentzunhat/zacatl/third-party/mongoose';

// ❌ Would evaluate all ORMs at import time (main entry stays clean)
import { mongoose, Sequelize } from '@sentzunhat/zacatl';
```

## Package Structure

```
src/third-party/
├── index.ts                  # Re-exports tsyringe, zod (in main package)
├── eslint.ts                 # ESLint plugins re-export (subpath only)
├── express.ts                # Express re-export (subpath only)
├── fastify.ts                # Fastify + ZodTypeProvider + serializerCompiler/validatorCompiler
├── http-proxy-middleware.ts  # HTTP proxy re-export (subpath only)
├── i18n.ts                   # i18n re-export (subpath only)
├── js-yaml.ts                # YAML parser re-export (subpath only)
├── mongoose.ts               # Mongoose re-export (subpath only)
├── pino.ts                   # Pino logger re-export (subpath only)
├── reflect-metadata.ts       # reflect-metadata side-effect import
├── sequelize.ts              # Sequelize re-export (subpath only)
├── tsyringe.ts               # DI container re-export
├── uuid.ts                   # UUID utilities re-export (subpath only)
└── zod.ts                    # Validation re-export (subpath only)
```

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

- **mongoose**: ^9.0.0 (MongoDB adapter)
- **sequelize**: ^6.0.0 (SQL adapter)
- **better-sqlite3**: ^12.6.2 (SQLite ecosystem support)
- **sqlite3**: ^5.1.7 (SQLite ecosystem support)
- **pg**: ^8.18.0 (PostgreSQL ecosystem support)

### Additional Drivers (not provided by Zacatl)

- **mysql2**: MySQL driver
- **pg-hstore**: PostgreSQL hstore support for Sequelize

Subpath imports are always available from `@sentzunhat/zacatl/third-party/*`.
For optional peers, install the corresponding package in your service.

## Import Patterns

### Main Package Imports

```typescript
// From main package - always available
import { container, injectable } from '@sentzunhat/zacatl/third-party';
import { z } from '@sentzunhat/zacatl/third-party';
```

### Subpath Imports

```typescript
// From subpath
import { mongoose } from '@sentzunhat/zacatl/third-party/mongoose';
import { Sequelize } from '@sentzunhat/zacatl/third-party/sequelize';
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
- ORM/database ecosystems are declared as optional peers (`mongoose`, `sequelize`, `better-sqlite3`, `sqlite3`, `pg`); install only what your project uses.
- SQL dialect extras (for example `mysql2`, `pg-hstore`) are not provided by Zacatl and must be installed by consumers when needed.

Use `npm run check:peers` to validate your environment before publishing or releasing.

## Related

- [Path Aliases](../utils/path-aliases.md)
- [ORM Overview](orm/overview.md)
- [ORM Architecture](orm/architecture.md)
