# ORM Support

## Architecture

```mermaid
graph TD
    A[Your Repository] -->|extends| B[BaseRepository]
    B -->|uses| C[ORMAdapter]
    C -->|implements| D[MongooseAdapter]
    C -->|implements| E[SequelizeAdapter]
    C -->|implements| F[NodeSqliteAdapter]
    C -->|implements| G[YourAdapter]
    D --> H[(MongoDB)]
    E --> I[(PostgreSQL/MySQL)]
    F --> J[(SQLite)]
    G --> K[(Your DB)]
```

## Built-in ORMs

- Mongoose (MongoDB)
- Sequelize (PostgreSQL, MySQL, SQLite via `sequelize` package)
- Node.js SQLite (`node:sqlite` module — Node 24+ only, no external package required)

## Mongoose Example

```typescript
import { BaseRepository } from '@sentzunhat/zacatl';
import { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    name: String,
    email: String,
  },
  { timestamps: true },
);

class UserRepository extends BaseRepository<User, CreateUser, UserDTO> {
  constructor() {
    super({ type: 'mongoose', name: 'User', schema: userSchema });
  }

  async findByEmail(email: string) {
    const model = this.model as MongooseModel<User>;
    return this.toLean(await model.findOne({ email }).lean());
  }
}
```

## Sequelize Example

```typescript
import { BaseRepository } from '@sentzunhat/zacatl';
import { Model } from 'sequelize';

class ProductModel extends Model {
  declare id: string;
  declare name: string;
}

class ProductRepository extends BaseRepository<ProductModel, CreateProduct, ProductDTO> {
  constructor() {
    super({ type: 'sequelize', model: ProductModel });
  }
}
```

## Node.js SQLite Example

```typescript
import { BaseRepository } from '@sentzunhat/zacatl';

interface User {
  id: string;
  name: string;
  email: string;
}

class UserRepository extends BaseRepository<User, CreateUser, UserDTO> {
  constructor(database: DatabaseSync) {
    super({
      type: 'nodesqlite',
      database,
      tableName: 'users',
    });
  }
}
```

````

## Custom Adapter

```typescript
import type { ORMAdapter } from '@sentzunhat/zacatl';

class MyAdapter<D, I, O> implements ORMAdapter<D, I, O> {
  readonly model: any;

  toLean(input: unknown): O | null {
    /* ... */
  }
  async findById(id: string): Promise<O | null> {
    /* ... */
  }
  async create(entity: I): Promise<O> {
    /* ... */
  }
  async update(id: string, update: Partial<I>): Promise<O | null> {
    /* ... */
  }
  async delete(id: string): Promise<O | null> {
    /* ... */
  }
}
````

## BaseRepository API

````typescript
// CRUD
await repo.findById(id);
await repo.create(data);
await repo.update(id, data);
await repo.delete(id);

// Utilities
repo.toLean(document);
repo.isMongoose();
repo.isSequelize();
// Use model directly with type assertion:
// (repo.model as MongooseModel<T>) for Mongoose
// (repo.model as ModelStatic<T>) for Sequelize
// (repo.model as DatabaseSync) for Node.js SQLite```
````
