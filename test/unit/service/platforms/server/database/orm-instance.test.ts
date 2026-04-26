import { afterEach, describe, expect, it } from 'vitest';

import { InternalServerError } from '@zacatl/error';

import { clearContainer, resolveDependency } from '../../../../../../src/dependency-injection';
import { MongooseToken } from '../../../../../../src/service/layers/infrastructure/orm/tokens/mongoose';
import { NodeSqliteToken } from '../../../../../../src/service/layers/infrastructure/orm/tokens/nodesqlite';
import { SequelizeToken } from '../../../../../../src/service/layers/infrastructure/orm/tokens/sequelize';
import {
  getOrmInstance,
  registerOrmInstance,
} from '../../../../../../src/service/platforms/server/database/orm-instance';
import { DatabaseVendor, type DatabaseInstance } from '../../../../../../src/service/platforms/server/database/port';

describe('orm-instance helpers', () => {
  afterEach(() => {
    clearContainer();
  });

  describe('getOrmInstance()', () => {
    it('throws InternalServerError when the ORM token is not registered', () => {
      expect(() => getOrmInstance(MongooseToken)).toThrow(InternalServerError);
      expect(() => getOrmInstance(MongooseToken)).toThrow(/ORM instance not registered/);
    });

    it('returns the instance previously registered for the token', () => {
      const mongooseInstance = { kind: 'mongoose' } as unknown as DatabaseInstance;

      registerOrmInstance(DatabaseVendor.MONGOOSE, mongooseInstance);

      expect(getOrmInstance(MongooseToken)).toBe(mongooseInstance);
    });
  });

  describe('registerOrmInstance()', () => {
    it.each([
      [DatabaseVendor.MONGOOSE, MongooseToken, { kind: 'mongoose' } as unknown as DatabaseInstance],
      [DatabaseVendor.SEQUELIZE, SequelizeToken, { kind: 'sequelize' } as unknown as DatabaseInstance],
      [DatabaseVendor.SQLITE, NodeSqliteToken, { kind: 'sqlite' } as unknown as DatabaseInstance],
    ])('binds %s instances to the DI container', (vendor, token, instance) => {
      registerOrmInstance(vendor, instance);

      expect(resolveDependency(token)).toBe(instance);
    });

    it.each([undefined, null])('is a no-op when instance is %s', (instance) => {
      registerOrmInstance(DatabaseVendor.MONGOOSE, instance as never);

      expect(() => getOrmInstance(MongooseToken)).toThrow(/ORM instance not registered/);
    });
  });
});
