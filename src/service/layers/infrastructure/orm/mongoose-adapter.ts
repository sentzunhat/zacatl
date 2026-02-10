import { InternalServerError } from "@zacatl/error";
import { uuidv4 } from "@zacatl/third-party";
import { container } from "@zacatl/third-party";

import type { MongooseModel } from "../../../../third-party/mongoose";
import { Mongoose } from "../../../../third-party/mongoose";
import type {
  MongooseRepositoryConfig,
  ORMPort,
  LeanWithMeta,
} from "../repositories/types";

/**
 * Mongoose ORM adapter - handles Mongoose-specific database operations
 */
export class MongooseAdapter<D, I, O> implements ORMPort<D, I, O> {
  private _model: MongooseModel<D> | null = null;
  private readonly config: MongooseRepositoryConfig<D>;

  constructor(config: MongooseRepositoryConfig<D>) {
    this.config = config;
  }

  public get model(): MongooseModel<D> {
    if (!this._model) {
      const mongoose = container.resolve(Mongoose);
      const { name, schema } = this.config;

      this._model = mongoose.model<D>(name || uuidv4(), schema);
      this._model.createCollection();
      this._model.createIndexes();
      this._model.init();
    }
    return this._model;
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
          toObject: (opt: Record<string, unknown>) => LeanWithMeta<O>;
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
    const document = await this.model.create(entity as unknown as D);

    const leanDocument = this.toLean(document);

    if (!leanDocument) {
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
    const entity = await this.model
      .findByIdAndUpdate(id, update as unknown as Partial<D>, { new: true })
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
