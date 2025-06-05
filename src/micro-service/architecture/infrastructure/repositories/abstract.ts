import importedMongoose, {
  connection,
  IfAny,
  Model,
  Mongoose,
  Document,
  Schema,
  Default__v,
  Require_id,
  ObjectId,
} from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { container } from "tsyringe";

export type BaseRepositoryConfig<D> = {
  name?: string;
  schema: Schema<D>;
};

export type WithMongooseMeta<T> = Default__v<Require_id<T>>;

export type MongooseDocument<Db> = Document<
  ObjectId,
  {},
  Db,
  Record<string, string>
> &
  WithMongooseMeta<Db>;

export type LeanWithMeta<T> = WithMongooseMeta<T> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LeanDocument<T> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MongooseDoc<Db> = IfAny<
  MongooseDocument<Db>,
  MongooseDocument<Db>,
  MongooseDocument<Db>
>;

export type ToLeanInput<D, T> =
  | MongooseDoc<D>
  | LeanDocument<T>
  | null
  | undefined;

// D - Document, meant for Database representation
// T - Type, meant for TypeScript representation
export type Repository<D, T> = {
  model: Model<D>;

  toLean(input: ToLeanInput<D, T>): LeanDocument<T> | null;
  findById(id: string): Promise<LeanDocument<T> | null>;
  create(entity: D): Promise<LeanDocument<T>>;
  update(id: string, update: Partial<D>): Promise<LeanDocument<T> | null>;
  delete(id: string): Promise<LeanDocument<T> | null>;
};

export abstract class BaseRepository<D, T> implements Repository<D, T> {
  public readonly model: Model<D>;
  private readonly config: BaseRepositoryConfig<D>;

  constructor(config: BaseRepositoryConfig<D>) {
    this.config = config;
    const mongoose = connection.db?.databaseName
      ? importedMongoose
      : container.resolve<Mongoose>(Mongoose);

    const { name, schema } = this.config;

    if (name) {
      this.model = mongoose.model<D>(name, schema);
    } else {
      this.model = mongoose.model<D>(uuidv4(), schema);
    }

    this.model.createCollection();
    this.model.createIndexes();
    this.model.init();
  }

  /**
   * Ensures the returned document has the correct id, createdAt, and updatedAt fields.
   * Accepts a Mongoose document, a plain object, or a result from .lean().
   */
  public toLean(input: ToLeanInput<D, T>): LeanDocument<T> | null {
    if (!input) {
      return null;
    }

    let base: LeanWithMeta<T>;

    if (typeof (input as MongooseDoc<D>).toObject === "function") {
      base = (input as MongooseDoc<D>).toObject<LeanDocument<T>>({
        virtuals: true,
      });
    } else {
      base = input as LeanWithMeta<T>;
    }

    const result: LeanDocument<T> = {
      ...(base as T), // trust only known keys from T
      id:
        typeof base.id === "string"
          ? base.id
          : typeof base._id === "string"
          ? base._id
          : base._id !== undefined
          ? String(base._id)
          : "",
      createdAt:
        base.createdAt instanceof Date
          ? base.createdAt
          : base.createdAt
          ? new Date(base.createdAt as string | number)
          : new Date(),
      updatedAt:
        base.updatedAt instanceof Date
          ? base.updatedAt
          : base.updatedAt
          ? new Date(base.updatedAt as string | number)
          : new Date(),
    };

    return result;
  }

  async findById(id: string): Promise<LeanDocument<T> | null> {
    const entity = await this.model
      .findById(id)
      .lean<LeanDocument<T>>({ virtuals: true })
      .exec();

    return this.toLean(entity);
  }

  async create(entity: D): Promise<LeanDocument<T>> {
    const document = await this.model.create<D>(entity);

    const leanDocument = this.toLean(document as MongooseDoc<D>);

    if (!leanDocument) {
      throw new Error("failed to create document");
    }

    return leanDocument;
  }

  async update(
    id: string,
    update: Partial<D>
  ): Promise<LeanDocument<T> | null> {
    const entity = await this.model
      .findByIdAndUpdate(id, update, { new: true })
      .lean<LeanDocument<T>>({ virtuals: true })
      .exec();

    return this.toLean(entity);
  }

  async delete(id: string): Promise<LeanDocument<T> | null> {
    const entity = await this.model
      .findByIdAndDelete(id)
      .lean<LeanDocument<T>>({ virtuals: true })
      .exec();

    return this.toLean(entity);
  }
}
