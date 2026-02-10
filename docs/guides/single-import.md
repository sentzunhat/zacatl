# Single Import Guide - @sentzunhat/zacatl v0.0.20

## Import Everything from One Package

With v0.0.20, you can import **everything** from `@sentzunhat/zacatl`. No need to install or import from multiple packages!

---

## Before (Multiple Packages)

```typescript
// ❌ OLD WAY - Multiple imports from different packages
import { Service } from "@sentzunhat/zacatl";
import { Schema, Model, Types } from "mongoose";
import { DataTypes, Sequelize, Model as SequelizeModel } from "sequelize";
import { container } from "tsyringe";
import { z } from "zod";
```

## After (Single Package)

```typescript
// ✅ NEW WAY - Everything from one place!
import {
  Service,
  Schema,
  Model,
  Types,
  DataTypes,
  Sequelize,
  SequelizeModelClass,
  container,
  z,
  ORMType,
  BaseRepository,
} from "@sentzunhat/zacatl";
```

---

## Complete Import Reference

### Framework Core

```typescript
import {
  // Service
  Service,
  ConfigService,

  // Server
  ServerType,
  ServerVendor,
  DatabaseVendor,
  HandlersType,
  ConfigServer,

  // Infrastructure
  BaseRepository,
  ORMType,
  Infrastructure,

  // Dependency Injection
  container,
  DependencyContainer,

  // Errors
  CustomError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,

  // Localization
  Localization,

  // Validation
  z,
  ZodSchema,
  ZodType,
  ZodError,
} from "@sentzunhat/zacatl";
```

### Mongoose (MongoDB)

```typescript
import {
  // Classes
  Schema,
  Model,
  Types,
  connect,
  connection,
  createConnection,

  // Types
  Document,
  SchemaDefinition,
  SchemaOptions,
  SchemaTypeOptions,
  Connection,
  Mongoose,
  ObjectId,
  UpdateQuery,
  QueryOptions,
  PopulateOptions,
  HydratedDocument,
  InferSchemaType,
} from "@sentzunhat/zacatl";
```

### Sequelize (SQL Databases)

```typescript
import {
  // Classes
  DataTypes,
  Sequelize,
  SequelizeModelClass,

  // Types
  ModelStatic,
  QueryInterface,
  Transaction,
  SequelizeOptions,
  ModelAttributes,
  ModelOptions,
  FindOptions,
  CreateOptions,
  UpdateOptions,
  DestroyOptions,
  WhereOptions,
  Order,
  Includeable,
} from "@sentzunhat/zacatl";
```

---

## Real-World Examples

### Example 1: Mongoose Repository (Single Import)

```typescript
import {
  BaseRepository,
  ORMType,
  Schema,
  InferSchemaType,
} from "@sentzunhat/zacatl";

// Define schema
const UserSchema = new Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

// Infer types
type UserDb = InferSchemaType<typeof UserSchema>;
interface UserInput extends Omit<UserDb, "timestamps"> {}
interface UserOutput extends UserDb {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Create repository
export class UserRepository extends BaseRepository<
  UserDb,
  UserInput,
  UserOutput
> {
  constructor() {
    super({
      type: ORMType.Mongoose,
      name: "User",
      schema: UserSchema,
    });
  }
}
```

### Example 2: Sequelize Repository (Single Import)

```typescript
import {
  BaseRepository,
  ORMType,
  DataTypes,
  Sequelize,
  SequelizeModelClass,
  ModelAttributes,
} from "@sentzunhat/zacatl";

// Define Sequelize instance
const sequelize = new Sequelize({
  dialect: "postgres",
  host: "localhost",
  database: "myapp",
});

// Define model
class ProductModel extends SequelizeModelClass {}

const attributes: ModelAttributes = {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.FLOAT, allowNull: false },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
};

ProductModel.init(attributes, { sequelize, modelName: "Product" });

// Define types
interface ProductInput {
  name: string;
  price: number;
  stock: number;
}

interface ProductOutput {
  id: string;
  name: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

// Create repository
export class ProductRepository extends BaseRepository<
  ProductModel,
  ProductInput,
  ProductOutput
> {
  constructor() {
    super({
      type: ORMType.Sequelize,
      model: ProductModel,
    });
  }
}
```

### Example 3: Complete Service (Single Import)

```typescript
import {
  Service,
  ServerType,
  ServerVendor,
  DatabaseVendor,
  Schema,
  Sequelize,
  container,
} from "@sentzunhat/zacatl";
import fastify from "fastify"; // Only external package you need!

import { UserRepository } from "./repositories/user.repository";
import { ProductRepository } from "./repositories/product.repository";

// Create ORM instances (also from single import!)
import { connect, Sequelize as SequelizeClass } from "@sentzunhat/zacatl";

const mongooseInstance = await connect("mongodb://localhost:27017/myapp");
const sequelizeInstance = new SequelizeClass("postgres://localhost:5432/myapp");

// Create service
const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    infrastructure: {
      repositories: [UserRepository, ProductRepository],
    },
    domain: {
      services: [],
    },
  },
  platforms: {
    server: {
      name: "my-service",
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify(),
      },
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: mongooseInstance,
          connectionString: "mongodb://localhost:27017/myapp",
        },
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelizeInstance,
          connectionString: "postgres://localhost:5432/myapp",
        },
      ],
    },
  },
});

await service.start({ port: 3000 });
```

### Example 4: Validation with Zod (Single Import)

```typescript
import { z, BaseRepository, ORMType, Schema } from "@sentzunhat/zacatl";

// Create Zod schema for validation
const CreateUserSchema = z.object({
  username: z.string().min(3).max(20),
  email: z.string().email(),
  password: z.string().min(8),
});

type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Mongoose schema
const UserSchema = new Schema(
  {
    username: String,
    email: String,
    passwordHash: String,
  },
  { timestamps: true },
);

// Repository with validation
export class UserRepository extends BaseRepository<any, any, any> {
  constructor() {
    super({
      type: ORMType.Mongoose,
      name: "User",
      schema: UserSchema,
    });
  }

  async createValidated(input: unknown) {
    // Validate with Zod
    const validated = CreateUserSchema.parse(input);

    // Create user
    return this.create({
      username: validated.username,
      email: validated.email,
      passwordHash: await this.hashPassword(validated.password),
    });
  }

  private async hashPassword(password: string): Promise<string> {
    // Hash implementation
    return password; // Placeholder
  }
}
```

### Example 5: Dependency Injection (Single Import)

```typescript
import { container, Service, BaseRepository } from "@sentzunhat/zacatl";

import { UserRepository } from "./repositories/user.repository";

// Start service (auto-registers repositories)
const service = new Service({
  architecture: {
    infrastructure: {
      repositories: [UserRepository],
    },
    domain: { providers: [] },
  },
});

await service.start();

// Get repository from DI container
const userRepo = container.resolve(UserRepository);

const user = await userRepo.create({
  username: "john",
  email: "john@example.com",
  passwordHash: "hashed",
});
```

---

## Package.json Comparison

### Before (Multiple Dependencies)

```json
{
  "dependencies": {
    "@sentzunhat/zacatl": "0.0.20",
    "mongoose": "^9.0.1",
    "sequelize": "^6.37.7",
    "tsyringe": "^4.10.0",
    "zod": "^4.3.6",
    "fastify": "^5.6.2"
  }
}
```

### After (Minimal Dependencies)

```json
{
  "dependencies": {
    "@sentzunhat/zacatl": "0.0.20",
    "fastify": "^5.6.2" // Only if using Fastify server
  }
}
```

**Everything else is bundled in `@sentzunhat/zacatl`!** 🎉

---

## Benefits

### ✅ Fewer Dependencies

- Install only `@sentzunhat/zacatl`
- No need to manage versions of mongoose, sequelize, zod, tsyringe separately
- Smaller `package.json`

### ✅ Version Compatibility

- Framework ensures ORM versions are compatible
- No version conflicts between packages
- Tested combinations

### ✅ Cleaner Imports

- Single import statement
- No confusion about which package exports what
- Better IDE autocomplete

### ✅ Smaller Bundle (Potentially)

- Shared dependencies
- No duplicate packages
- Tree-shaking still works

### ✅ Better DX (Developer Experience)

- Less to install
- Less to learn
- Faster onboarding

---

## Migration from Multiple Imports

### Quick Find & Replace

1. **Find:** `import { Schema, Model } from "mongoose"`
   **Replace:** `import { Schema, Model } from "@sentzunhat/zacatl"`

2. **Find:** `import { DataTypes, Sequelize } from "sequelize"`
   **Replace:** `import { DataTypes, Sequelize } from "@sentzunhat/zacatl"`

3. **Find:** `import { container } from "tsyringe"`
   **Replace:** `import { container } from "@sentzunhat/zacatl"`

4. **Find:** `import { z } from "zod"`
   **Replace:** `import { z } from "@sentzunhat/zacatl"`

5. **Uninstall unused packages:**
   ```bash
   npm uninstall mongoose sequelize tsyringe zod
   ```

---

## What's Re-exported

| Package     | Re-exported in @sentzunhat/zacatl                           |
| ----------- | ----------------------------------------------------------- |
| `mongoose`  | ✅ Schema, Model, Types, connect, connection, and all types |
| `sequelize` | ✅ Sequelize, DataTypes, Model class, and all types         |
| `tsyringe`  | ✅ container, DependencyContainer                           |
| `zod`       | ✅ z, ZodSchema, ZodType, ZodError                          |
| `fastify`   | ❌ Import separately (many server options)                  |
| `express`   | ❌ Import separately (many server options)                  |

---

## Advanced Usage

### Type-Safe Generic Repository

```typescript
import {
  BaseRepository,
  ORMType,
  Schema,
  InferSchemaType,
  z,
} from "@sentzunhat/zacatl";

// Everything from one import!
const UserSchema = new Schema(
  {
    username: String,
    email: String,
  },
  { timestamps: true },
);

type UserDb = InferSchemaType<typeof UserSchema>;

const UserValidator = z.object({
  username: z.string(),
  email: z.string().email(),
});

export class UserRepository extends BaseRepository<UserDb, any, any> {
  constructor() {
    super({
      type: ORMType.Mongoose,
      name: "User",
      schema: UserSchema,
    });
  }

  async createValidated(input: unknown) {
    const validated = UserValidator.parse(input);
    return this.create(validated);
  }
}
```

---

## Summary

**One package to rule them all!**

```typescript
import {
  // Framework
  Service,
  BaseRepository,
  ORMType,

  // MongoDB
  Schema,
  Model,
  Types,

  // SQL
  DataTypes,
  Sequelize,

  // Utilities
  container,
  z,
} from "@sentzunhat/zacatl";
```

**No more:**

- ❌ `npm install mongoose sequelize tsyringe zod`
- ❌ Multiple import statements
- ❌ Version compatibility issues
- ❌ Package management overhead

**Just:**

- ✅ `npm install @sentzunhat/zacatl`
- ✅ Single import
- ✅ Everything works together
- ✅ Better DX

🎉 **Enjoy the cleaner codebase!**
