# Database Setup

Connect Zacatl to Sequelize or Mongoose.

## Sequelize (SQL)

### Install

```bash
# Sequelize is an optional peer in Zacatl 0.0.57+.
# Install Sequelize plus the dialect driver your service uses:
npm install sequelize pg pg-hstore
```

### Setup

```typescript
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize('postgresql://localhost:5432/mydb', {
  logging: false,
});

await sequelize.authenticate();
```

### Define Model

```typescript
import { DataTypes } from 'sequelize';

const User = sequelize.define('User', {
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
import { BaseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/sequelize/repository';
import type { LeanDocument } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/types';

interface UserFields { name: string; email: string }
interface CreateUser { name: string; email: string }
type UserOutput = LeanDocument<UserFields>;

class UserRepository extends BaseRepository<UserFields, CreateUser, UserOutput> {
  constructor() { super({ name: 'User' }); }
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
} from '@sentzunhat/zacatl/service';

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
      name: 'my-service',
      server: {
        type: ServerType.SERVER,
        vendor: ServerVendor.FASTIFY,
        instance: fastify,
      },
      databases: [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          instance: sequelize,
          connection: { url: process.env.DATABASE_URL! },
        },
      ],
    },
  },
});
```

## Mongoose (MongoDB)

### Install

```bash
# Mongoose is an optional peer in Zacatl 0.0.57+.
npm install mongoose mongodb

# Then use via subpath import:
# import { mongoose } from '@sentzunhat/zacatl/third-party/databases/mongoose';
```

### Setup

```typescript
import mongoose from 'mongoose';

await mongoose.connect('mongodb://localhost:27017/mydb');
```

### Define Schema

```typescript
import { Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';

const userSchema = new Schema({
  name: String,
  email: String,
});

```

### Create Repository

```typescript
import { BaseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/mongoose/repository';
import type { LeanDocument } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/types';

interface UserFields { name: string; email: string }
interface CreateUser { name: string; email: string }
type UserOutput = LeanDocument<UserFields>;

class UserRepository extends BaseRepository<UserFields, CreateUser, UserOutput> {
  constructor() { super({ name: 'User', schema: userSchema }); }
}
```

### Register

```typescript
import { Service, ServiceType, DatabaseVendor } from '@sentzunhat/zacatl/service';

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
          connection: { url: 'mongodb://localhost:27017/mydb' },
          indexes: {
            bootMode:
              process.env.APP_ENV === 'local' ||
              process.env.APP_ENV === 'development' ||
              process.env.NODE_ENV === 'test'
                ? 'create'
                : 'off',
          },
        },
      ],
    },
  },
});
```

For staging/production collections, prefer `indexes.bootMode: 'off'` and run
index operations separately. See
[Mongoose Index Lifecycle Controls](./mongoose-index-lifecycle.md).

---

**Complete Guide**: [← Back to ORM Reference](./README.md)
