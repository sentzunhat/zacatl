import type { Model as MongooseModel } from "mongoose";
import type { Model, ModelStatic } from "sequelize";
import {
  BaseRepositoryConfig,
  Repository,
  MongooseRepositoryConfig,
  SequelizeRepositoryConfig,
  ORMAdapter,
  ORMType,
} from "./types";
import {
  loadMongooseAdapter,
  loadSequelizeAdapter,
} from "../orm/adapter-loader";

export * from "./types";

/**
 * Type guard to check if config is for Mongoose
 */
const isMongooseConfig = <D>(
  config: BaseRepositoryConfig<D>,
): config is MongooseRepositoryConfig<D> => {
  return config.type === ORMType.Mongoose;
};

/**
 * Type guard to check if config is for Sequelize
 */
const isSequelizeConfig = <D extends Model>(
  config: BaseRepositoryConfig<D>,
): config is SequelizeRepositoryConfig<D> => {
  return config.type === ORMType.Sequelize;
};

/**
 * BaseRepository - Abstract base class for all repositories
 *
 * Supports multiple ORMs (Mongoose, Sequelize) through adapter pattern.
 * Adapters are lazy-loaded - only the ORM you use gets imported.
 * This allows projects to install only one ORM without unused dependencies.
 */
export abstract class BaseRepository<D, I, O> implements Repository<D, I, O> {
  private adapter: ORMAdapter<D, I, O>;
  private readonly ormType: ORMType;

  constructor(config: BaseRepositoryConfig<D>) {
    this.ormType = config.type;

    if (isMongooseConfig<D>(config)) {
      this.adapter = loadMongooseAdapter<D, I, O>(config);
    } else if (isSequelizeConfig(config)) {
      // Type assertion needed here because D could be either Mongoose or Sequelize model
      this.adapter = loadSequelizeAdapter<Model, I, O>(config) as ORMAdapter<
        D,
        I,
        O
      >;
    } else {
      const exhaustive: never = config;
      throw new Error(
        `Invalid repository configuration. Received: ${JSON.stringify(exhaustive)}`,
      );
    }
  }

  get model(): MongooseModel<D> | ModelStatic<any> {
    return this.adapter.model;
  }

  public isMongoose(): boolean {
    return this.ormType === ORMType.Mongoose;
  }

  public isSequelize(): boolean {
    return this.ormType === ORMType.Sequelize;
  }

  public getMongooseModel(): MongooseModel<D> {
    if (!this.isMongoose()) {
      throw new Error("Repository is not using Mongoose");
    }
    return this.adapter.model as MongooseModel<D>;
  }

  public getSequelizeModel(): ModelStatic<any> {
    if (!this.isSequelize()) {
      throw new Error("Repository is not using Sequelize");
    }
    return this.adapter.model as ModelStatic<any>;
  }

  public toLean(input: unknown): O | null {
    return this.adapter.toLean(input);
  }

  async findById(id: string): Promise<O | null> {
    return this.adapter.findById(id);
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
}
