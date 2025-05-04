import importedMongoose, {
  connection,
  Model,
  Document,
  Mongoose,
  Schema,
  Types,
} from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { container } from "tsyringe";

export type BaseRepositoryConfig<T> = {
  name?: string;
  schema: Schema<T>;
};

export type TDocument<T> = Document<Types.ObjectId, {}, T> &
  T & {
    id: string;
  };

export type TRequiredId<T> = T & {
  _id: Types.ObjectId;
};

export type Repository<T> = {
  model: Model<T>;

  findById(id: string): Promise<TDocument<T> | null>;
  create(entity: T): Promise<TDocument<T>>;
  update(id: string, entity: Partial<T>): Promise<TDocument<T> | null>;
  delete(id: string): Promise<TDocument<T> | null>;
};

export abstract class BaseRepository<T> implements Repository<T> {
  public model: Model<T>;

  constructor(config: BaseRepositoryConfig<T>) {
    const mongoose = connection.db?.databaseName
      ? importedMongoose
      : container.resolve<Mongoose>(Mongoose);

    const { name, schema } = config;

    if (name) {
      this.model = mongoose.model<T>(name, schema);
    } else {
      this.model = mongoose.model<T>(uuidv4(), schema);
    }

    this.model.createCollection();
    this.model.createIndexes();
    this.model.init();
  }

  /**
   * Transforms a Mongoose document into a plain entity object.
   */
  protected toEntity(doc: TDocument<T>): TRequiredId<T> {
    // We call the built-in toObject method and cast to T.
    return doc.toObject<TDocument<T>>({ virtuals: true }) as TRequiredId<T>;
  }

  async findById(id: string): Promise<TDocument<T> | null> {
    const foundEntity = await this.model.findById<TDocument<T>>(id).exec();

    if (!foundEntity) {
      return null;
    }

    return foundEntity.toObject<TDocument<T>>({
      virtuals: true,
    });
  }

  async create(entity: T): Promise<TDocument<T>> {
    const createdEntity = await this.model.create<TDocument<T>>(entity);

    return createdEntity.toObject<TDocument<T>>({
      virtuals: true,
    });
  }

  async update(id: string, entity: Partial<T>): Promise<TDocument<T> | null> {
    const updatedEntity = await this.model
      .findByIdAndUpdate<TDocument<T>>(id, entity, { new: true })
      .exec();

    if (!updatedEntity) {
      return null;
    }

    return updatedEntity.toObject<TDocument<T>>({
      virtuals: true,
    });
  }

  async delete(id: string): Promise<TDocument<T> | null> {
    const deletedEntity = await this.model
      .findByIdAndDelete<TDocument<T>>(id)
      .exec();

    if (!deletedEntity) {
      return null;
    }

    return deletedEntity.toObject<TDocument<T>>({
      virtuals: true,
    });
  }
}
