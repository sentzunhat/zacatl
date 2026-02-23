# Third-Party Dependencies

Zacatl re-exports commonly used third-party packages for convenience and provides ORM packages via subpath imports.

## Core Re-Exports

### tsyringe (Dependency Injection)

```typescript
import { container, injectable, inject } from "@sentzunhat/zacatl/third-party";

@injectable()
class UserService {
  constructor(private userRepo: UserRepository) {}
}

container.register("UserService", { useClass: UserService });
```

### Zod (Validation)

```typescript
import { z } from "@sentzunhat/zacatl/third-party";

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});
```

> **Roadmap**: Zod is the recommended validation library. Future versions will support **Yup** for migration paths and **optional validation** for performance-critical scenarios. See [Roadmap: Schema Validation Flexibility](../roadmap/index.md#schema-validation-flexibility-v0040--v010) for details.

## ORM Packages (Subpath Imports Only)

ORM packages are **NOT** exported from the main package to keep bundle sizes small. Use subpath imports instead:

See [../third-party/orm/overview.md](../third-party/orm/overview.md) for full usage and examples.

## Why Subpath Imports for ORMs?

**Tree-Shaking**: Only include ORMs you actually use

```typescript
// ✅ This only bundles Mongoose
import { mongoose } from "@sentzunhat/zacatl/third-party/mongoose";

// ❌ This would bundle ALL ORMs (if they were in main exports)
import { mongoose, Sequelize } from "@sentzunhat/zacatl";
```

**Bundle Size**:

- Mongoose: ~500KB
- Sequelize: ~300KB
- Only include what you need!

## Package Structure

```
src/third-party/
├── index.ts          # Re-exports tsyringe, zod (in main package)
├── mongoose.ts       # Mongoose re-export (subpath only)
├── sequelize.ts      # Sequelize re-export (subpath only)
├── tsyringe.ts       # DI container re-export
└── zod.ts            # Validation re-export
```

## Version Compatibility

Zacatl uses these third-party versions:

- **tsyringe**: ^4.10.0
- **zod**: ^4.3.6
- **mongoose**: ^9.0.0 (peer dependency)
- **sequelize**: ^6.0.0 (peer dependency)

## Import Patterns

### Main Package Imports

```typescript
// From main package - always available
import { container, injectable } from "@sentzunhat/zacatl/third-party";
import { z } from "@sentzunhat/zacatl/third-party";
```

### Subpath Imports

```typescript
// From subpath - install peer dependency first
import { mongoose } from "@sentzunhat/zacatl/third-party/mongoose";
import { Sequelize } from "@sentzunhat/zacatl/third-party/sequelize";
```

## Installing Peer Dependencies

```bash
# For Mongoose
npm install mongoose

# For Sequelize
npm install sequelize

# For specific SQL dialect
npm install pg pg-hstore      # PostgreSQL
npm install mysql2            # MySQL
npm install sqlite3           # SQLite
```

## Peer dependency policy (short)

- Zacatl treats ORMs and HTTP server runtimes as optional peers: we declare them in `peerDependencies` and mark them optional. This keeps installs small and lets apps choose versions.
- For local development and CI in this repository we keep those runtimes in `devDependencies` so tests and examples work out of the box.
- Install the runtimes your project needs (examples above). If you publish a consumer package, list required runtimes in your app's `dependencies` or `peerDependencies` as appropriate.
- Install the runtimes your project needs (examples above). If you publish a consumer package, list required runtimes in your app's `dependencies` or `peerDependencies` as appropriate.

Use `npm run check:peers` to detect mismatched or missing peer runtimes before publishing or releasing.

## Related

- [Path Aliases](../utils/path-aliases.md)
- [ORM Overview](orm/overview.md)
- [ORM Architecture](orm/architecture.md)
