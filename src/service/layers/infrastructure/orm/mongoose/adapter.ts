import { type QueryFilter, type Mongoose } from '@sentzunhat/zacatl/third-party/databases/mongoose';
import type { InjectionToken } from '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe';

import { getContainer, resolveDependency } from '../../../../../dependency-injection';
import { InternalServerError } from '../../../../../error';
import type {
  MongooseRepositoryConfig,
  MongooseRepositoryModel,
  ORMPort,
  LeanDocument,
} from '../../repositories/types';
import { MongooseToken } from '../tokens';

/**
 * Mongoose ORM adapter - handles Mongoose-specific database operations
 */
export class MongooseAdapter<D, I extends object, O extends object>
  implements ORMPort<MongooseRepositoryModel<D>, I, O, QueryFilter<D>>
{
  public readonly model: MongooseRepositoryModel<D>;
  private readonly config: MongooseRepositoryConfig<D>;

  constructor(config: MongooseRepositoryConfig<D>) {
    this.config = config;
    this.model = this.resolveModel();

    void this.initialize().catch(console.error);
  }

  private resolveModel(): MongooseRepositoryModel<D> {
    const token = MongooseToken as InjectionToken<Mongoose>;

    if (!getContainer().isRegistered(token)) {
      throw new InternalServerError({
        message: 'Mongoose instance not registered in DI container',
        reason:
          'MongooseToken has not been bound to a Mongoose instance. ' +
          'Ensure registerOrmInstance is called with DatabaseVendor.MONGOOSE before using repositories.',
        component: this.constructor.name,
        operation: 'resolveModel',
      });
    }

    const resolved = resolveDependency<Mongoose>(token);

    if (resolved == null) {
      throw new InternalServerError({
        message: 'Mongoose instance resolved to null from DI container',
        reason:
          'MongooseToken resolved to a null value. ' +
          'Ensure registerOrmInstance is called with a valid Mongoose instance.',
        component: this.constructor.name,
        operation: 'resolveModel',
      });
    }

    const { name, schema } = this.config;

    if (name == null || typeof name !== 'string' || name === '' || schema == null) {
      throw new InternalServerError({
        message: 'Mongoose model configuration is invalid',
        reason: 'schema is required in MongooseRepositoryConfig',
        component: this.constructor.name,
        operation: 'resolveModel',
      });
    }

    // mongoose.model() is synchronous — registers the model with Mongoose's registry.
    // Async bootstrapping (createCollection, createIndexes, init) is handled via
    // initialize(), which can be called explicitly by DatabaseServer.configure()
    // for fail-fast startup validation.
    return resolved.model<D>(name, schema);
  }

  private async initialize(): Promise<void> {
    await this.model.createCollection();
    await this.model.createIndexes();
    await this.model.init();
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

  async findMany(filter: QueryFilter<D> = {}): Promise<O[]> {
    const entities = await this.model
      .find(filter)
      .lean<LeanDocument<O>[]>({ virtuals: true })
      .exec();

    return entities
      .map((entity) => this.toLean(entity))
      .filter((entity): entity is O => entity != null);
  }

  async create(entity: I): Promise<O> {
    const document = await this.model.create(entity as unknown as D);

    const leanDocument = this.toLean(document);

    if (leanDocument == null) {
      throw new InternalServerError({
        message: 'Failed to create document',
        reason: 'Document was created but toLean returned null',
        component: this.constructor.name,
        operation: 'create',
      });
    }

    return leanDocument;
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    try {
      const entity = await this.model
        .findByIdAndUpdate(id, update as unknown as Partial<D>, { returnDocument: 'after' })
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

  public toLean(input: unknown): O | null {
    if (input == null) {
      return null;
    }

    let base: LeanDocument<O>;

    if (
      input != null &&
      typeof input === 'object' &&
      'toObject' in input &&
      typeof (input as Record<string, unknown>)['toObject'] === 'function'
    ) {
      base = (
        input as {
          toObject: (opt: Record<string, unknown>) => LeanDocument<O>;
        }
      ).toObject({
        virtuals: true,
      });
    } else {
      base = input as LeanDocument<O>;
    }

    const baseRec = base as unknown as Record<string, unknown>;

    const idVal = (() => {
      if (typeof baseRec['id'] === 'string') return baseRec['id'];
      if (typeof baseRec['_id'] === 'string') return baseRec['_id'];
      if (baseRec['_id'] !== undefined && baseRec['_id'] !== null) return String(baseRec['_id']);
      return '';
    })();

    const result: O = {
      ...(base as O),
      id: idVal,
      createdAt:
        base.createdAt instanceof Date
          ? base.createdAt
          : base.createdAt != null
          ? new Date(base.createdAt)
          : new Date(),
      updatedAt:
        base.updatedAt instanceof Date
          ? base.updatedAt
          : base.updatedAt != null
          ? new Date(base.updatedAt)
          : new Date(),
    };

    return result;
  }
}
