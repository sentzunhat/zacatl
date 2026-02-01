import {
  Document,
  Model as MongooseModel,
  Schema,
  Default__v,
  Require_id,
  ObjectId,
  IfAny,
} from "mongoose";
import { Model as SequelizeModel, ModelStatic, Model } from "sequelize";

/**
 * Enum for supported ORM types
 */
export enum ORMType {
  Mongoose = "mongoose",
  Sequelize = "sequelize",
}

export type WithMongooseMeta<T> = Default__v<Require_id<T>>;

export type MongooseDocument<Db> = Document<
  ObjectId,
  {},
  Db,
  Record<string, string>
> &
  WithMongooseMeta<Db>;

export type LeanWithMeta<T> = WithMongooseMeta<T> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type LeanDocument<T> = T & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MongooseDoc<Db> = IfAny<
  MongooseDocument<Db>,
  MongooseDocument<Db>,
  MongooseDocument<Db>
>;

export type ToLeanInput<D, T> =
  | MongooseDoc<D>
  | LeanDocument<T>
  | null
  | undefined;

/**
 * Configuration for Mongoose-based repository
 * @template D - Database document type
 */
export type MongooseRepositoryConfig<D = unknown> = {
  readonly type: ORMType.Mongoose;
  readonly name?: string;
  readonly schema: Schema<D>;
};

/**
 * Configuration for Sequelize-based repository
 * @template D - Sequelize Model type (must extend Model)
 */
export type SequelizeRepositoryConfig<D extends Model = Model> = {
  readonly type: ORMType.Sequelize;
  readonly model: ModelStatic<D>;
};

/**
 * Discriminated union of all repository configuration types
 * @template D - Database/Model type
 */
export type BaseRepositoryConfig<D = unknown> =
  | MongooseRepositoryConfig<D>
  | SequelizeRepositoryConfig<Model>;

export type Repository<D, I, O> = {
  model: MongooseModel<D> | ModelStatic<SequelizeModel<any, any>>;

  toLean(input: unknown): O | null;
  findById(id: string): Promise<O | null>;
  create(entity: I): Promise<O>;
  update(id: string, update: Partial<I>): Promise<O | null>;
  delete(id: string): Promise<O | null>;
};

/**
 * ORM Adapter Interface - Defines the contract for ORM-specific implementations
 * This enables pluggable ORM support without circular dependencies
 */
export interface ORMAdapter<D, I, O> {
  /**
   * Get the underlying ORM model
   */
  readonly model: MongooseModel<D> | ModelStatic<any>;

  /**
   * Transform database entity to plain lean object
   */
  toLean(input: unknown): O | null;

  /**
   * Find entity by ID
   */
  findById(id: string): Promise<O | null>;

  /**
   * Create new entity
   */
  create(entity: I): Promise<O>;

  /**
   * Update existing entity
   */
  update(id: string, update: Partial<I>): Promise<O | null>;

  /**
   * Delete entity by ID
   */
  delete(id: string): Promise<O | null>;
}
