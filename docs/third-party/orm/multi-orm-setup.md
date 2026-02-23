# Setting Up Multiple ORMs in Your Service

This guide shows how to configure MongoDB (Mongoose) and PostgreSQL/MySQL/SQLite (Sequelize) simultaneously in your service.

## Quick Example: Multi-Database Service

```typescript
import { Service, DatabaseVendor, ServerVendor, ServerType } from '@sentzunhat/zacatl';
import { ORMType } from '@sentzunhat/zacatl/service/layers/infrastructure';
import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';
import fastify from 'fastify';

// 1. Create your ORM instances
const mongooseInstance = new mongoose.Mongoose();
const sequelizeInstance = new Sequelize('postgres://user:pass@localhost:5432/mydb');

// 2. Create your repositories
import { UserRepository } from './repositories/user.repository'; // Uses Mongoose
import { ProductRepository } from './repositories/product.repository'; // Uses Sequelize

// 3. Configure service with BOTH ORMs
const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    infrastructure: {
      repositories: [
        UserRepository, // MongoDB repository
        ProductRepository, // PostgreSQL repository
      ],
    },
    domain: {
      services: [],
    },
  },
  platforms: {
    server: {
      name: 'my-multi-db-service',
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify(),
      },
      databases: [
        // MongoDB configuration
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: mongooseInstance,
          connectionString: 'mongodb://localhost:27017',
          onDatabaseConnected: async (db) => {
            console.log('✅ MongoDB connected');
          },
        },
        // PostgreSQL configuration
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelizeInstance,
          connectionString: 'postgres://user:pass@localhost:5432/mydb',
          onDatabaseConnected: async (db) => {
            console.log('✅ PostgreSQL connected');
            await (db as Sequelize).sync({ alter: true });
          },
        },
      ],
    },
  },
});

await service.start({ port: 3000 });
```

## Step-by-Step Setup

### 1. Install ORM Dependencies

```bash
# For MongoDB
npm install mongoose

# For PostgreSQL/MySQL/SQLite
npm install sequelize pg pg-hstore  # PostgreSQL
# OR
npm install sequelize mysql2        # MySQL
# OR
npm install sequelize sqlite3       # SQLite
```

### 2. Create Repository with Mongoose

```typescript
// repositories/user.repository.ts
import { BaseRepository, ORMType } from '@sentzunhat/zacatl/service/layers/infrastructure';
import { Schema } from 'mongoose';

interface UserDb {
  username: string;
  email: string;
  passwordHash: string;
}

interface UserInput {
  username: string;
  email: string;
  passwordHash: string;
}

interface UserOutput {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDb>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
  },
  { timestamps: true },
);

export class UserRepository extends BaseRepository<UserDb, UserInput, UserOutput> {
  constructor() {
    super({
      type: ORMType.Mongoose, // ✅ Use enum
      name: 'User',
      schema: UserSchema,
    });
  }

  // Custom method using Mongoose
  async findByEmail(email: string): Promise<UserOutput | null> {
    const user = await (this.model as MongooseModel<User>)
      .findOne({ email })
      .lean({ virtuals: true });
    return this.toLean(user);
  }
}
```

### 3. Create Repository with Sequelize

```typescript
// repositories/product.repository.ts
import { BaseRepository, ORMType } from '@sentzunhat/zacatl/service/layers/infrastructure';
import { DataTypes, Model, Sequelize } from 'sequelize';

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

// Define Sequelize model
class ProductModel extends Model {}

// Initialize model (you can do this in onDatabaseConnected callback)
export function initProductModel(sequelize: Sequelize) {
  ProductModel.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      price: { type: DataTypes.FLOAT, allowNull: false },
      stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    { sequelize, modelName: 'Product', timestamps: true },
  );
}

export class ProductRepository extends BaseRepository<ProductModel, ProductInput, ProductOutput> {
  constructor() {
    super({
      type: ORMType.Sequelize, // ✅ Use enum
      model: ProductModel,
    });
  }

  // Custom method using Sequelize
  async findInStock(): Promise<ProductOutput[]> {
    const products = await (this.model as ModelStatic<ProductModel>).findAll({
      where: { stock: { [Op.gt]: 0 } },
    });
    return products.map((p) => this.toLean(p)!);
  }
}
```

### 4. Configure Service

```typescript
// index.ts
import { Service, DatabaseVendor, ServerVendor, ServerType } from '@sentzunhat/zacatl';
import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';
import fastify from 'fastify';
import { UserRepository } from './repositories/user.repository';
import { ProductRepository, initProductModel } from './repositories/product.repository';

// Create ORM instances
const mongooseInstance = new mongoose.Mongoose();
const sequelizeInstance = new Sequelize({
  dialect: 'postgres',
  host: 'localhost',
  database: 'myapp',
  username: 'user',
  password: 'password',
});

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    infrastructure: {
      repositories: [
        UserRepository, // MongoDB
        ProductRepository, // PostgreSQL
      ],
    },
    domain: {
      services: [],
    },
  },
  platforms: {
    server: {
      name: 'my-service',
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify(),
      },
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: mongooseInstance,
          connectionString: process.env.MONGODB_URI || 'mongodb://localhost:27017',
          onDatabaseConnected: async (db) => {
            console.log('✅ MongoDB connected');
            // Optional: Run migrations, seeders, etc.
          },
        },
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelizeInstance,
          connectionString: process.env.DATABASE_URL || 'postgres://localhost:5432/myapp',
          onDatabaseConnected: async (db) => {
            console.log('✅ PostgreSQL connected');
            const seq = db as Sequelize;

            // Initialize models
            initProductModel(seq);

            // Sync database (creates tables)
            await seq.sync({ alter: true });
          },
        },
      ],
    },
  },
});

await service.start({ port: 3000 });
```

## Database Connection Flow

```
service.start()
    │
    ├─> server.configureDatabases()
    │   ├─> Connect to MongoDB (Mongoose)
    │   │   └─> Register Mongoose in DI container
    │   │
    │   └─> Connect to PostgreSQL (Sequelize)
    │       └─> Register Sequelize in DI container
    │
    ├─> infrastructure.start()
    │   ├─> Register UserRepository (uses Mongoose from container)
    │   └─> Register ProductRepository (uses Sequelize from container)
    │
    └─> domain.start()
        └─> Register providers
```

## Real-World Patterns

### Pattern 1: MongoDB for Users + PostgreSQL for Products

```typescript
const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    infrastructure: {
      repositories: [
        UserRepository, // Mongoose → MongoDB
        SessionRepository, // Mongoose → MongoDB
        ProductRepository, // Sequelize → PostgreSQL
        OrderRepository, // Sequelize → PostgreSQL
      ],
    },
    // ...
  },
});
```

**Why?** Users/sessions benefit from MongoDB's flexibility, while products/orders need PostgreSQL's ACID transactions.

### Pattern 2: Multiple SQLite Databases (Dev/Testing)

```typescript
const userDb = new Sequelize({ dialect: 'sqlite', storage: './users.db' });
const productDb = new Sequelize({
  dialect: 'sqlite',
  storage: './products.db',
});

const service = new Service({
  type: ServiceType.SERVER,
  platforms: {
    server: {
      databases: [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: userDb,
          connectionString: '',
        },
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: productDb,
          connectionString: '',
        },
      ],
    },
  },
});
```

### Pattern 3: MongoDB Only

```typescript
const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    infrastructure: {
      repositories: [UserRepository, ProductRepository], // Both use Mongoose
    },
  },
  platforms: {
    server: {
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: new mongoose.Mongoose(),
          connectionString: 'mongodb://localhost:27017',
        },
      ],
    },
  },
});
```

### Pattern 4: PostgreSQL Only

```typescript
const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    infrastructure: {
      repositories: [UserRepository, ProductRepository], // Both use Sequelize
    },
  },
  platforms: {
    server: {
      databases: [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: new Sequelize('postgres://localhost:5432/myapp'),
          connectionString: 'postgres://localhost:5432/myapp',
        },
      ],
    },
  },
});
```

## Environment-Based Configuration

```typescript
// config.ts
import mongoose from 'mongoose';
import { Sequelize } from 'sequelize';

export const getDatabaseConfig = () => {
  const env = process.env.NODE_ENV || 'development';

  if (env === 'production') {
    return {
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: new mongoose.Mongoose(),
          connectionString: process.env.MONGODB_URI!,
        },
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: new Sequelize(process.env.DATABASE_URL!),
          connectionString: process.env.DATABASE_URL!,
        },
      ],
    };
  }

  // Development/Test: Use SQLite for speed
  return {
    databases: [
      {
        vendor: DatabaseVendor.SEQUELIZE,
        instance: new Sequelize({ dialect: 'sqlite', storage: ':memory:' }),
        connectionString: '',
      },
    ],
  };
};
```

## Available ORM Types (Enum)

```typescript
import { ORMType } from '@sentzunhat/zacatl/service/layers/infrastructure';

// Use enum for type safety
ORMType.Mongoose; // For MongoDB
ORMType.Sequelize; // For PostgreSQL, MySQL, SQLite, MSSQL
```

## Database Vendors (Enum)

```typescript
import { DatabaseVendor } from '@sentzunhat/zacatl';

DatabaseVendor.MONGOOSE; // MongoDB
DatabaseVendor.SEQUELIZE; // SQL databases
```

## Key Points

✅ **Multiple ORMs**: Mix Mongoose and Sequelize in the same service
✅ **Type-safe**: Use `ORMType` enum instead of strings
✅ **Automatic DI**: ORMs registered in dependency injection container
✅ **Connection callbacks**: Use `onDatabaseConnected` for initialization
✅ **Unified interface**: All repositories have same methods regardless of ORM
✅ **Environment-aware**: Easy to switch databases based on environment

## Troubleshooting

**Q: My repository can't connect to the database**
A: Ensure the database is configured in `server.databases` array before repositories are registered.

**Q: Can I use the same ORM for multiple databases?**
A: Yes! Create multiple Sequelize instances with different connection strings.

**Q: Do I need a server to use repositories?**
A: No, but databases won't auto-connect. You'll need to connect manually and register in the DI container.
