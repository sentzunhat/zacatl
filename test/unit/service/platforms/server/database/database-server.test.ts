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

import { CustomError } from '@zacatl/error';

import { createDatabaseAdapter } from '../../../../../../src/service/platforms/server/database/adapters/factory';
import { DatabaseServer } from '../../../../../../src/service/platforms/server/database/database-server';
import {
  DatabaseVendor,
  type DatabaseConfig,
} from '../../../../../../src/service/platforms/server/database/port';

describe('DatabaseServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createDatabaseAdapter).mockReset().mockReturnValue(mockAdapter);
    mockConnect.mockResolvedValue(undefined);
    mockDisconnect.mockResolvedValue(undefined);
  });

  describe('configure()', () => {
    it('does nothing when no databases are configured', async () => {
      const server = new DatabaseServer('svc', []);

      await server.configure();

      expect(createDatabaseAdapter).not.toHaveBeenCalled();
    });

    it('throws when connection URL is missing', async () => {
      const server = new DatabaseServer('svc', [
        { vendor: DatabaseVendor.SEQUELIZE, connection: { url: '' } } as DatabaseConfig,
      ]);

      await expect(server.configure()).rejects.toBeInstanceOf(CustomError);
    });

    it('wraps missing connection metadata without masking the configuration error', async () => {
      const server = new DatabaseServer('svc', [
        { vendor: DatabaseVendor.SEQUELIZE } as DatabaseConfig,
      ]);

      const error = await server.configure().catch((caught: unknown) => caught);

      expect(error).toBeInstanceOf(CustomError);
      expect((error as CustomError).message).toBe('failed to configure database for service "svc"');
      expect((error as CustomError).error).toBeInstanceOf(CustomError);
      expect((error as CustomError).metadata).toEqual({
        database: {
          vendor: DatabaseVendor.SEQUELIZE,
          connectionUrl: undefined,
          connectionName: undefined,
        },
      });
    });

    it('connects each configured database via vendor adapter', async () => {
      const databases: DatabaseConfig[] = [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          connection: { url: 'postgres://localhost/db' },
        },
        {
          vendor: DatabaseVendor.MONGOOSE,
          connection: { url: 'mongodb://localhost/db' },
        },
      ];

      const server = new DatabaseServer('svc', databases);

      await server.configure();

      expect(createDatabaseAdapter).toHaveBeenCalledTimes(2);
      expect(createDatabaseAdapter).toHaveBeenCalledWith(DatabaseVendor.SEQUELIZE);
      expect(createDatabaseAdapter).toHaveBeenCalledWith(DatabaseVendor.MONGOOSE);
      expect(mockConnect).toHaveBeenCalledTimes(2);
      expect(mockConnect).toHaveBeenCalledWith('svc', databases[0], expect.any(Object));
      expect(mockConnect).toHaveBeenCalledWith('svc', databases[1], expect.any(Object));
    });

    it('wraps adapter connect failures in CustomError', async () => {
      mockConnect.mockRejectedValueOnce(new Error('connect failed'));

      const server = new DatabaseServer('svc', [
        {
          vendor: DatabaseVendor.SEQUELIZE,
          connection: { url: 'postgres://localhost/db' },
        },
      ]);

      await expect(server.configure()).rejects.toBeInstanceOf(CustomError);
      expect(mockDisconnect).toHaveBeenCalledOnce();
    });

    it('releases earlier database adapters when a later connection fails', async () => {
      mockConnect.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('second failed'));
      const server = new DatabaseServer('svc', [
        { vendor: DatabaseVendor.SQLITE, connection: { url: ':memory:', name: 'first' } },
        { vendor: DatabaseVendor.SQLITE, connection: { url: ':memory:', name: 'second' } },
      ]);

      await expect(server.configure()).rejects.toThrow('failed to configure database');
      expect(mockConnect).toHaveBeenCalledTimes(2);
      expect(mockDisconnect).toHaveBeenCalledTimes(2);
      expect(server.getAdapters().size).toBe(0);
    });

    it('rejects duplicate adapter keys without replacing the owned adapter', async () => {
      const firstAdapter = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };
      const secondAdapter = {
        connect: vi.fn().mockRejectedValue(new Error('second connection should not run')),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(createDatabaseAdapter)
        .mockReturnValueOnce(firstAdapter)
        .mockReturnValueOnce(secondAdapter);
      const server = new DatabaseServer('svc', [
        { vendor: DatabaseVendor.SQLITE, connection: { url: ':memory:', name: 'shared' } },
        { vendor: DatabaseVendor.SQLITE, connection: { url: ':memory:', name: 'shared' } },
      ]);

      await expect(server.configure()).rejects.toMatchObject({
        reason: 'database configuration failed',
        error: expect.objectContaining({ reason: 'duplicate database connection key' }),
      });

      expect(firstAdapter.connect).toHaveBeenCalledOnce();
      expect(firstAdapter.disconnect).toHaveBeenCalledOnce();
      expect(createDatabaseAdapter).toHaveBeenCalledOnce();
      expect(secondAdapter.connect).not.toHaveBeenCalled();
      expect(secondAdapter.disconnect).not.toHaveBeenCalled();
      expect(server.getAdapters().size).toBe(0);
    });

    it('rejects an explicit vendor-default name that collides with the unnamed ORM token', async () => {
      const unnamedAdapter = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };
      const explicitlyNamedAdapter = {
        connect: vi.fn().mockRejectedValue(new Error('second connection should not run')),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(createDatabaseAdapter)
        .mockReturnValueOnce(unnamedAdapter)
        .mockReturnValueOnce(explicitlyNamedAdapter);
      const server = new DatabaseServer('svc', [
        { vendor: DatabaseVendor.SQLITE, connection: { url: ':memory:' } },
        { vendor: DatabaseVendor.SQLITE, connection: { url: ':memory:', name: DatabaseVendor.SQLITE } },
      ]);

      await expect(server.configure()).rejects.toMatchObject({
        reason: 'database configuration failed',
        error: expect.objectContaining({ reason: 'duplicate database connection key' }),
      });

      expect(unnamedAdapter.connect).toHaveBeenCalledOnce();
      expect(unnamedAdapter.disconnect).toHaveBeenCalledOnce();
      expect(createDatabaseAdapter).toHaveBeenCalledOnce();
      expect(explicitlyNamedAdapter.connect).not.toHaveBeenCalled();
      expect(explicitlyNamedAdapter.disconnect).not.toHaveBeenCalled();
      expect(server.getAdapters().size).toBe(0);
    });

    it('keeps same-name connections from different vendors in separate ownership slots', async () => {
      const sqliteAdapter = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };
      const sequelizeAdapter = {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(createDatabaseAdapter)
        .mockReturnValueOnce(sqliteAdapter)
        .mockReturnValueOnce(sequelizeAdapter);
      const server = new DatabaseServer('svc', [
        { vendor: DatabaseVendor.SQLITE, connection: { url: ':memory:', name: 'primary' } },
        { vendor: DatabaseVendor.SEQUELIZE, connection: { url: 'postgres://localhost/db', name: 'primary' } },
      ]);

      await expect(server.configure()).resolves.toBeUndefined();

      expect(server.getAdapters().size).toBe(2);
      expect(sqliteAdapter.connect).toHaveBeenCalledOnce();
      expect(sequelizeAdapter.connect).toHaveBeenCalledOnce();
    });
  });

  describe('adapter accessors', () => {
    it('getAdapter() returns adapter for configured vendor', async () => {
      const server = new DatabaseServer('svc', [
        {
          vendor: DatabaseVendor.SQLITE,
          connection: { url: ':memory:' },
        },
      ]);

      await server.configure();

      expect(server.getAdapter(DatabaseVendor.SQLITE)).toBe(mockAdapter);
      expect(server.getAdapter(DatabaseVendor.MONGOOSE)).toBeUndefined();
    });

    it('getAdapter() resolves a named connection by vendor and connection name', async () => {
      const server = new DatabaseServer('svc', [
        {
          vendor: DatabaseVendor.SQLITE,
          connection: { url: ':memory:', name: 'primary' },
        },
      ]);

      await server.configure();

      expect(server.getAdapter(DatabaseVendor.SQLITE, 'primary')).toBe(mockAdapter);
      expect(server.getAdapter(DatabaseVendor.SQLITE)).toBeUndefined();
    });

    it('getAdapters() returns all configured adapters', async () => {
      const server = new DatabaseServer('svc', [
        {
          vendor: DatabaseVendor.SQLITE,
          connection: { url: ':memory:' },
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
          connection: { url: 'postgres://localhost/db' },
        },
        {
          vendor: DatabaseVendor.MONGOOSE,
          connection: { url: 'mongodb://localhost/db' },
        },
      ]);

      await server.configure();
      await server.disconnect();

      expect(mockDisconnect).toHaveBeenCalledTimes(2);
    });

    it('waits for pending connection setup before disconnecting the adapter', async () => {
      let finishConnect: (() => void) | undefined;
      const adapter = {
        connect: vi.fn(() => new Promise<void>((resolve) => {
          finishConnect = resolve;
        })),
        disconnect: vi.fn().mockResolvedValue(undefined),
      };
      vi.mocked(createDatabaseAdapter).mockReturnValueOnce(adapter);
      const server = new DatabaseServer('svc', [
        { vendor: DatabaseVendor.SEQUELIZE, connection: { url: 'postgres://localhost/db' } },
      ]);

      const configuring = server.configure();
      const disconnecting = server.disconnect();

      await Promise.resolve();
      expect(adapter.connect).toHaveBeenCalledOnce();
      expect(adapter.disconnect).not.toHaveBeenCalled();
      expect(server.getAdapters().size).toBe(1);

      finishConnect?.();
      await Promise.all([configuring, disconnecting]);

      expect(adapter.disconnect).toHaveBeenCalledOnce();
      expect(server.getAdapters().size).toBe(0);
    });

    it('retains adapters whose disconnect fails so a later call can retry', async () => {
      const disconnect = vi.fn()
        .mockRejectedValueOnce(new Error('temporary disconnect failure'))
        .mockResolvedValueOnce(undefined);
      vi.mocked(createDatabaseAdapter).mockReturnValueOnce({
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect,
      });
      const server = new DatabaseServer('svc', [
        { vendor: DatabaseVendor.SQLITE, connection: { url: ':memory:' } },
      ]);

      await server.configure();

      await expect(server.disconnect()).rejects.toThrow('temporary disconnect failure');
      expect(server.getAdapters().get(DatabaseVendor.SQLITE)).toBeDefined();

      await expect(server.disconnect()).resolves.toBeUndefined();
      expect(disconnect).toHaveBeenCalledTimes(2);
      expect(server.getAdapters().size).toBe(0);
    });
  });
});
