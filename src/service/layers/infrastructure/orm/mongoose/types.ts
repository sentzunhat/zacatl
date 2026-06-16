import type {
  Default__v,
  Document,
  IfAny,
  ObjectId,
  Require_id,
} from '../../../../../third-party/mongoose';
import type { LeanDocument } from '../types';

export { ORMType } from '../types';
export type { LeanDocument } from '../types';

export type WithMongooseMeta<T> = Default__v<Require_id<T>>;

export type MongooseDocument<Db> = Document<
  ObjectId,
  Record<string, unknown>,
  Db,
  Record<string, string>
> &
  WithMongooseMeta<Db>;

export type LeanWithMeta<T extends object = Record<string, unknown>> = LeanDocument<T>;

export type MongooseDoc<Db> = IfAny<
  MongooseDocument<Db>,
  MongooseDocument<Db>,
  MongooseDocument<Db>
>;

export type ToLeanInput<D, T extends object = Record<string, unknown>> =
  | MongooseDoc<D>
  | LeanDocument<T>
  | null
  | undefined;
