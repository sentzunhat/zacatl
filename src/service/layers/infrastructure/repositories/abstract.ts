import { InternalServerError } from '@zacatl/error';

import type {
  BaseRepositoryConfig,
  RepositoryPort,
  MongooseBaseRepositoryConfig,
  MongooseRepositoryModel,
  NodeSqliteBaseRepositoryConfig,
  NodeSqliteRepositoryModel,
  SequelizeBaseRepositoryConfig,
  SequelizeRepositoryModel,
  RepositoryModel,
  ORMPort,
} from './types';
import { ORMType } from './types';
import { createMongooseAdapter, createNodeSqliteAdapter, createSequelizeAdapter } from '../orm';

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

const isNodeSqliteConfig = <D extends object>(
  config: BaseRepositoryConfig<D>,
): config is NodeSqliteBaseRepositoryConfig => {
  return config.type === ORMType.NodeSqlite;
};

/**
 * Abstract repository implementation supporting Mongoose, Sequelize, and node:sqlite.
 *
 * Adapters are created eagerly and resolve their ORM instances through DI
 * tokens, so repository methods and custom model access stay simple.
 * Use in two ways:
 * 1. Direct method calls: `await repo.findById()`
 * 2. Custom queries: `(this.model as ModelStatic<T>).find()` - type-assert model in subclass
 */
export abstract class BaseRepository<D extends object, I extends object, O extends object>
  implements RepositoryPort<RepositoryModel<D>, I, O>
{
  private readonly adapter:
    | ORMPort<MongooseRepositoryModel<D>, I, O, unknown>
    | ORMPort<SequelizeRepositoryModel<D>, I, O, unknown>
    | ORMPort<NodeSqliteRepositoryModel, I, O, unknown>;

  private readonly ormType: ORMType;

  /**
   * ORM model instance - requires type assertion based on ORM type.
   * Use isMongoose(), isSequelize(), or isNodeSqlite() to safely narrow the type.
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
    } else if (isNodeSqliteConfig(config)) {
      this.adapter = createNodeSqliteAdapter<I, O>(config);
    } else {
      const exhaustive: never = config;
      throw new InternalServerError({
        message: `Invalid repository config: ${JSON.stringify(exhaustive)}`,
        reason: 'Config is neither Mongoose, Sequelize, nor node:sqlite format',
        component: 'BaseRepository',
        operation: 'constructor',
        metadata: { config: exhaustive },
      });
    }
  }

  public isMongoose(): boolean {
    return this.ormType === ORMType.Mongoose;
  }

  public isSequelize(): boolean {
    return this.ormType === ORMType.Sequelize;
  }

  public isNodeSqlite(): boolean {
    return this.ormType === ORMType.NodeSqlite;
  }

  public toLean(input: unknown): O | null {
    return this.adapter.toLean(input);
  }

  async findById(id: string): Promise<O | null> {
    return this.adapter.findById(id);
  }

  async findMany(filter?: Record<string, unknown>): Promise<O[]> {
    return this.adapter.findMany(filter);
  }

  async create(entity: I): Promise<O> {
    return this.adapter.create(entity);
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    return this.adapter.update(id, update);
  }

  async delete(id: string): Promise<O | null> {
    return this.adapter.delete(id);
  }

  async exists(id: string): Promise<boolean> {
    return this.adapter.exists(id);
  }
}
