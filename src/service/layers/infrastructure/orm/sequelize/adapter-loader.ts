import type { WhereOptions } from '@zacatl/third-party/sequelize';

import { SequelizeAdapter } from './adapter';
import type {
  ORMPort,
  SequelizeRepositoryConfig,
  SequelizeRepositoryModel,
} from '../../repositories/types';

/**
 * Creates a Sequelize adapter.
 *
 * The adapter resolves the shared Sequelize instance from the DI container
 * via {@link SequelizeToken}, so a lazy import wrapper is unnecessary.
 *
 * @param config Sequelize repository configuration
 * @returns ORMPort implementation for Sequelize
 */
export const createSequelizeAdapter = <D extends object, I extends object, O extends object>(
  config: SequelizeRepositoryConfig<D>,
): ORMPort<SequelizeRepositoryModel<D>, I, O, WhereOptions<D>> => {
  return new SequelizeAdapter<D, I, O>(config);
};
