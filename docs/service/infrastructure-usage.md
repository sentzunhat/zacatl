# Infrastructure Usage Guide

> Import from the infrastructure subpath:
>
> ```typescript
> import { BaseRepository, ORMType } from '@sentzunhat/zacatl/service';
> ```

## Modular ORM System

Your service supports **multiple ORMs simultaneously**. You can mix Mongoose (MongoDB), Sequelize (PostgreSQL/MySQL/SQLite), and Node.js SQLite (`node:sqlite`) in the same application.

## Which repository class should I use?

- **Use `BaseRepository`** for repositories that may target Mongoose, Sequelize, or node:sqlite with the shared CRUD interface.
- **Use ORM-specific abstract repositories** when your repository is tied to one ORM:
  - `AbstractMongooseRepository`
  - `AbstractSequelizeRepository`
  - `AbstractNodeSqliteRepository`
- **Use adapters directly** only for framework extension or low-level advanced integrations. For normal app repositories, prefer `BaseRepository` or ORM-specific abstract repositories.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│  Service Configuration                              │
│  └─> Infrastructure                                 │
│      └─> repositories: [UserRepo, ProductRepo]      │
└─────────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────┐
│  Your Repositories (Pick Your ORM)                  │
│  ┌──────────────────┐  ┌───────────────────┐        │
│  │ UserRepository   │  │ ProductRepository │        │
│  │ extends Base     │  │ extends Base      │        │
│  │ (Mongoose)       │  │ (Sequelize)       │        │
│  └─────────┬────────┘  └────────┬──────────┘        │
└────────────┼─────────────────────┼───────────────────┘
             │                     │
             ▼                     ▼
┌────────────────────────────────────────────────────┐
│  BaseRepository (Factory Pattern)                  │
│  • Automatically selects correct ORM adapter       │
│  • Provides unified CRUD interface                 │
│  • Type-safe repository methods                    │
└────────────┬───────────────────────────────────────┘
             │
      ┌──────┴──────┐
      ▼             ▼
┌─────────────┐ ┌──────────────┐
│ Mongoose    │ │ Sequelize    │
│ Adapter     │ │ Adapter      │
└─────────────┘ └──────────────┘
```

## Step-by-Step Usage

### 1. Define Your Entity Types

```typescript
// User entity for MongoDB
interface UserDb {
  username: string;
  email: string;
  password: string;
}

interface UserInput {
  username: string;
  email: string;
  password: string;
}

interface UserOutput {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product entity for PostgreSQL
interface ProductDb {
  id: number;
  name: string;
  price: number;
  stock: number;
}

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
```

### 2. Create Your Repositories

#### Option A: Using Mongoose (MongoDB)

```typescript
import { BaseRepository, ORMType } from '@sentzunhat/zacatl/service';
import { Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';

const UserSchema = new Schema<UserDb>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

export class UserRepository extends BaseRepository<UserDb, UserInput, UserOutput> {
  constructor() {
    super({
      type: ORMType.Mongoose,
      name: 'User',
      schema: UserSchema,
    });
  }

  // Optional: Add custom methods
  async findByEmail(email: string): Promise<UserOutput | null> {
    const user = await (this.model as MongooseModel<User>).findOne({ email }).lean();
    return this.toLean(user);
  }
}
```

#### Option B: Using Native SQLite (Node 22.5+ — No External Package)

Uses the built-in `node:sqlite` module. No external package needed.

For repository-style CRUD with normalized output, use `AbstractNodeSqliteRepository`.

**Service config:**

```typescript
import { DatabaseVendor } from '@sentzunhat/zacatl/service';

databases: [{ vendor: DatabaseVendor.SQLITE, connection: { url: 'app.db' } }];
// ':memory:' is also valid for in-memory databases
```

**Raw SQL access (inject `DatabaseServer`):**

```typescript
import { DatabaseServer, DatabaseVendor } from '@sentzunhat/zacatl/service';
import { singleton, inject } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';
import type { DatabaseSync } from 'node:sqlite';

@singleton()
export class ItemRepository {
  private readonly db: DatabaseSync;

  constructor(@inject(DatabaseServer) databaseServer: DatabaseServer) {
    this.db = databaseServer.getAdapter(DatabaseVendor.SQLITE)!.getDatabase() as DatabaseSync;
  }

  findById(id: string) {
    return this.db.prepare('SELECT * FROM items WHERE id = ?').get(id);
  }
}
```

> **Note:** Defensive mode is enabled by default. Always use prepared statements — never string-interpolate user input into SQL.

---

#### Option C: Using Sequelize (PostgreSQL/MySQL/SQLite via ORM)

```typescript
import { BaseRepository, ORMType } from '@sentzunhat/zacatl/service';
import { DataTypes, Model, Sequelize } from '@sentzunhat/zacatl/third-party/databases/sequelize';

// Sequelize model definition
class ProductModel extends Model {}

const sequelize = new Sequelize('sqlite::memory:');

ProductModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: 'Product', timestamps: true },
);

export class ProductRepository extends BaseRepository<ProductModel, ProductInput, ProductOutput> {
  constructor() {
    super({
      type: ORMType.Sequelize,
      name: 'Product',
    });
  }

  // Optional: Add custom methods
  async findInStock(): Promise<ProductOutput[]> {
    const products = await (this.model as ModelStatic<ProductModel>).findAll({
      where: { stock: { [Op.gt]: 0 } },
    });
    return products.map((p) => this.toLean(p)!);
  }
}
```

### 3. Register in Service

```typescript
import { Service, ServiceType } from '@sentzunhat/zacatl/service';
import { UserRepository } from './repositories/user.repository';
import { ProductRepository } from './repositories/product.repository';

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    infrastructure: {
      repositories: [
        UserRepository, // Uses Mongoose (MongoDB)
        ProductRepository, // Uses Sequelize (PostgreSQL)
      ],
    },
  },
});

await service.start();
```

### 4. Use in Your Application

```typescript
import { container } from 'tsyringe';
import { UserRepository } from './repositories/user.repository';
import { ProductRepository } from './repositories/product.repository';

// Get repository instances from DI container
const userRepo = container.resolve(UserRepository);
const productRepo = container.resolve(ProductRepository);

// Use unified interface regardless of ORM
const user = await userRepo.create({
  username: 'john',
  email: 'john@example.com',
  password: 'hashed',
});

const product = await productRepo.create({
  name: 'Widget',
  price: 29.99,
  stock: 100,
});

// Both repos have same methods
const foundUser = await userRepo.findById(user.id);
const foundProduct = await productRepo.findById(product.id);
```

## Mix Multiple ORMs in One Service

```typescript
import { Service, ServiceType } from '@sentzunhat/zacatl/service';

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    infrastructure: {
      repositories: [
        // MongoDB repositories
        UserRepository,
        SessionRepository,

        // PostgreSQL repositories
        ProductRepository,
        OrderRepository,

        // SQLite repositories (native node:sqlite repositories)
        CacheRepository,
      ],
    },
  },
});
```

## Benefits

✅ **Choose the right tool**: Use MongoDB for users, PostgreSQL for products
✅ **No coupling**: Each repository independently chooses its ORM
✅ **Unified interface**: All repos have same CRUD methods
✅ **Type-safe**: Full TypeScript support
✅ **Dependency injection**: Automatic registration
✅ **Easy testing**: Mock repositories or swap ORMs
✅ **Future-proof**: Add Prisma, TypeORM, etc. by creating new adapters

## Available ORM Adapters

| Adapter           | Database                         | Status    |
| ----------------- | -------------------------------- | --------- |
| MongooseAdapter   | MongoDB                          | ✅ Ready  |
| SequelizeAdapter  | PostgreSQL, MySQL, SQLite, MSSQL | ✅ Ready  |
| NodeSqliteAdapter | SQLite (`node:sqlite`, Node 22.5+) | ✅ Ready  |
| PrismaAdapter     | Multi-database                   | 🔜 Future |
| TypeORMAdapter    | Multi-database                   | 🔜 Future |

## Creating Custom Adapters

To add support for a new ORM:

1. Create adapter in `src/service/layers/infrastructure/orm/adapters/`
2. Implement `ORMAdapter<D, I, O>` interface
3. Add type to `BaseRepositoryConfig`
4. Update BaseRepository constructor factory

That's it! The modular system handles the rest.
