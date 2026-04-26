import { CustomError } from '@zacatl/error';

import type { DatabaseServerPort } from '../port';
import { DatabaseVendor } from '../port';
import { MongooseAdapter } from './mongoose';
import { SequelizeAdapter } from './sequelize';
import { SqliteAdapter } from './sqlite';

export { MongooseAdapter } from './mongoose';
export { SequelizeAdapter } from './sequelize';
export { SqliteAdapter } from './sqlite';

export const createDatabaseAdapter = (vendor: DatabaseVendor): DatabaseServerPort => {
  switch (vendor) {
    case DatabaseVendor.MONGOOSE:
      return new MongooseAdapter();
    case DatabaseVendor.SEQUELIZE:
      return new SequelizeAdapter();
    case DatabaseVendor.SQLITE:
      return new SqliteAdapter();
    default:
      throw new CustomError({
        message: `Unsupported database vendor: ${vendor}`,
        code: 500,
        reason: 'database vendor not supported',
      });
  }
};
