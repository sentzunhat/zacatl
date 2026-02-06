# Third-Party Dependencies

Zacatl re-exports commonly used third-party packages for convenience and provides ORM packages via subpath imports.

## Core Re-Exports

### tsyringe (Dependency Injection)

```typescript
import { container, injectable, inject } from "@zacatl/third-party";

@injectable()
class UserService {
  constructor(private userRepo: UserRepository) {}
}

container.register("UserService", { useClass: UserService });
```

### Zod (Validation)

```typescript
import { z } from "@zacatl/third-party";

const UserSchema = z.object({
  name: z.string(),
  email: z.string().email(),
});
```

## ORM Packages (Subpath Imports Only)

ORM packages are **NOT** exported from the main package to keep bundle sizes small. Use subpath imports instead:

### Mongoose (MongoDB)

```typescript
import { mongoose, Schema } from "@sentzunhat/zacatl/third-party/mongoose";

const userSchema = new Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", userSchema);
```

### Sequelize (SQL)

```typescript
import { Sequelize, DataTypes } from "@sentzunhat/zacatl/third-party/sequelize";

const sequelize = new Sequelize("sqlite::memory:");

const User = sequelize.define("User", {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
});
```

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
import { container, injectable } from "@zacatl/third-party";
import { z } from "@zacatl/third-party";
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

## Related

- [Path Aliases](path-aliases.md)
- [ORM Overview](orm/overview.md)
- [ORM Architecture](orm/architecture.md)
