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

export class MongooseRepository<D, I, O> implements Repository<D, I, O> {
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

  public toLean(input: unknown): O | null {
    if (!input) {
      return null;
    }

    let base: LeanWithMeta<O>;

    if (
      input &&
      typeof input === "object" &&
      "toObject" in input &&
      typeof (input as unknown as Record<string, unknown>)["toObject"] ===
        "function"
    ) {
      base = (
        input as unknown as {
          toObject: (opt: any) => LeanWithMeta<O>;
        }
      ).toObject({
        virtuals: true,
      }) as LeanWithMeta<O>;
    } else {
      base = input as LeanWithMeta<O>;
    }

    const result: O = {
      ...(base as O),
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
    } as O;

    return result;
  }

  async findById(id: string): Promise<O | null> {
    const entity = await this.model
      .findById(id)
      .lean<O>({ virtuals: true })
      .exec();

    return this.toLean(entity);
  }

  async create(entity: I): Promise<O> {
    const document = await this.model.create<I>(entity as any);

    const leanDocument = this.toLean(document);

    if (!leanDocument) {
      throw new Error("failed to create document");
    }

    return leanDocument;
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    const entity = await this.model
      .findByIdAndUpdate(id, update as any, { new: true })
      .lean<O>({ virtuals: true })
      .exec();

    return this.toLean(entity);
  }

  async delete(id: string): Promise<O | null> {
    const entity = await this.model
      .findByIdAndDelete(id)
      .lean<O>({ virtuals: true })
      .exec();

    return this.toLean(entity);
  }
}
