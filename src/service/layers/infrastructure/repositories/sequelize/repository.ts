import type { WhereOptions } from '@zacatl/third-party/databases/sequelize';

import type { SequelizeRepositoryConfig, SequelizeRepositoryModel } from './types';
import { createSequelizeAdapter } from '../../orm/sequelize/adapter-loader';
import { BaseRepository as BaseRepositoryImpl } from '../base-repository';

/**
 * Sequelize Repository - delegates to SequelizeAdapter
 *
 * Provides all repository operations for Sequelize ORM.
 * Extends the shared generic BaseRepository with Sequelize-specific type parameters.
 */
export abstract class BaseRepository<
  D extends object,
  I extends object,
  O extends object,
> extends BaseRepositoryImpl<SequelizeRepositoryModel<D>, I, O, WhereOptions<D>>
{
  constructor(config: SequelizeRepositoryConfig) {
    super(createSequelizeAdapter<D, I, O>(config));
  }
}
