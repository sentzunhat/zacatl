import type { QueryFilter } from '@zacatl/third-party/databases/mongoose';

import type { MongooseRepositoryConfig, MongooseRepositoryModel } from './types';
import { createMongooseAdapter } from '../../orm/mongoose/adapter-loader';
import { BaseRepository as BaseRepositoryImpl } from '../base-repository';

/**
 * Mongoose Repository - delegates to MongooseAdapter
 *
 * Provides all repository operations for Mongoose ORM.
 * Extends the shared generic BaseRepository with Mongoose-specific type parameters.
 */
export abstract class BaseRepository<D, I extends object, O extends object>
  extends BaseRepositoryImpl<MongooseRepositoryModel<D>, I, O, QueryFilter<D>>
{
  constructor(config: MongooseRepositoryConfig<D>) {
    super(createMongooseAdapter<D, I, O>(config));
  }
}
