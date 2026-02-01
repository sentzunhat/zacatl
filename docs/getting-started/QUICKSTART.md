# Zacatl Quick Start Guide

Welcome to Zacatl! This guide will help you get started with the framework quickly.

## Installation

```bash
npm install @sentzunhat/zacatl
```

## Quick Setup

### 1. Basic Microservice

```typescript
import Fastify from "fastify";
import { Service } from "@sentzunhat/zacatl";

const fastifyApp = Fastify();

const service = new Service({
  architecture: {
    application: {
      entryPoints: {
        rest: {
          hookHandlers: [],
          routeHandlers: [],
        },
      },
    },
    domain: { providers: [] },
    infrastructure: { repositories: [] },
    server: {
      name: "my-service",
      server: {
        type: "SERVER",
        vendor: "FASTIFY",
        instance: fastifyApp,
      },
      databases: [],
    },
  },
});

await service.start({ port: 9000 });
```

### 2. Creating a Repository

Zacatl supports multiple ORMs through the adapter pattern:

#### Using Mongoose

```typescript
import { BaseRepository } from "@sentzunhat/zacatl";
import { Schema } from "mongoose";

interface User {
  name: string;
  email: string;
}

interface CreateUser {
  name: string;
  email: string;
}

interface UserDTO {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

class UserRepository extends BaseRepository<User, CreateUser, UserDTO> {
  constructor() {
    super({
      type: "mongoose",
      name: "User",
      schema: userSchema,
    });
  }

  // Add custom methods
  async findByEmail(email: string): Promise<UserDTO | null> {
    const model = this.getMongooseModel();
    const user = await model.findOne({ email }).lean({ virtuals: true });
    return this.toLean(user);
  }
}
```

#### Using Sequelize

```typescript
import { BaseRepository } from "@sentzunhat/zacatl";
import { Model, DataTypes, Sequelize } from "sequelize";

class ProductModel extends Model {
  declare id: string;
  declare name: string;
  declare price: number;
}

const sequelize = new Sequelize("sqlite::memory:");

ProductModel.init(
  {
    id: { type: DataTypes.UUID, primaryKey: true },
    name: { type: DataTypes.STRING },
    price: { type: DataTypes.DECIMAL },
  },
  { sequelize, tableName: "products" },
);

class ProductRepository extends BaseRepository<
  ProductModel,
  CreateProduct,
  ProductDTO
> {
  constructor() {
    super({
      type: "sequelize",
      model: ProductModel,
    });
  }
}
```

### 3. Creating Route Handlers

```typescript
import { injectable } from "tsyringe";
import { PostRouteHandler } from "@sentzunhat/zacatl";

@injectable()
export class CreateUserHandler extends PostRouteHandler {
  constructor(private userRepo: UserRepository) {
    super({
      url: "/users",
      schema: {},
    });
  }

  async handler(request) {
    return this.userRepo.create(request.body);
  }
}
```

### 4. Register with MicroService

```typescript
const service = new Service({
  architecture: {
    application: {
      entryPoints: {
        rest: {
          hookHandlers: [],
          routeHandlers: [CreateUserHandler],
        },
      },
    },
    infrastructure: {
      repositories: [UserRepository],
    },
    domain: { providers: [] },
    server: {
      name: "user-service",
      server: {
        type: "SERVER",
        vendor: "FASTIFY",
        instance: fastifyApp,
      },
      databases: [
        {
          vendor: "MONGOOSE",
          instance: mongoose,
          connectionString: "mongodb://localhost/mydb",
        },
      ],
    },
  },
});

await service.start({ port: 9000 });
```

## Next Steps

- **[ORM Architecture](./ORM_ARCHITECTURE.md)** - Learn about multi-ORM support and creating custom adapters
- **[Configuration](./config/)** - Detailed configuration options
- **[Examples](../examples/)** - Complete working examples
- **[Migration Guide](./guides/MIGRATION.md)** - Upgrading from previous versions

## Key Concepts

### Layered Architecture

- **Application**: HTTP handlers, validation
- **Domain**: Business logic (pure, no dependencies)
- **Infrastructure**: Repositories, external services
- **Platform**: Service orchestration, DI setup

### Dependency Injection

All classes use `@injectable()` and constructor injection via tsyringe.

### Repository Pattern

- Extend `BaseRepository` for domain repositories
- Built-in adapters: Mongoose, Sequelize
- Create custom adapters for any ORM

### Error Handling

Use built-in error classes:

```typescript
import { BadRequestError, NotFoundError } from "@sentzunhat/zacatl";

throw new NotFoundError("User not found");
```

## Need Help?

- Check the [documentation](./)
