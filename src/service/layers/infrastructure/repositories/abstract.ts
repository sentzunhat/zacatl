import { InternalServerError } from "@zacatl/error";

import {
  BaseRepositoryConfig,
  RepositoryPort,
  MongooseRepositoryConfig,
  SequelizeRepositoryConfig,
  ORMPort,
  ORMType,
  RepositoryModel,
} from "./types";
import type { SequelizeModel as Model } from "../../../../third-party/sequelize";
import {
  createMongooseAdapter,
  createSequelizeAdapter,
} from "../orm/adapter-loader";

export * from "./types";

const isMongooseConfig = <D>(
  config: BaseRepositoryConfig<D>,
): config is MongooseRepositoryConfig<D> => {
  return config.type === ORMType.Mongoose;
};

const isSequelizeConfig = <D extends Model>(
  config: BaseRepositoryConfig<D>,
): config is SequelizeRepositoryConfig<D> => {
  return config.type === ORMType.Sequelize;
};

/**
 * Abstract repository implementation supporting Mongoose and Sequelize
 *
 * Provides lazy adapter loading with immediate model access. Use in two ways:
 * 1. Direct method calls: `await repo.findById()` - adapter lazy-loads on first call
 * 2. Custom queries: `(this.model as ModelStatic<T>).find()` - type-assert model in subclass
 */
export abstract class BaseRepository<D, I, O> implements RepositoryPort<
  D,
  I,
  O
> {
  private readonly adapter: ORMPort<D, I, O>;
  private readonly ormType: ORMType;

  /** ORM model instance - typed by subclass assertion (lazy-loaded) */
  public get model(): RepositoryModel<D> {
    return this.adapter.model as RepositoryModel<D>;
  }

  constructor(config: BaseRepositoryConfig<D>) {
    this.ormType = config.type;

    if (isMongooseConfig<D>(config)) {
      this.adapter = createMongooseAdapter<D, I, O>(config);
    } else if (isSequelizeConfig(config)) {
      this.adapter = createSequelizeAdapter<D, I, O>(config);
    } else {
      const exhaustive: never = config;
      throw new InternalServerError({
        message: `Invalid repository config: ${JSON.stringify(exhaustive)}`,
        reason: "Config is neither Mongoose nor Sequelize format",
        component: "BaseRepository",
        operation: "constructor",
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
