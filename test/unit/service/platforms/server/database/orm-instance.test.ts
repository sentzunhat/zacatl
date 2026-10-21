import { afterEach, describe, expect, it } from 'vitest';

import { InternalServerError } from '@zacatl/error';

import { clearContainer, getContainer, resolveDependency } from '../../../../../../src/third-party/dependency-injection/container';
import { createDatabaseToken } from '../../../../../../src/service/layers/infrastructure/orm/tokens/factory';
import {
  getOrmInstance,
  registerOrmInstance,
} from '../../../../../../src/service/platforms/server/database/orm-instance';
import { DatabaseVendor, type DatabaseInstance, type DatabaseConnection } from '../../../../../../src/service/platforms/server/database/port';

describe('orm-instance helpers', () => {
  afterEach(() => {
    clearContainer();
  });

  describe('getOrmInstance()', () => {
    it('throws InternalServerError when the ORM token is not registered', () => {
      expect(() => getOrmInstance(createDatabaseToken('MONGOOSE', 'MONGOOSE'))).toThrow(InternalServerError);
      expect(() => getOrmInstance(createDatabaseToken('MONGOOSE', 'MONGOOSE'))).toThrow(/ORM instance not registered/);
    });

    it('returns the instance previously registered for the token', () => {
      const mongooseInstance = { kind: 'mongoose' } as unknown as DatabaseInstance;
      const connection: DatabaseConnection = { url: 'mongodb://localhost/test', name: DatabaseVendor.MONGOOSE };

      registerOrmInstance(DatabaseVendor.MONGOOSE, connection, mongooseInstance);

      expect(getOrmInstance(createDatabaseToken('MONGOOSE', 'MONGOOSE'))).toBe(mongooseInstance);
    });
  });

  describe('registerOrmInstance()', () => {
    it.each([
      [DatabaseVendor.MONGOOSE, createDatabaseToken('MONGOOSE', 'MONGOOSE'), { kind: 'mongoose' } as unknown as DatabaseInstance],
      [DatabaseVendor.SEQUELIZE, createDatabaseToken('SEQUELIZE', 'SEQUELIZE'), { kind: 'sequelize' } as unknown as DatabaseInstance],
      [DatabaseVendor.SQLITE, createDatabaseToken('SQLITE', 'SQLITE'), { kind: 'sqlite' } as unknown as DatabaseInstance],
    ])('binds %s instances to the DI container', (vendor, token, instance) => {
      // Use vendor string as the name to match the default token (createDatabaseToken('VENDOR', 'VENDOR'))
      const connection: DatabaseConnection = { url: `${vendor.toLowerCase()}://test`, name: vendor };
      registerOrmInstance(vendor, connection, instance);

      expect(resolveDependency(token)).toBe(instance);
    });

    it('registers only the canonical package-scoped symbol', () => {
      const instance = { kind: 'sequelize' } as unknown as DatabaseInstance;
      registerOrmInstance(
        DatabaseVendor.SEQUELIZE,
        { url: 'sqlite::memory:', name: DatabaseVendor.SEQUELIZE },
        instance,
      );

      expect(getContainer().isRegistered(Symbol.for('db:SEQUELIZE:SEQUELIZE'), false)).toBe(false);
      expect(resolveDependency(createDatabaseToken('SEQUELIZE', 'SEQUELIZE'))).toBe(instance);
    });

    it.each([undefined, null])('is a no-op when instance is %s', (instance) => {
      const connection: DatabaseConnection = { url: 'mongodb://localhost/test', name: DatabaseVendor.MONGOOSE };
      registerOrmInstance(DatabaseVendor.MONGOOSE, connection, instance as never);

      expect(() => getOrmInstance(createDatabaseToken('MONGOOSE', 'MONGOOSE'))).toThrow(/ORM instance not registered/);
    });
  });
});
