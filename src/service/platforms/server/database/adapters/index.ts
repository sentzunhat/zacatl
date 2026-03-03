// @barrel-generated
export { MongooseAdapter } from './mongoose';
export { SequelizeAdapter } from './sequelize';
export { SqliteAdapter } from './sqlite';

import { CustomError } from '@zacatl/error';

import { MongooseAdapter as _MongooseAdapter } from './mongoose';
import type { DatabaseServerPort } from '../port';
import { DatabaseVendor } from '../port';
import { SequelizeAdapter as _SequelizeAdapter } from './sequelize';
import { SqliteAdapter as _SqliteAdapter } from './sqlite';

export const createDatabaseAdapter = (vendor: DatabaseVendor): DatabaseServerPort => {
  switch (vendor) {
    case DatabaseVendor.MONGOOSE:
      return new _MongooseAdapter();
    case DatabaseVendor.SEQUELIZE:
      return new _SequelizeAdapter();
    case DatabaseVendor.SQLITE:
      return new _SqliteAdapter();
    default:
      throw new CustomError({
        message: `Unsupported database vendor: ${vendor}`,
        code: 500,
        reason: 'database vendor not supported',
      });
  }
};
