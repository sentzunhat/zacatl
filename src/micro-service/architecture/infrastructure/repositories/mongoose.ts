import importedMongoose, { connection, Model, Mongoose } from "mongoose";
import { v4 as uuidv4 } from "uuid";
import { container } from "tsyringe";
import {
  Repository,
  MongooseRepositoryConfig,
  LeanDocument,
  ToLeanInput,
  LeanWithMeta,
  MongooseDoc,
} from "./types";

export class MongooseRepository<D, T> implements Repository<D, T> {
  public readonly model: Model<D>;
  private readonly config: MongooseRepositoryConfig<D>;

  constructor(config: MongooseRepositoryConfig<D>) {
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

  public toLean(input: ToLeanInput<D, T>): LeanDocument<T> | null {
    if (!input) {
      return null;
    }

    let base: LeanWithMeta<T>;

    if (
      input &&
      typeof input === "object" &&
      "toObject" in input &&
      typeof (input as any).toObject === "function"
    ) {
      base = (input as any).toObject({
        virtuals: true,
      }) as LeanWithMeta<T>;
    } else {
      base = input as LeanWithMeta<T>;
    }

    const result: LeanDocument<T> = {
      ...(base as T),
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
