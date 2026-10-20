# Repository Pattern API

Zacatl provides a separate abstract `BaseRepository` for each ORM. Import the
matching wrapper from its ORM subpath. The wrappers share CRUD behavior but do
not switch between ORMs at runtime.

## BaseRepository

Repository wrappers provide the common CRUD contract for **Mongoose**,
**Sequelize**, and **node:sqlite**. The node:sqlite model resolves lazily,
after its database connection is registered.

### Features

- **Lazy SQLite initialization** - construct repositories before the node:sqlite connection is registered; access the model only after service startup
- **Shared CRUD contract** - consistent methods across Mongoose, Sequelize, and node:sqlite
- **Direct model access** - use `this.model` for ORM-specific queries
- **Type-safe** - full TypeScript support with model type assertions
- **Mongoose-safe by default** - repository filters are treated as data, and updates are wrapped in `$set` unless you opt into `raw: true`

## Which class should I use?

- **Use the matching `BaseRepository`** for a repository with a fixed ORM:
  - `service/layers/infrastructure/repositories/mongoose/repository`
  - `service/layers/infrastructure/repositories/sequelize/repository`
  - `service/layers/infrastructure/repositories/nodesqlite/repository`
- A repository does not switch ORM based on config. Define a separate repository
  adapter for each ORM the application uses.
- **Use adapters directly** only for framework extension or low-level integrations.

## API Reference

```typescript
// Each ORM-specific abstract BaseRepository exposes its model and CRUD methods.
abstract class BaseRepository {
  readonly model: unknown;

  // CRUD operations
  findById(id: string): Promise<O | null>;
  findMany(filter?: Record<string, unknown>, options?: { limit?: number; offset?: number }): Promise<O[]>;
  create(entity: I): Promise<O>;
  update(id: string, update: Partial<I>, options?: { raw?: boolean }): Promise<O | null>;
  delete(id: string): Promise<O | null>;
  exists(id: string): Promise<boolean>;

  // Utilities
  toLean(input: unknown): O | null;
}
```

## Sequelize Example

```typescript
import { BaseRepository as BaseSequelizeRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/sequelize/repository';
import type { LeanDocument } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/types';
import type { ModelStatic } from '@sentzunhat/zacatl/third-party/databases/sequelize';
import { UserModel } from './models/user.model';

interface User
  extends LeanDocument<{
    email: string;
  }> {}

interface CreateUser {
  email: string;
}

class UserRepository extends BaseSequelizeRepository<UserModel, CreateUser, User> {
  constructor() {
    super({ name: 'User' });
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
import { BaseRepository as BaseMongooseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/mongoose/repository';
import type { LeanDocument } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/types';
import type { MongooseModel } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import { Schema } from 'mongoose';

interface User
  extends LeanDocument<{
    email: string;
  }> {}

interface CreateUser {
  email: string;
}

const userSchema = new Schema<User>({
  email: { type: String, required: true, unique: true },
});

class UserRepository extends BaseMongooseRepository<User, CreateUser, User> {
  constructor() {
    super({ name: 'User', schema: userSchema });
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

**All ORMs:**

```typescript
import type { LeanDocument } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/types';

type User = LeanDocument<{
  email: string;
  role: string;
}>;
```

> **Note:** `LeanDocument<T>` is the canonical shared output shape for repository results.

These base types automatically include `id`, `createdAt`, and `updatedAt` with correct types.

> **Note:** These types are exported from the repository types subpath shown
> above; Zacatl does not publish a package-root barrel.

## Configuration

### Mongoose Config

```typescript
type MongooseRepositoryConfig<D> = {
  readonly type?: ORMType.Mongoose;
  readonly name: string; // registered model name
  readonly schema: Schema<D>;
};
```

### Sequelize Config

```typescript
type SequelizeRepositoryConfig<D extends object> = {
  readonly type?: ORMType.Sequelize;
  readonly name: string; // registered Sequelize model name
};
```

## Dependency Injection

```typescript
import { NotFoundError } from '@sentzunhat/zacatl/error';
import { singleton, inject } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';

@singleton()
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

// Results are capped at 20 by default (maximum 1000). Page explicitly when needed.
async getUsersPage(page: number): Promise<User[]> {
  return this.userRepo.findMany({}, { limit: 50, offset: page * 50 });
}

// Find by ID
async getUserById(id: string): Promise<User | null> {
  return this.userRepo.findById(id);
}
```

### ORM-Specific Queries

```typescript
// After the ORM connection is ready, use the provider-specific model directly.
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
