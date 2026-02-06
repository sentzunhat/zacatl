import { InternalServerError } from "@zacatl/error";

import {
  BaseRepositoryConfig,
  RepositoryPort,
  MongooseRepositoryConfig,
  SequelizeRepositoryConfig,
  ORMPort,
  ORMType,
} from "./types";
import type { MongooseModel } from "../../../../third-party/mongoose";
import type {
  SequelizeModel as Model,
  ModelStatic,
} from "../../../../third-party/sequelize";
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
 * Abstract base repository supporting multiple ORMs via adapter pattern
 */
export abstract class BaseRepository<D, I, O> implements RepositoryPort<
  D,
  I,
  O
> {
  private adapter?: ORMPort<D, I, O>;
  private readonly ormType: ORMType;
  private readonly config: BaseRepositoryConfig<D>;
  private initPromise?: Promise<void>;

  constructor(config: BaseRepositoryConfig<D>) {
    this.ormType = config.type;
    this.config = config;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.adapter) return;

    if (!this.initPromise) {
      this.initPromise = this.loadAdapter();
    }

    await this.initPromise;
  }

  private async loadAdapter(): Promise<void> {
    if (isMongooseConfig<D>(this.config)) {
      this.adapter = await loadMongooseAdapter<D, I, O>(this.config);
    } else if (isSequelizeConfig(this.config)) {
      // Type assertion: D could be Mongoose or Sequelize model
      this.adapter = (await loadSequelizeAdapter<Model, I, O>(
        this.config,
      )) as ORMPort<D, I, O>;
    } else {
      const exhaustive: never = this.config;
      throw new InternalServerError({
        message: `Invalid repository configuration. Received: ${JSON.stringify(exhaustive)}`,
        reason: "Repository config doesn't match Mongoose or Sequelize format",
        component: "AbstractRepository",
        operation: "ensureInitialized",
        metadata: { config: exhaustive },
      });
    }
  }

  get model(): MongooseModel<D> | ModelStatic<any> {
    if (!this.adapter) {
      throw new InternalServerError({
        message:
          "Repository not initialized. Call an async method first or await repository.ensureInitialized()",
        reason: "Attempted to access model before repository initialization",
        component: "AbstractRepository",
        operation: "model",
      });
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
      throw new InternalServerError({
        message:
          "Repository not initialized. Call an async method first or await repository.ensureInitialized()",
        reason:
          "Attempted to access Mongoose model before repository initialization",
        component: "AbstractRepository",
        operation: "getMongooseModel",
      });
    }
    if (!this.isMongoose()) {
      throw new InternalServerError({
        message: "Repository is not using Mongoose",
        reason: "Cannot get Mongoose model from non-Mongoose repository",
        component: "AbstractRepository",
        operation: "getMongooseModel",
        metadata: { ormType: this.ormType },
      });
    }
    return this.adapter.model as MongooseModel<D>;
  }

  public getSequelizeModel(): ModelStatic<any> {
    if (!this.adapter) {
      throw new InternalServerError({
        message:
          "Repository not initialized. Call an async method first or await repository.ensureInitialized()",
        reason:
          "Attempted to access Sequelize model before repository initialization",
        component: "AbstractRepository",
        operation: "getSequelizeModel",
      });
    }
    if (!this.isSequelize()) {
      throw new InternalServerError({
        message: "Repository is not using Sequelize",
        reason: "Cannot get Sequelize model from non-Sequelize repository",
        component: "AbstractRepository",
        operation: "getSequelizeModel",
        metadata: { ormType: this.ormType },
      });
    }
    return this.adapter.model as ModelStatic<any>;
  }

  public toLean(input: unknown): O | null {
    if (!this.adapter) {
      throw new InternalServerError({
        message:
          "Repository not initialized. Call an async method first or await repository.ensureInitialized()",
        reason: "Attempted to call toLean before repository initialization",
        component: "AbstractRepository",
        operation: "toLean",
      });
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
