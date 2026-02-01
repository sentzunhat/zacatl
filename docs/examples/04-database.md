# Database Integration

Connect to PostgreSQL, MongoDB, or any database.

## Sequelize (SQL Databases)

### Setup

```bash
npm install sequelize pg
```

### Configuration

```typescript
import { Sequelize } from "sequelize";
import { Service } from "@sentzunhat/zacatl";

const sequelize = new Sequelize("postgresql://user:pass@localhost:5432/mydb");

const service = new Service({
  architecture: {
    server: {
      databases: [{ vendor: "SEQUELIZE", instance: sequelize }],
    },
  },
});

await service.start();
```

### Repository Example

```typescript
import { IRepository } from "@sentzunhat/zacatl";
import { DataTypes, Sequelize, Model } from "sequelize";

interface Product {
  id: string;
  name: string;
  price: number;
}

class ProductModel extends Model {}

export class ProductRepository implements IRepository<Product> {
  private model: typeof ProductModel;

  constructor(sequelize: Sequelize) {
    ProductModel.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        name: { type: DataTypes.STRING, allowNull: false },
        price: { type: DataTypes.FLOAT, allowNull: false },
      },
      { sequelize, modelName: "Product" },
    );
    this.model = ProductModel;
  }

  findById = async (id: string) => {
    return this.model.findByPk(id) as Promise<Product | null>;
  };

  findMany = async (filter: Record<string, unknown>) => {
    return this.model.findAll({ where: filter }) as Promise<Product[]>;
  };

  create = async (data: Product) => {
    return this.model.create(data) as Promise<Product>;
  };

  update = async (id: string, data: Partial<Product>) => {
    await this.model.update(data, { where: { id } });
  };

  delete = async (id: string) => {
    await this.model.destroy({ where: { id } });
  };

  exists = async (id: string) => {
    const count = await this.model.count({ where: { id } });
    return count > 0;
  };
}
```

## Mongoose (MongoDB)

### Setup

```bash
npm install mongoose
```

### Configuration

```typescript
import mongoose from "mongoose";
import { Service } from "@sentzunhat/zacatl";

const service = new Service({
  architecture: {
    server: {
      databases: [
        {
          vendor: "MONGOOSE",
          instance: mongoose,
          connectionString: "mongodb://localhost:27017/mydb",
        },
      ],
    },
  },
});

await service.start();
```

### Repository Example

```typescript
import { IRepository } from "@sentzunhat/zacatl";
import mongoose, { Schema, Document } from "mongoose";

interface Article {
  id: string;
  title: string;
  content: string;
}

const ArticleSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const ArticleModel = mongoose.model<Article & Document>(
  "Article",
  ArticleSchema,
);

export class ArticleRepository implements IRepository<Article> {
  findById = async (id: string) => {
    const doc = await ArticleModel.findById(id).lean();
    return doc as Article | null;
  };

  findMany = async (filter: Record<string, unknown>) => {
    return ArticleModel.find(filter).lean() as Promise<Article[]>;
  };

  create = async (data: Omit<Article, "id">) => {
    const doc = await ArticleModel.create(data);
    return doc.toObject() as Article;
  };

  update = async (id: string, data: Partial<Article>) => {
    await ArticleModel.findByIdAndUpdate(id, data);
  };

  delete = async (id: string) => {
    await ArticleModel.findByIdAndDelete(id);
  };

  exists = async (id: string) => {
    const count = await ArticleModel.countDocuments({ _id: id });
    return count > 0;
  };
}
```

## Custom Database

Implement `IRepository<T>` for any database:

```typescript
import { IRepository } from "@sentzunhat/zacatl";
import Database from "better-sqlite3";

export class SQLiteRepository<T> implements IRepository<T> {
  constructor(
    private db: Database.Database,
    private tableName: string,
  ) {}

  findById = async (id: string): Promise<T | null> => {
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE id = ?`,
    );
    return stmt.get(id) as T | null;
  };

  findMany = async (filter: Record<string, unknown>): Promise<T[]> => {
    const keys = Object.keys(filter);
    const values = Object.values(filter);
    const where = keys.map((k) => `${k} = ?`).join(" AND ");
    const stmt = this.db.prepare(
      `SELECT * FROM ${this.tableName} WHERE ${where}`,
    );
    return stmt.all(...values) as T[];
  };

  create = async (data: T): Promise<T> => {
    const keys = Object.keys(data as any);
    const values = Object.values(data as any);
    const placeholders = keys.map(() => "?").join(",");
    const stmt = this.db.prepare(
      `INSERT INTO ${this.tableName} (${keys.join(",")}) VALUES (${placeholders})`,
    );
    stmt.run(...values);
    return data;
  };

  update = async (id: string, data: Partial<T>): Promise<void> => {
    const keys = Object.keys(data as any);
    const values = Object.values(data as any);
    const set = keys.map((k) => `${k} = ?`).join(",");
    const stmt = this.db.prepare(
      `UPDATE ${this.tableName} SET ${set} WHERE id = ?`,
    );
    stmt.run(...values, id);
  };

  delete = async (id: string): Promise<void> => {
    const stmt = this.db.prepare(`DELETE FROM ${this.tableName} WHERE id = ?`);
    stmt.run(id);
  };

  exists = async (id: string): Promise<boolean> => {
    const stmt = this.db.prepare(
      `SELECT COUNT(*) as count FROM ${this.tableName} WHERE id = ?`,
    );
    const result = stmt.get(id) as { count: number };
    return result.count > 0;
  };
}
```

## Supported Databases

| Database   | Adapter   | Status               |
| ---------- | --------- | -------------------- |
| PostgreSQL | Sequelize | ✅ Built-in          |
| MySQL      | Sequelize | ✅ Built-in          |
| SQLite     | Sequelize | ✅ Built-in          |
| MongoDB    | Mongoose  | ✅ Built-in          |
| Others     | Custom    | ✅ Easy to implement |

**Next**: [Error Handling →](./05-error-handling.md)
