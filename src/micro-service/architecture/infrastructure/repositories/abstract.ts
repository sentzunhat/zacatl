import { Model as MongooseModel } from "mongoose";
import { ModelCtor } from "sequelize";
import {
  BaseRepositoryConfig,
  Repository,
  LeanDocument,
  ToLeanInput,
  MongooseRepositoryConfig,
} from "./types";
import { MongooseRepository } from "./mongoose";
import { SequelizeRepository } from "./sequelize";

export * from "./types";

export abstract class BaseRepository<D, T> implements Repository<D, T> {
  private implementation: Repository<D, T>;

  constructor(config: BaseRepositoryConfig<D>) {
    if (config.type === "mongoose") {
      this.implementation = new MongooseRepository(config);
    } else if (config.type === "sequelize") {
      this.implementation = new SequelizeRepository(
        config as any
      ) as unknown as Repository<D, T>;
    } else {
      // Backward compatibility: if type is missing but schema is present, assume Mongoose
      if ((config as any).schema) {
        const mongooseConfig: MongooseRepositoryConfig<D> = {
          type: "mongoose",
          name: (config as any).name,
          schema: (config as any).schema,
        };
        this.implementation = new MongooseRepository(mongooseConfig);
      } else {
        throw new Error(
          "Invalid repository configuration: 'type' must be 'mongoose' or 'sequelize'"
        );
      }
    }
  }

  get model(): MongooseModel<D> | ModelCtor<any> {
    return this.implementation.model;
  }

  public isMongoose(): boolean {
    return this.implementation instanceof MongooseRepository;
  }

  public isSequelize(): boolean {
    return this.implementation instanceof SequelizeRepository;
  }

  public getMongooseModel(): MongooseModel<D> {
    if (!this.isMongoose()) {
      throw new Error("Repository is not using Mongoose");
    }
    return this.implementation.model as MongooseModel<D>;
  }

  public getSequelizeModel(): ModelCtor<any> {
    if (!this.isSequelize()) {
      throw new Error("Repository is not using Sequelize");
    }
    return this.implementation.model as ModelCtor<any>;
  }

  public toLean(input: ToLeanInput<D, T>): LeanDocument<T> | null {
    return this.implementation.toLean(input);
  }

  async findById(id: string): Promise<LeanDocument<T> | null> {
    return this.implementation.findById(id);
  }

  async create(entity: D): Promise<LeanDocument<T>> {
    return this.implementation.create(entity);
  }

  async update(
    id: string,
    update: Partial<D>
  ): Promise<LeanDocument<T> | null> {
    return this.implementation.update(id, update);
  }

  async delete(id: string): Promise<LeanDocument<T> | null> {
    return this.implementation.delete(id);
  }
}
