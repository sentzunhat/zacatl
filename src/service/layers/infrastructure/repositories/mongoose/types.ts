import type { MongooseModel, Schema } from '../../../../../third-party/databases/mongoose';
import type { ConnectionRef } from '../../../../platforms/server/database/port';
import type { MongooseRepositoryIndexOptions } from '../../orm/mongoose/index-policy';
import type { ORMType } from '../../orm/types';

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
  /** Which database connection to use; omit for single-database default */
  readonly connection?: ConnectionRef;
  /** Optional per-repository override for Mongoose index boot behavior. */
  readonly indexes?: MongooseRepositoryIndexOptions;
}

export type MongooseBaseRepositoryConfig<D = unknown> = MongooseRepositoryConfig<D> & {
  readonly type: ORMType.Mongoose;
};

/** Model types for Mongoose ORM */
export type MongooseRepositoryModel<D> = MongooseModel<D>;
