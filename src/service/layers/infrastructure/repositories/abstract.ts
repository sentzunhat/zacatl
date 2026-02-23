import { InternalServerError } from '@zacatl/error';

import type {
  BaseRepositoryConfig,
  RepositoryPort,
  MongooseBaseRepositoryConfig,
  MongooseRepositoryModel,
  SequelizeBaseRepositoryConfig,
  SequelizeRepositoryModel,
  RepositoryModel,
  ORMPort,
} from './types';
import { ORMType } from './types';
import { createMongooseAdapter, createSequelizeAdapter } from '../orm/adapter-loader';

export * from './types';

const isMongooseConfig = <D extends object>(
  config: BaseRepositoryConfig<D>,
): config is MongooseBaseRepositoryConfig<D> => {
  return config.type === ORMType.Mongoose;
};

const isSequelizeConfig = <D extends object>(
  config: BaseRepositoryConfig<D>,
): config is SequelizeBaseRepositoryConfig<D> => {
  return config.type === ORMType.Sequelize;
};

/**
 * Abstract repository implementation supporting Mongoose and Sequelize
 *
 * Provides lazy adapter loading with immediate model access. Use in two ways:
 * 1. Direct method calls: `await repo.findById()` - adapter lazy-loads on first call
 * 2. Custom queries: `(this.model as ModelStatic<T>).find()` - type-assert model in subclass
 */
export abstract class BaseRepository<D extends object, I, O>
  implements RepositoryPort<RepositoryModel<D>, I, O>
{
  private readonly adapter:
    | ORMPort<MongooseRepositoryModel<D>, I, O>
    | ORMPort<SequelizeRepositoryModel<D>, I, O>;
  private readonly ormType: ORMType;

  /**
   * ORM model instance - requires type assertion based on ORM type
   * Use isMongoose() or isSequelize() to safely narrow the type
   */
  public get model(): RepositoryModel<D> {
    return this.adapter.model;
  }

  constructor(config: BaseRepositoryConfig<D>) {
    this.ormType = config.type;

    if (isMongooseConfig<D>(config)) {
      this.adapter = createMongooseAdapter<D, I, O>(config);
    } else if (isSequelizeConfig<D>(config)) {
      this.adapter = createSequelizeAdapter<D, I, O>(config);
    } else {
      const exhaustive: never = config;
      throw new InternalServerError({
        message: `Invalid repository config: ${JSON.stringify(exhaustive)}`,
        reason: 'Config is neither Mongoose nor Sequelize format',
        component: 'BaseRepository',
        operation: 'constructor',
        metadata: { config: exhaustive },
      });
    }
  }

  public isMongoose(): boolean {
    return this.ormType === ORMType.Mongoose;
  }

  /**
   * Returns true when the configured ORM is Mongoose
   */
  public isSequelize(): boolean {
    return this.ormType === ORMType.Sequelize;
  }

  /**
   * Initialize the ORM model (create collections, indexes, etc.)
   * For Mongoose: creates collection and indexes
   * For Sequelize: no-op (use Sequelize.sync() in onDatabaseConnected instead)
   *
   * Call this method from the onDatabaseConnected callback to ensure
   * async setup operations complete at startup instead of during first query.
   *
   * @example
   * ```typescript
   * onDatabaseConnected: async (mongoose: Mongoose) => {
   *   const userRepo = container.resolve(UserRepository);
   *   await userRepo.initializeModel();
   * }
   * ```
   */
  public async initializeModel(): Promise<void> {
    // Type guard: check if adapter has initialize method (Mongoose)
    if ('initialize' in this.adapter && typeof this.adapter.initialize === 'function') {
      await this.adapter.initialize();
    }
    // Sequelize adapters don't need this - users call sequelize.sync() directly
  }

  /**
   * Convert an ORM-specific entity/document to a plain lean output
   * @param input ORM entity/document or plain object
   */
  public toLean(input: unknown): O | null {
    return this.adapter.toLean(input);
  }

  /**
   * Find an entity by its id
   * @param id Entity identifier
   */
  async findById(id: string): Promise<O | null> {
    return this.adapter.findById(id);
  }

  /**
   * Find multiple entities matching a filter
   * @param filter Optional query filter
   */
  async findMany(filter?: Record<string, unknown>): Promise<O[]> {
    return this.adapter.findMany(filter);
  }

  /**
   * Create a new entity
   * @param entity Input data for creation
   */
  async create(entity: I): Promise<O> {
    return this.adapter.create(entity);
  }

  /**
   * Update an existing entity by id
   * @param id Entity identifier
   * @param update Partial update payload
   */
  async update(id: string, update: Partial<I>): Promise<O | null> {
    return this.adapter.update(id, update);
  }

  /**
   * Delete an entity by id
   * @param id Entity identifier
   */
  async delete(id: string): Promise<O | null> {
    return this.adapter.delete(id);
  }

  /**
   * Check existence of an entity by id
   * @param id Entity identifier
   */
  async exists(id: string): Promise<boolean> {
    return this.adapter.exists(id);
  }
}
