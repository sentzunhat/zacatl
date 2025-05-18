import importedMongoose, {
  connection,
  Model,
  Mongoose,
  Schema,
} from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { container } from "tsyringe";

export type BaseRepositoryConfig<D> = {
  name?: string;
  schema: Schema<D>;
};

export type LeanDocument<T> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

// D - Document, meant for Database representation
// T - Type, meant for TypeScript representation
export type Repository<D, T> = {
  model: Model<D>;

  findById(id: string): Promise<LeanDocument<T> | null>;
  create(entity: D): Promise<LeanDocument<T>>;
  update(id: string, update: Partial<D>): Promise<LeanDocument<T> | null>;
  delete(id: string): Promise<LeanDocument<T> | null>;
};

export abstract class BaseRepository<D, T> implements Repository<D, T> {
  public readonly model: Model<D>;

  constructor(config: BaseRepositoryConfig<D>) {
    const mongoose = connection.db?.databaseName
      ? importedMongoose
      : container.resolve<Mongoose>(Mongoose);

    const { name, schema } = config;

    if (name) {
      this.model = mongoose.model<D>(name, schema);
    } else {
      this.model = mongoose.model<D>(uuidv4(), schema);
    }

    this.model.createCollection();
    this.model.createIndexes();
    this.model.init();
  }

  async findById(id: string): Promise<LeanDocument<T> | null> {
    const entity = await this.model
      .findById(id)
      .lean<LeanDocument<T>>({ virtuals: true })
      .exec();

    if (!entity) {
      return null;
    }

    return entity;
  }

  async create(entity: D): Promise<LeanDocument<T>> {
    const doc = await this.model.create(entity);

    return doc.toObject<LeanDocument<T>>({ virtuals: true });
  }

  async update(
    id: string,
    update: Partial<D>
  ): Promise<LeanDocument<T> | null> {
    const entity = await this.model
      .findByIdAndUpdate(id, update, { new: true })
      .lean<LeanDocument<T>>({ virtuals: true })
      .exec();

    if (!entity) {
      return null;
    }

    return entity;
  }

  async delete(id: string): Promise<LeanDocument<T> | null> {
    const entity = await this.model
      .findByIdAndDelete(id)
      .lean<LeanDocument<T>>({ virtuals: true })
      .exec();

    if (!entity) {
      return null;
    }

    return entity;
  }
}
