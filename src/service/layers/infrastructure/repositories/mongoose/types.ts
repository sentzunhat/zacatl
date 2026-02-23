import type {
  Document,
  MongooseModel,
  Schema,
  Default__v,
  Require_id,
  ObjectId,
  IfAny,
} from "../../../../../third-party/mongoose";

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

export type MongooseDoc<Db> = IfAny<
  MongooseDocument<Db>,
  MongooseDocument<Db>,
  MongooseDocument<Db>
>;

export type ToLeanInput<D, T> =
  | MongooseDoc<D>
  | (T & {
      id: string;
      createdAt: Date;
      updatedAt: Date;
    })
  | null
  | undefined;

export interface MongooseRepositoryConfig<D = unknown> {
  readonly type?: ORMType.Mongoose;
  readonly name?: string;
  readonly schema: Schema<D>;
}

export type MongooseBaseRepositoryConfig<D = unknown> =
  MongooseRepositoryConfig<D> & {
    readonly type: ORMType.Mongoose;
  };

/** Model types for Mongoose ORM */
export type MongooseRepositoryModel<D> = MongooseModel<D>;
