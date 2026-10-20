# Working with Databases

Zacatl's Service coordinates database setup and repository readiness. Choose
the ORM-specific repository wrapper for each repository. Database instances
are configured on the Server platform; repository wrappers use the matching
ORM adapter from the Layers infrastructure.

## Sequelize

Install Sequelize and the dialect driver used by the application:

```bash
npm install sequelize pg pg-hstore
```

Register the instance through the Server database configuration:

```typescript
import { Sequelize } from 'sequelize';
import { DatabaseVendor, Service, ServiceType } from '@sentzunhat/zacatl/service';

const sequelize = new Sequelize(process.env.DATABASE_URL!);

const service = new Service({
  type: ServiceType.SERVER,
  platforms: {
    server: {
      databases: [{
        vendor: DatabaseVendor.SEQUELIZE,
        instance: sequelize,
        connection: { url: process.env.DATABASE_URL! },
      }],
    },
  },
});

await service.start();
```

Define the model through Sequelize, then use the Sequelize wrapper for
repository behavior:

```typescript
import { DataTypes, Model, Sequelize } from 'sequelize';
import { BaseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/sequelize/repository';
import { ORMType } from '@sentzunhat/zacatl/service/layers/infrastructure/orm/types';

interface ProductRecord {
  id: string;
  name: string;
  price: number;
}

interface ProductInput extends Omit<ProductRecord, 'id'> {}
interface ProductOutput extends ProductRecord {
  createdAt: Date;
  updatedAt: Date;
}

class ProductModel extends Model<ProductRecord, ProductInput> implements ProductRecord {
  declare id: string;
  declare name: string;
  declare price: number;
}

export function configureProductModel(sequelize: Sequelize): void {
  ProductModel.init(
    {
      id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
      name: { type: DataTypes.STRING, allowNull: false },
      price: { type: DataTypes.FLOAT, allowNull: false },
    },
    { sequelize, modelName: 'Product', timestamps: true },
  );
}

export class ProductRepository extends BaseRepository<ProductRecord, ProductInput, ProductOutput> {
  constructor() {
    super({ type: ORMType.Sequelize, name: 'Product' });
  }
}
```

The Sequelize instance and model must be configured before the Service prepares
repositories. For full model wiring, see [database setup](./database-setup.md).

## Mongoose

Install Mongoose and register its instance with a connection URL:

```bash
npm install mongoose
```

```typescript
import mongoose from 'mongoose';
import { DatabaseVendor, Service, ServiceType } from '@sentzunhat/zacatl/service';

const service = new Service({
  type: ServiceType.SERVER,
  platforms: {
    server: {
      databases: [{
        vendor: DatabaseVendor.MONGOOSE,
        instance: mongoose,
        connection: { url: process.env.MONGODB_URL! },
      }],
    },
  },
});

await service.start();
```

Use the Mongoose wrapper and schema for repository operations:

```typescript
import { BaseRepository } from '@sentzunhat/zacatl/service/layers/infrastructure/repositories/mongoose/repository';
import { ORMType } from '@sentzunhat/zacatl/service/layers/infrastructure/orm/types';
import { Schema } from '@sentzunhat/zacatl/third-party/databases/mongoose';

interface ArticleRecord {
  title: string;
  content: string;
}

interface ArticleInput extends ArticleRecord {}
interface ArticleOutput extends ArticleRecord {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<ArticleRecord>({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

export class ArticleRepository extends BaseRepository<ArticleRecord, ArticleInput, ArticleOutput> {
  constructor() {
    super({ type: ORMType.Mongoose, name: 'Article', schema: articleSchema });
  }
}
```

For production index policies, see
[Mongoose Index Lifecycle Controls](./mongoose-index-lifecycle.md).

## Application-owned repository contracts

For a database or storage system without a built-in Zacatl wrapper, define an
application-owned port and implement it with that storage system. `RepositoryPort`
is the common CRUD contract when its methods fit the application's needs; it is
not a database-independent `IRepository` API exported from the Service barrel.
Import it as a type from
`service/layers/infrastructure/repositories/types` and keep the concrete
adapter in your infrastructure layer.

See [the repository guide](../../service/repository.md) for the shared methods
and [the infrastructure usage guide](../../service/infrastructure-usage.md)
for the Layers/Platforms ownership boundary.
