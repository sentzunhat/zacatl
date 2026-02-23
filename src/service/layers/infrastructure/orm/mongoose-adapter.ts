import { InternalServerError } from "../../../../error";
import { uuidv4, container } from "../../../../third-party";
import { Mongoose } from "../../../../third-party/mongoose";
import type {
  MongooseRepositoryConfig,
  MongooseRepositoryModel,
  ORMPort,
  LeanWithMeta,
} from "../repositories/types";

/**
 * Mongoose ORM adapter - handles Mongoose-specific database operations
 */
export class MongooseAdapter<D, I, O> implements ORMPort<MongooseRepositoryModel<D>, I, O> {
  private _model: MongooseRepositoryModel<D> | null = null;
  private readonly config: MongooseRepositoryConfig<D>;

  constructor(config: MongooseRepositoryConfig<D>) {
    this.config = config;
  }

  public get model(): MongooseRepositoryModel<D> {
    const existingModel = this._model;
    if (existingModel != null) {
      return existingModel;
    }

    const mongoose = container.resolve(Mongoose);
    const { name, schema } = this.config;

    // mongoose.model() is synchronous — registers the model with Mongoose's registry.
    // Async bootstrapping (createCollection, createIndexes, init) must NOT be called
    // fire-and-forget here; they are handled explicitly via initialize() during
    // DatabaseServer.configure() so we can await and surface errors at startup.
    const model = mongoose.model<D>(name ?? uuidv4(), schema);
    this._model = model;

    return model;
  }

  /**
   * Explicitly initialise the model: creates the collection and indexes.
   * Called by MongooseAdapter users during database setup (DatabaseServer.configure),
   * not lazily during first query — so failures surface at startup, not mid-request.
   */
  public async initialize(): Promise<void> {
    const m = this.model; // ensure _model is set
    await m.createCollection();
    await m.createIndexes();
    await m.init();
  }

  public toLean(input: unknown): O | null {
    if (input == null) {
      return null;
    }

    let base: LeanWithMeta<O>;

    if (
      input != null &&
      typeof input === "object" &&
      "toObject" in input &&
      typeof (input as unknown as Record<string, unknown>)["toObject"] === "function"
    ) {
      base = (
        input as unknown as {
          toObject: (opt: Record<string, unknown>) => LeanWithMeta<O>;
        }
      ).toObject({
        virtuals: true,
      }) as LeanWithMeta<O>;
    } else {
      base = input as LeanWithMeta<O>;
    }

    const baseRec = base as unknown as Record<string, unknown>;

    const idVal = (() => {
      if (typeof baseRec["id"] === "string") return baseRec["id"] as string;
      if (typeof baseRec["_id"] === "string") return baseRec["_id"] as string;
      if (baseRec["_id"] !== undefined && baseRec["_id"] !== null)
        return String(baseRec["_id"]);
      return "";
    })();

    const result: O = {
      ...(base as O),
      id: idVal,
      createdAt:
        base.createdAt instanceof Date
          ? base.createdAt
          : base.createdAt != null
            ? new Date(base.createdAt as string | number)
            : new Date(),
      updatedAt:
        base.updatedAt instanceof Date
          ? base.updatedAt
          : base.updatedAt != null
            ? new Date(base.updatedAt as string | number)
            : new Date(),
    } as O;

    return result;
  }

  async findById(id: string): Promise<O | null> {
    try {
      const entity = await this.model.findById(id).lean<O>({ virtuals: true }).exec();

      return this.toLean(entity);
    } catch {
      // Silently handle invalid ObjectId errors
      return null;
    }
  }

  async findMany(filter: Record<string, unknown> = {}): Promise<O[]> {
    const entities = (await this.model
      .find(filter)
      .lean<LeanWithMeta<O>[]>({ virtuals: true })
      .exec()) as LeanWithMeta<O>[];

    return entities
      .map((entity) => this.toLean(entity))
      .filter((entity): entity is O => entity != null);
  }

  async create(entity: I): Promise<O> {
    const document = await this.model.create(entity as unknown as D);

    const leanDocument = this.toLean(document);

    if (leanDocument == null) {
      throw new InternalServerError({
        message: "Failed to create document",
        reason: "Document was created but toLean returned null",
        component: "MongooseAdapter",
        operation: "create",
      });
    }

    return leanDocument;
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    try {
      const entity = await this.model
        .findByIdAndUpdate(id, update as unknown as Partial<D>, { new: true })
        .lean<O>({ virtuals: true })
        .exec();

      return this.toLean(entity);
    } catch {
      // Silently handle invalid ObjectId errors
      return null;
    }
  }

  async delete(id: string): Promise<O | null> {
    try {
      const entity = await this.model.findByIdAndDelete(id).lean<O>({ virtuals: true }).exec();

      return this.toLean(entity);
    } catch {
      // Silently handle invalid ObjectId errors
      return null;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const result = await this.model.exists({ _id: id });
      return result != null;
    } catch {
      // Silently handle invalid ObjectId errors
      return false;
    }
  }
}
