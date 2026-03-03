# Repository Pattern API

Multi-ORM repository implementation supporting Mongoose and Sequelize with unified interface.

## BaseRepository

Abstract base class providing ORM-agnostic data access with immediate model availability.

### Features

- **Sync initialization** - models ready immediately after construction
- **Multi-ORM support** - unified interface for Mongoose and Sequelize
- **Direct model access** - use `this.model` for ORM-specific queries
- **Type-safe** - full TypeScript support with model type assertions

## API Reference

```typescript
export abstract class BaseRepository<D, I, O> {
  // ORM model instance - immediate access
  readonly model: RepositoryModel<D>;

  // CRUD operations
  findById(id: string): Promise<O | null>;
  findMany(filter?: Record<string, unknown>): Promise<O[]>;
  create(entity: I): Promise<O>;
  update(id: string, update: Partial<I>): Promise<O | null>;
  delete(id: string): Promise<O | null>;
  exists(id: string): Promise<boolean>;

  // Utilities
  toLean(input: unknown): O | null;
  isMongoose(): boolean;
  isSequelize(): boolean;
}
```

## Sequelize Example

```typescript
import { BaseRepository, ORMType, LeanDocument } from '@sentzunhat/zacatl';
import { ModelStatic } from '@sentzunhat/zacatl/third-party/sequelize';
import { UserModel } from './models/user.model';

interface User
  extends LeanDocument<{
    email: string;
  }> {}

interface CreateUser {
  email: string;
}

class UserRepository extends BaseRepository<UserModel, CreateUser, User> {
  constructor() {
    super({
      type: ORMType.Sequelize,
      model: UserModel,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await (this.model as ModelStatic<UserModel>).findOne({
      where: { email },
    });
    return this.toLean(user);
  }
}
```

## Mongoose Example

```typescript
import { BaseRepository, ORMType, LeanWithMeta } from '@sentzunhat/zacatl';
import { MongooseModel } from '@sentzunhat/zacatl/third-party/mongoose';
import { Schema } from 'mongoose';

interface User
  extends LeanWithMeta<{
    email: string;
  }> {}

interface CreateUser {
  email: string;
}

const userSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
});

class UserRepository extends BaseRepository<User, CreateUser, User> {
  constructor() {
    super({
      type: ORMType.Mongoose,
      name: 'User',
      schema: userSchema,
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await (this.model as MongooseModel<User>).findOne({ email }).lean<User>().exec();
    return this.toLean(user);
  }
}
```

## Type Parameters

| Parameter | Description                                                       |
| --------- | ----------------------------------------------------------------- |
| `D`       | Database model type (Mongoose schema or Sequelize model instance) |
| `I`       | Input type for create/update operations                           |
| `O`       | Output type for query results (after toLean normalization)        |

## Output Type Requirements

All repository methods (`create`, `findById`, `update`, `delete`, `findMany`) return normalized lean documents. **Output types must always include these fields**, as they are automatically added by `toLean()`:

```typescript
interface OutputType {
  id: string; // ← Required: normalized from database id/_id
  createdAt: Date; // ← Required: ISO string converted to Date
  updatedAt: Date; // ← Required: ISO string converted to Date
  // ... your custom fields
}
```

### Using Base Types (Recommended)

Use the library's base types to enforce this contract:

**Mongoose:**

```typescript
import { LeanWithMeta } from '@sentzunhat/zacatl';

type User = LeanWithMeta<{
  email: string;
  role: string;
}>;
```

**Sequelize:**

```typescript
import { LeanDocument } from '@sentzunhat/zacatl';

type User = LeanDocument<{
  email: string;
  role: string;
}>;
```

These base types automatically include `id`, `createdAt`, and `updatedAt` with correct types.

> **Note**: These types are re-exported from `@sentzunhat/zacatl` for convenience. They're defined in the repository layer but available at the top level of the library.

## Configuration

### Mongoose Config

```typescript
type MongooseRepositoryConfig<D> = {
  readonly type: ORMType.Mongoose;
  readonly name?: string; // model name, auto-generated if omitted
  readonly schema: Schema<D>;
};
```

### Sequelize Config

```typescript
type SequelizeRepositoryConfig<D extends object> = {
  readonly type: ORMType.Sequelize;
  readonly model: ModelStatic<SequelizeModel<D>>;
};
```

## Dependency Injection

```typescript
import { service, NotFoundError } from '@sentzunhat/zacatl';
import { singleton } from 'tsyringe';

@singleton()
@service()
class UserService {
  constructor(private userRepo: UserRepository) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new NotFoundError({ message: 'User not found' });
    return user;
  }
}
```

## Model Access Patterns

### Standard Repository Queries

```typescript
// Find all documents
async getAllUsers(): Promise<User[]> {
  return this.userRepo.findMany();
}

// Find with filter
async getActiveUsers(): Promise<User[]> {
  return this.userRepo.findMany({ isActive: true });
}

// Find by ID
async getUserById(id: string): Promise<User | null> {
  return this.userRepo.findById(id);
}
```

### ORM-Specific Queries

```typescript
// Sequelize
const active = await(this.model as ModelStatic<UserModel>).findAll({
  where: { isActive: true },
});

// Mongoose
const byRole = await(this.model as MongooseModel<User>)
  .find({ role })
  .lean<User[]>()
  .exec();
```

---

**Complete API Reference**: [← Back to API](./README.md)
