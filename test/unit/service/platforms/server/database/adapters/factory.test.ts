import { describe, expect, it } from 'vitest';

import { CustomError } from '@zacatl/error';

import {
  MongooseAdapter,
  SequelizeAdapter,
  SqliteAdapter,
  createDatabaseAdapter,
} from '../../../../../../../src/service/platforms/server/database/adapters/factory';
import { DatabaseVendor } from '../../../../../../../src/service/platforms/server/database/port';

describe('createDatabaseAdapter()', () => {
  it.each([
    [DatabaseVendor.MONGOOSE, MongooseAdapter],
    [DatabaseVendor.SEQUELIZE, SequelizeAdapter],
    [DatabaseVendor.SQLITE, SqliteAdapter],
  ])('returns a %s adapter instance', (vendor, AdapterClass) => {
    const adapter = createDatabaseAdapter(vendor);

    expect(adapter).toBeInstanceOf(AdapterClass);
  });

  it('throws CustomError for unsupported vendors', () => {
    expect(() => createDatabaseAdapter('UNKNOWN' as DatabaseVendor)).toThrow(CustomError);
    expect(() => createDatabaseAdapter('UNKNOWN' as DatabaseVendor)).toThrow(
      /Unsupported database vendor/,
    );
  });
});
