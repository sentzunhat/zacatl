# ORM Imports

Zacatl exposes its service API and optional database dependencies through
explicit package subpaths. There is no package-root barrel, and the service
barrel does not export ORM repository classes.

## Common imports

```typescript
import { Service, ServiceType, DatabaseVendor } from '@sentzunhat/zacatl/service';
import { ORMType } from '@sentzunhat/zacatl/service/layers/infrastructure/orm/types';
import { BaseRepository as MongooseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/mongoose/repository';
import { mongoose, Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';
```

Import only the database wrapper and dependency your application uses:

| Database | Repository wrapper | Optional dependency |
| --- | --- | --- |
| Mongoose | `service/layers/infrastructure/repositories/mongoose/repository` | `third-party/databases/mongoose` |
| Sequelize | `service/layers/infrastructure/repositories/sequelize/repository` | `third-party/databases/sequelize` |
| Node.js SQLite | `service/layers/infrastructure/repositories/nodesqlite/repository` | Built-in `node:sqlite` |

The shared repository contracts, including `RepositoryPort`, `ORMPort`, and
`QueryOptions`, are types exported from
`service/layers/infrastructure/repositories/types`. `ORMType` is exported
from `service/layers/infrastructure/orm/types`.

## Mongoose example

```typescript
import { BaseRepository as MongooseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/mongoose/repository';
import { ORMType } from '@sentzunhat/zacatl/service/layers/infrastructure/orm/types';
import { Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';

interface UserRecord {
  email: string;
  name: string;
}

interface UserInput extends UserRecord {}
interface UserOutput extends UserRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserRecord>({
  email: { type: String, required: true },
  name: { type: String, required: true },
});

class UserRepository extends MongooseRepository<UserRecord, UserInput, UserOutput> {
  constructor() {
    super({ type: ORMType.Mongoose, name: 'User', schema: userSchema });
  }
}
```

## Sequelize example

```typescript
import { BaseRepository as SequelizeRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/sequelize/repository';
import { ORMType } from '@sentzunhat/zacatl/service/layers/infrastructure/orm/types';

interface UserRecord {
  email: string;
  name: string;
}

interface UserInput extends UserRecord {}
interface UserOutput extends UserRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

class UserRepository extends SequelizeRepository<UserRecord, UserInput, UserOutput> {
  constructor() {
    super({ type: ORMType.Sequelize, name: 'User' });
  }
}
```

The configured Sequelize instance and model are registered with the Service
infrastructure. See [database setup](./database-setup.md) for complete
connection and model configuration.

## Historical import note

Older releases and examples used a shared `BaseRepository` export and runtime
ORM switching. That API was removed in favor of one ORM-specific wrapper per
repository. Do not use the old `@sentzunhat/zacatl/service` imports or copy
those historical snippets into new code. The
[single-import guide](../single-import.md) lists current public import paths.
