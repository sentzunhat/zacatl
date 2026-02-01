import { Model as MongooseModel } from "mongoose";
import { Model, ModelStatic } from "sequelize";
import {
  BaseRepositoryConfig,
  Repository,
  MongooseRepositoryConfig,
  SequelizeRepositoryConfig,
  ORMAdapter,
  ORMType,
} from "./types";
import { MongooseAdapter } from "../orm/adapters/mongoose-adapter";
import { SequelizeAdapter } from "../orm/adapters/sequelize-adapter";

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
 * Uses the adapter pattern to support multiple ORMs (Mongoose, Sequelize, etc.)
 * without circular dependencies. Adapters are imported from separate files in
 * the orm/ folder.
 */
export abstract class BaseRepository<D, I, O> implements Repository<D, I, O> {
  private adapter: ORMAdapter<D, I, O>;

  constructor(config: BaseRepositoryConfig<D>) {
    if (isMongooseConfig<D>(config)) {
      // TypeScript knows config is MongooseRepositoryConfig<D>
      this.adapter = new MongooseAdapter<D, I, O>(config);
    } else if (isSequelizeConfig(config)) {
      // TypeScript knows config is SequelizeRepositoryConfig
      this.adapter = new SequelizeAdapter<Model, I, O>(config);
    } else {
      // Exhaustiveness check - should never reach here with proper types
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
    return this.adapter instanceof MongooseAdapter;
  }

  public isSequelize(): boolean {
    return this.adapter instanceof SequelizeAdapter;
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
