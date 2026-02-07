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
 * MongooseAdapter - Handles Mongoose-specific ORM operations
 */
export class MongooseAdapter<D, I, O> implements ORMPort<D, I, O> {
  public readonly model: MongooseModel<D>;
  private readonly config: MongooseRepositoryConfig<D>;

  constructor(config: MongooseRepositoryConfig<D>) {
    this.config = config;
    // Mongoose instance from DI container allows per-database configuration
    const mongoose = container.resolve<Mongoose>(Mongoose);

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
    const document = await this.model.create(entity as any);

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
