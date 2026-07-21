import { type QueryFilter, type Mongoose } from '@zacatl/third-party/databases/mongoose';
import type { InjectionToken } from '@zacatl/third-party/dependency-injection/tsyringe';

import { getContainer, resolveDependency } from '../../../../../dependency-injection';
import { InternalServerError, ValidationError } from '../../../../../error';
import type {
  MongooseRepositoryConfig,
  MongooseRepositoryModel,
  ORMPort,
  LeanDocument,
  QueryOptions,
} from '../../repositories/types';
import { DEFAULT_QUERY_LIMIT } from '../../repositories/types';
import { createDatabaseToken } from '../tokens/factory';

/**
 * Mongoose ORM adapter - handles Mongoose-specific database operations
 */
export class MongooseAdapter<D, I extends object, O extends object>
  implements ORMPort<MongooseRepositoryModel<D>, I, O, QueryFilter<D>>
{
  // Resolved lazily on first use so that Service construction succeeds
  // even when the Mongoose instance is registered later in start().
  private _model: MongooseRepositoryModel<D> | undefined;
  private _readyPromise: Promise<void> | undefined;
  private readonly config: MongooseRepositoryConfig<D>;

  constructor(config: MongooseRepositoryConfig<D>) {
    this.config = config;
  }

  // Satisfies ORMPort<MongooseRepositoryModel<D>, ...>
  get model(): MongooseRepositoryModel<D> {
    if (this._model === undefined) {
      this._model = this.resolveModel();
    }

    return this._model;
  }

  async ready(): Promise<void> {
    this.getOrCreateModel();

    if (this._readyPromise === undefined) {
      this._readyPromise = this.initialize();
    }

    await this._readyPromise;
  }

  private getOrCreateModel(): MongooseRepositoryModel<D> {
    if (this._model === undefined) {
      this._model = this.resolveModel();
    }

    return this._model;
  }

  private resolveModel(): MongooseRepositoryModel<D> {
    const connectionName = this.config.connection?.name ?? 'MONGOOSE';
    const token = createDatabaseToken('MONGOOSE', connectionName) as InjectionToken<Mongoose>;

    if (!getContainer().isRegistered(token)) {
      throw new InternalServerError({
        message: 'Mongoose instance not registered in DI container',
        reason:
          'Database token has not been bound to a Mongoose instance. ' +
          'Ensure registerOrmInstance is called with a valid Mongoose instance.',
        component: this.constructor.name,
        operation: 'resolveModel',
        metadata: { connectionName },
      });
    }

    const resolved = resolveDependency<Mongoose>(token);

    if (resolved == null) {
      throw new InternalServerError({
        message: 'Mongoose instance resolved to null from DI container',
        reason: 'Database token resolved to a null value.',
        component: this.constructor.name,
        operation: 'resolveModel',
        metadata: { connectionName },
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
    // Async bootstrapping (createCollection, createIndexes, init) is handled
    // internally during construction.
    return resolved.model<D>(name, schema);
  }

  private async initialize(): Promise<void> {
    const model = this.getOrCreateModel();
    await model.createCollection();
    await model.createIndexes();
    await model.init();
  }

  async findById(id: string): Promise<O | null> {
    try {
      const entity = await this.model.findById(id).lean<O>({ virtuals: true }).exec();

      return this.toLean(entity);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'CastError') {
        return null;
      }

      throw err;
    }
  }

  async findMany(filter: QueryFilter<D> = {}, options?: QueryOptions): Promise<O[]> {
    const limit = Math.max(0, Math.min(options?.limit ?? DEFAULT_QUERY_LIMIT, 1000));
    const offset = Math.max(0, options?.offset ?? 0);

    this.assertNoTopLevelOperators(filter);

    const entities = await this.model
      .find(filter)
      .setOptions({ sanitizeFilter: true })
      .skip(offset)
      .limit(limit)
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

  async update(
    id: string,
    update: Partial<I>,
    options?: {
      raw?: boolean;
    },
  ): Promise<O | null> {
    try {
      const payload = options?.raw === true ? (update as unknown as Partial<D>) : ({ $set: update } as never);
      const entity = await this.model
        .findByIdAndUpdate(id, payload, { returnDocument: 'after' })
        .lean<O>({ virtuals: true })
        .exec();

      return this.toLean(entity);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'CastError') {
        return null;
      }

      throw err;
    }
  }

  async delete(id: string): Promise<O | null> {
    try {
      const entity = await this.model.findByIdAndDelete(id).lean<O>({ virtuals: true }).exec();

      return this.toLean(entity);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'CastError') {
        return null;
      }

      throw err;
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const result = await this.model.exists({ _id: id });
      return result != null;
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'CastError') {
        return false;
      }

      throw err;
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

  private assertNoTopLevelOperators(filter: QueryFilter<D>): void {
    if (filter == null || typeof filter !== 'object') {
      return;
    }

    for (const key of Object.keys(filter)) {
      if (key.startsWith('$')) {
        throw new ValidationError({
          message: 'Invalid repository filter',
          reason: 'Top-level MongoDB operators are not allowed in repository filters',
          component: this.constructor.name,
          operation: 'findMany',
          metadata: { key },
        });
      }
    }
  }
}
