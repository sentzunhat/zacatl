import type { QueryFilter } from '@zacatl/third-party/databases/mongoose';

import { MongooseAdapter } from './adapter';
import type {
  MongooseRepositoryConfig,
  MongooseRepositoryModel,
  ORMPort,
} from '../../repositories/types';

/**
 * Creates a Mongoose adapter.
 *
 * The adapter resolves the shared Mongoose instance from the DI container
 * via the canonical `createDatabaseToken('MONGOOSE', connectionName)` token.
 *
 * @param config Mongoose repository configuration
 * @returns ORMPort implementation for Mongoose
 */
export const createMongooseAdapter = <D, I extends object, O extends object>(
  config: MongooseRepositoryConfig<D>,
): ORMPort<MongooseRepositoryModel<D>, I, O, QueryFilter<D>> => {
  return new MongooseAdapter<D, I, O>(config);
};
