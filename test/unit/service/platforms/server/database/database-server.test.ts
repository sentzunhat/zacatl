import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockConnect = vi.fn();
const mockDisconnect = vi.fn();
const mockAdapter = {
  connect: mockConnect,
  disconnect: mockDisconnect,
};

vi.mock('../../../../../../src/service/platforms/server/database/adapters/factory', () => ({
  createDatabaseAdapter: vi.fn(() => mockAdapter),
}));

import { createDatabaseAdapter } from '../../../../../../src/service/platforms/server/database/adapters/factory';
import { DatabaseServer } from '../../../../../../src/service/platforms/server/database/database-server';
import {
  DatabaseVendor,
  type DatabaseConfig,
} from '../../../../../../src/service/platforms/server/database/port';
import { CustomError } from '@zacatl/error';

describe('DatabaseServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConnect.mockResolvedValue(undefined);
    mockDisconnect.mockResolvedValue(undefined);
  });

  describe('configure()', () => {
    it('does nothing when no databases are configured', async () => {
      const server = new DatabaseServer('svc', []);

      await server.configure();

      expect(createDatabaseAdapter).not.toHaveBeenCalled();
    });

    it('throws when connection string is missing', async () => {
      const server = new DatabaseServer('svc', [
        { vendor: DatabaseVendor.SEQUELIZE, connectionString: '' } as DatabaseConfig,
      ]);

      await expect(server.configure()).rejects.toBeInstanceOf(CustomError);
    });

    it('connects each configured database via vendor adapter', async () => {
      const databases: DatabaseConfig[] = [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          connectionString: 'postgres://localhost/db',
        },
        {
          vendor: DatabaseVendor.MONGOOSE,
          connectionString: 'mongodb://localhost/db',
        },
      ];

      const server = new DatabaseServer('svc', databases);

      await server.configure();

      expect(createDatabaseAdapter).toHaveBeenCalledTimes(2);
      expect(createDatabaseAdapter).toHaveBeenCalledWith(DatabaseVendor.SEQUELIZE);
      expect(createDatabaseAdapter).toHaveBeenCalledWith(DatabaseVendor.MONGOOSE);
      expect(mockConnect).toHaveBeenCalledTimes(2);
      expect(mockConnect).toHaveBeenCalledWith('svc', databases[0]);
      expect(mockConnect).toHaveBeenCalledWith('svc', databases[1]);
    });

    it('wraps adapter connect failures in CustomError', async () => {
      mockConnect.mockRejectedValueOnce(new Error('connect failed'));

      const server = new DatabaseServer('svc', [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          connectionString: 'postgres://localhost/db',
        },
      ]);

      await expect(server.configure()).rejects.toBeInstanceOf(CustomError);
    });
  });

  describe('adapter accessors', () => {
    it('getAdapter() returns adapter for configured vendor', async () => {
      const server = new DatabaseServer('svc', [
        {
          vendor: DatabaseVendor.SQLITE,
          connectionString: ':memory:',
        },
      ]);

      await server.configure();

      expect(server.getAdapter(DatabaseVendor.SQLITE)).toBe(mockAdapter);
      expect(server.getAdapter(DatabaseVendor.MONGOOSE)).toBeUndefined();
    });

    it('getAdapters() returns all configured adapters', async () => {
      const server = new DatabaseServer('svc', [
        {
          vendor: DatabaseVendor.SQLITE,
          connectionString: ':memory:',
        },
      ]);

      await server.configure();

      expect(server.getAdapters().get(DatabaseVendor.SQLITE)).toBe(mockAdapter);
    });
  });

  describe('disconnect()', () => {
    it('disconnects all configured adapters', async () => {
      const server = new DatabaseServer('svc', [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          connectionString: 'postgres://localhost/db',
        },
        {
          vendor: DatabaseVendor.MONGOOSE,
          connectionString: 'mongodb://localhost/db',
        },
      ]);

      await server.configure();
      await server.disconnect();

      expect(mockDisconnect).toHaveBeenCalledTimes(2);
    });
  });
});
