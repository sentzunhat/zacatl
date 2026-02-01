// Type-only imports prevent eager loading in ESM
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
 * Abstract base repository supporting multiple ORMs via adapter pattern.
 * Adapters are lazy-loaded for optimal bundle size.
 */
export abstract class BaseRepository<D, I, O> implements Repository<D, I, O> {
  private adapter?: ORMAdapter<D, I, O>;
  private readonly ormType: ORMType;
  private readonly config: BaseRepositoryConfig<D>;
  private initPromise?: Promise<void>;

  constructor(config: BaseRepositoryConfig<D>) {
    this.ormType = config.type;
    this.config = config;
  }

  /**
   * Ensures the adapter is initialized before any operation
   * Uses a promise to prevent multiple concurrent initializations
   */
  private async ensureInitialized(): Promise<void> {
    if (this.adapter) return;

    if (!this.initPromise) {
      this.initPromise = this.loadAdapter();
    }

    await this.initPromise;
  }

  /**
   * Loads the appropriate ORM adapter based on configuration
   */
  private async loadAdapter(): Promise<void> {
    if (isMongooseConfig<D>(this.config)) {
      this.adapter = await loadMongooseAdapter<D, I, O>(this.config);
    } else if (isSequelizeConfig(this.config)) {
      // Type assertion needed here because D could be either Mongoose or Sequelize model
      this.adapter = (await loadSequelizeAdapter<Model, I, O>(
        this.config,
      )) as ORMAdapter<D, I, O>;
    } else {
      const exhaustive: never = this.config;
      throw new Error(
        `Invalid repository configuration. Received: ${JSON.stringify(exhaustive)}`,
      );
    }
  }

  get model(): MongooseModel<D> | ModelStatic<any> {
    if (!this.adapter) {
      throw new Error(
        "Repository not initialized. Call an async method first or await repository.ensureInitialized()",
      );
    }
    return this.adapter.model;
  }

  public isMongoose(): boolean {
    return this.ormType === ORMType.Mongoose;
  }

  public isSequelize(): boolean {
    return this.ormType === ORMType.Sequelize;
  }

  public getMongooseModel(): MongooseModel<D> {
    if (!this.adapter) {
      throw new Error(
        "Repository not initialized. Call an async method first or await repository.ensureInitialized()",
      );
    }
    if (!this.isMongoose()) {
      throw new Error("Repository is not using Mongoose");
    }
    return this.adapter.model as MongooseModel<D>;
  }

  public getSequelizeModel(): ModelStatic<any> {
    if (!this.adapter) {
      throw new Error(
        "Repository not initialized. Call an async method first or await repository.ensureInitialized()",
      );
    }
    if (!this.isSequelize()) {
      throw new Error("Repository is not using Sequelize");
    }
    return this.adapter.model as ModelStatic<any>;
  }

  public toLean(input: unknown): O | null {
    if (!this.adapter) {
      throw new Error(
        "Repository not initialized. Call an async method first or await repository.ensureInitialized()",
      );
    }
    return this.adapter.toLean(input);
  }

  async findById(id: string): Promise<O | null> {
    await this.ensureInitialized();
    return this.adapter!.findById(id);
  }

  async create(entity: I): Promise<O> {
    await this.ensureInitialized();
    return this.adapter!.create(entity);
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    await this.ensureInitialized();
    return this.adapter!.update(id, update);
  }

  async delete(id: string): Promise<O | null> {
    await this.ensureInitialized();
    return this.adapter!.delete(id);
  }
}
