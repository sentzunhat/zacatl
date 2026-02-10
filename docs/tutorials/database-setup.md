# Database Setup

Connect Zacatl to Sequelize or Mongoose.

## Sequelize (SQL)

### Install

```bash
npm install sequelize pg pg-hstore
```

### Setup

```typescript
import { Sequelize } from "sequelize";

const sequelize = new Sequelize("postgresql://localhost:5432/mydb", {
  logging: false,
});

await sequelize.authenticate();
```

### Define Model

```typescript
import { DataTypes } from "sequelize";

const User = sequelize.define("User", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  email: DataTypes.STRING,
});

await sequelize.sync();
```

### Create Repository

```typescript
import { IRepository } from "@sentzunhat/zacatl";

class UserRepository implements IRepository<User> {
  async findById(id: string) {
    return await User.findByPk(id);
  }

  async findMany() {
    return await User.findAll();
  }

  async create(data: any) {
    return await User.create(data);
  }

  async update(id: string, data: any) {
    await User.update(data, { where: { id } });
  }

  async delete(id: string) {
    await User.destroy({ where: { id } });
  }

  async exists(id: string) {
    return (await User.count({ where: { id } })) > 0;
  }
}
```

### Register

```typescript
import {
  Service,
  ServiceType,
  ServerType,
  ServerVendor,
  DatabaseVendor,
} from "@sentzunhat/zacatl";

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    // ... other config
    infrastructure: {
      repositories: [UserRepository],
    },
  },
  platforms: {
    server: {
      name: "my-service",
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
      },
      databases: [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelize,
        },
      ],
    },
  },
});
```

## Mongoose (MongoDB)

### Install

```bash
npm install mongoose
```

### Setup

```typescript
import mongoose from "mongoose";

await mongoose.connect("mongodb://localhost:27017/mydb");
```

### Define Schema

```typescript
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const User = mongoose.model("User", userSchema);
```

### Create Repository

```typescript
class UserRepository implements IRepository<User> {
  async findById(id: string) {
    return await User.findById(id);
  }

  async findMany() {
    return await User.find();
  }

  async create(data: any) {
    return await User.create(data);
  }

  async update(id: string, data: any) {
    await User.findByIdAndUpdate(id, data);
  }

  async delete(id: string) {
    await User.findByIdAndDelete(id);
  }

  async exists(id: string) {
    return await User.exists({ _id: id });
  }
}
```

### Register

```typescript
import { Service, ServiceType, DatabaseVendor } from "@sentzunhat/zacatl";

const service = new Service({
  type: ServiceType.SERVER,
  // ... other config
  platforms: {
    server: {
      // ... other server config
      databases: [
        {
          vendor: DatabaseVendor.MONGOOSE,
          instance: mongoose,
        },
      ],
    },
  },
});
```

---

**Complete Guide**: [← Back to Getting Started](./README.md)
