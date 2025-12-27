import { Model as MongooseModel } from "mongoose";
import { ModelStatic } from "sequelize";
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

export abstract class BaseRepository<D, I, O> implements Repository<D, I, O> {
  private implementation: Repository<D, I, O>;

  constructor(config: BaseRepositoryConfig<D>) {
    if (config.type === "mongoose") {
      this.implementation = new MongooseRepository(config);
    } else if (config.type === "sequelize") {
      this.implementation = new SequelizeRepository(
        config as any
      ) as unknown as Repository<D, I, O>;
    } else {
      // Backward compatibility: if type is missing but schema is present, assume Mongoose
      if ("schema" in config) {
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

  get model(): MongooseModel<D> | ModelStatic<any> {
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

  public getSequelizeModel(): ModelStatic<any> {
    if (!this.isSequelize()) {
      throw new Error("Repository is not using Sequelize");
    }
    return this.implementation.model as ModelStatic<any>;
  }

  public toLean(input: unknown): O | null {
    return this.implementation.toLean(input);
  }

  async findById(id: string): Promise<O | null> {
    return this.implementation.findById(id);
  }

  async create(entity: I): Promise<O> {
    return this.implementation.create(entity);
  }

  async update(id: string, update: Partial<I>): Promise<O | null> {
    return this.implementation.update(id, update);
  }

  async delete(id: string): Promise<O | null> {
    return this.implementation.delete(id);
  }
}
