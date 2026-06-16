import type { MongooseModel, Schema } from '../../../../../third-party/mongoose';

export enum ORMType {
  Mongoose = 'mongoose',
  Sequelize = 'sequelize',
  NodeSqlite = 'nodesqlite',
}

export type {
  WithMongooseMeta,
  LeanDocument,
  LeanWithMeta,
  MongooseDoc,
  ToLeanInput,
} from '../../orm/mongoose/types';

export interface MongooseRepositoryConfig<D = unknown> {
  readonly type?: ORMType.Mongoose;
  readonly name: string;
  readonly schema: Schema<D>;
}

export type MongooseBaseRepositoryConfig<D = unknown> = MongooseRepositoryConfig<D> & {
  readonly type: ORMType.Mongoose;
};

/** Model types for Mongoose ORM */
export type MongooseRepositoryModel<D> = MongooseModel<D>;
