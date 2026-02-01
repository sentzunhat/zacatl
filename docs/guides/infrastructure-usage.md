# Infrastructure Usage Guide

## Modular ORM System

Your service supports **multiple ORMs simultaneously**. You can mix Mongoose (MongoDB), Sequelize (PostgreSQL/MySQL/SQLite), or any future ORM in the same application.

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
import { BaseRepository } from "@/service/architecture/infrastructure";
import { Schema } from "mongoose";

const UserSchema = new Schema<UserDb>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timestamps: true },
);

export class UserRepository extends BaseRepository<
  UserDb,
  UserInput,
  UserOutput
> {
  constructor() {
    super({
      type: "mongoose", // ← Choose Mongoose
      name: "User",
      schema: UserSchema,
    });
  }

  // Optional: Add custom methods
  async findByEmail(email: string): Promise<UserOutput | null> {
    const user = await this.getMongooseModel().findOne({ email }).lean();
    return this.toLean(user);
  }
}
```

#### Option B: Using Sequelize (PostgreSQL/MySQL/SQLite)

```typescript
import { BaseRepository } from "@/service/architecture/infrastructure";
import { DataTypes, Model, Sequelize } from "sequelize";

// Sequelize model definition
class ProductModel extends Model {}

const sequelize = new Sequelize("sqlite::memory:");

ProductModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    stock: { type: DataTypes.INTEGER, allowNull: false },
  },
  { sequelize, modelName: "Product", timestamps: true },
);

export class ProductRepository extends BaseRepository<
  ProductModel,
  ProductInput,
  ProductOutput
> {
  constructor() {
    super({
      type: "sequelize", // ← Choose Sequelize
      model: ProductModel,
    });
  }

  // Optional: Add custom methods
  async findInStock(): Promise<ProductOutput[]> {
    const products = await this.getSequelizeModel().findAll({
      where: { stock: { [Op.gt]: 0 } },
    });
    return products.map((p) => this.toLean(p)!);
  }
}
```

### 3. Register in Service

```typescript
import { Service } from "@/service";
import { UserRepository } from "./repositories/user.repository";
import { ProductRepository } from "./repositories/product.repository";

const service = new Service({
  architecture: {
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
import { container } from "tsyringe";
import { UserRepository } from "./repositories/user.repository";
import { ProductRepository } from "./repositories/product.repository";

// Get repository instances from DI container
const userRepo = container.resolve(UserRepository);
const productRepo = container.resolve(ProductRepository);

// Use unified interface regardless of ORM
const user = await userRepo.create({
  username: "john",
  email: "john@example.com",
  password: "hashed",
});

const product = await productRepo.create({
  name: "Widget",
  price: 29.99,
  stock: 100,
});

// Both repos have same methods
const foundUser = await userRepo.findById(user.id);
const foundProduct = await productRepo.findById(product.id);
```

## Mix Multiple ORMs in One Service

```typescript
const service = new Service({
  architecture: {
    infrastructure: {
      repositories: [
        // MongoDB repositories
        UserRepository,
        SessionRepository,

        // PostgreSQL repositories
        ProductRepository,
        OrderRepository,

        // SQLite repositories (same Sequelize adapter!)
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

| Adapter          | Database                         | Status    |
| ---------------- | -------------------------------- | --------- |
| MongooseAdapter  | MongoDB                          | ✅ Ready  |
| SequelizeAdapter | PostgreSQL, MySQL, SQLite, MSSQL | ✅ Ready  |
| PrismaAdapter    | Multi-database                   | 🔜 Future |
| TypeORMAdapter   | Multi-database                   | 🔜 Future |

## Creating Custom Adapters

To add support for a new ORM:

1. Create adapter in `src/service/architecture/infrastructure/orm/adapters/`
2. Implement `ORMAdapter<D, I, O>` interface
3. Add type to `BaseRepositoryConfig`
4. Update BaseRepository constructor factory

That's it! The modular system handles the rest.
