import {
  Document,
  Model as MongooseModel,
  Schema,
  Default__v,
  Require_id,
  ObjectId,
  IfAny,
} from "mongoose";
import { Model as SequelizeModel, ModelCtor, Model } from "sequelize";

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

export type MongooseRepositoryConfig<D> = {
  type: "mongoose";
  name?: string;
  schema: Schema<D>;
};

export type SequelizeRepositoryConfig<D extends Model> = {
  type: "sequelize";
  model: ModelCtor<D>;
};

export type BaseRepositoryConfig<D> =
  | MongooseRepositoryConfig<D>
  | SequelizeRepositoryConfig<D extends Model ? D : never>;

export type Repository<D, T> = {
  model: MongooseModel<D> | ModelCtor<SequelizeModel<any, any>>;

  toLean(input: any): LeanDocument<T> | null;
  findById(id: string): Promise<LeanDocument<T> | null>;
  create(entity: D): Promise<LeanDocument<T>>;
  update(id: string, update: Partial<D>): Promise<LeanDocument<T> | null>;
  delete(id: string): Promise<LeanDocument<T> | null>;
};
