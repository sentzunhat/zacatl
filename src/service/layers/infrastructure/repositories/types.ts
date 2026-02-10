import type {
  Document,
  MongooseModel,
  Schema,
  Default__v,
  Require_id,
  ObjectId,
  IfAny,
} from "../../../../third-party/mongoose";
import type {
  ModelStatic,
  SequelizeModel as Model,
} from "../../../../third-party/sequelize";

export enum ORMType {
  Mongoose = "mongoose",
  Sequelize = "sequelize",
}

export type WithMongooseMeta<T> = Default__v<Require_id<T>>;

export type MongooseDocument<Db> = Document<
  ObjectId,
  {}, // eslint-disable-line @typescript-eslint/no-empty-object-type
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

export type MongooseRepositoryConfig<D = unknown> = {
  readonly type: ORMType.Mongoose;
  readonly name?: string;
  readonly schema: Schema<D>;
};

export type SequelizeRepositoryConfig<D extends object> = {
  readonly type: ORMType.Sequelize;
  readonly model: ModelStatic<Model<D>>;
};

export type BaseRepositoryConfig<D = unknown> =
  | MongooseRepositoryConfig<D>
  | SequelizeRepositoryConfig<Model>;

/** Model types for each ORM */
export type MongooseRepositoryModel<D> = MongooseModel<D>;
export type SequelizeRepositoryModel = ModelStatic<Model>;

/** Union of all supported model types */
export type RepositoryModel<D> =
  | MongooseRepositoryModel<D>
  | SequelizeRepositoryModel;

/** ORM adapter interface - implemented by Mongoose and Sequelize adapters */
export interface ORMPort<D, I, O> {
  readonly model: RepositoryModel<D>;
  toLean(input: unknown): O | null;
  findById(id: string): Promise<O | null>;
  findMany(filter?: Record<string, unknown>): Promise<O[]>;
  create(entity: I): Promise<O>;
  update(id: string, update: Partial<I>): Promise<O | null>;
  delete(id: string): Promise<O | null>;
  exists(id: string): Promise<boolean>;
}

/** Repository contract - public interface for consumers */
export type RepositoryPort<D, I, O> = {
  model: RepositoryModel<D>;
  toLean(input: unknown): O | null;
  findById(id: string): Promise<O | null>;
  findMany(filter?: Record<string, unknown>): Promise<O[]>;
  create(entity: I): Promise<O>;
  update(id: string, update: Partial<I>): Promise<O | null>;
  delete(id: string): Promise<O | null>;
  exists(id: string): Promise<boolean>;
};
