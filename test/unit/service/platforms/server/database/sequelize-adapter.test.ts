import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@zacatl/third-party/dependency-injection', () => ({
  registerValue: vi.fn(),
  getContainer: (): { isRegistered: ReturnType<typeof vi.fn>; resolve: ReturnType<typeof vi.fn> } => ({
    isRegistered: vi.fn(),
    resolve: vi.fn(),
  }),
}));

import { registerValue as mockRegisterValue } from '@zacatl/third-party/dependency-injection';
import { CustomError } from '@zacatl/error';

import { SequelizeAdapter } from '../../../../../../src/service/platforms/server/database/adapters/sequelize';
import { createDatabaseToken } from '../../../../../../src/service/layers/infrastructure/orm/tokens/factory';
import {
  DatabaseVendor,
  type DatabaseConfig,
} from '../../../../../../src/service/platforms/server/database/port';

const makeSequelize = (
  overrides: Partial<{ authenticate: () => Promise<void>; close: () => Promise<void> }> = {},
): Record<string, unknown> => ({
  authenticate: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  constructor: { name: 'Sequelize' },
  ...overrides,
});

describe('SequelizeAdapter', () => {
  let adapter: SequelizeAdapter;

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new SequelizeAdapter();
  });

  describe('connect()', () => {
    it('throws CustomError when instance is null', async () => {
      await expect(
        adapter.connect('svc', {
          vendor: DatabaseVendor.SEQUELIZE,
          connection: { url: 'postgres://localhost/db' },
        } as DatabaseConfig),
      ).rejects.toBeInstanceOf(CustomError);
    });

    it('throws CustomError when instance has no authenticate method', async () => {
      await expect(
        adapter.connect('svc', {
          vendor: DatabaseVendor.SEQUELIZE,
          connection: { url: 'postgres://localhost/db' },
          instance: { notAuthenticate: true } as unknown as DatabaseConfig['instance'],
        } as DatabaseConfig),
      ).rejects.toBeInstanceOf(CustomError);
    });

    it('calls authenticate() on a valid instance', async () => {
      const fakeSequelize = makeSequelize();

      await adapter.connect('svc', {
        vendor: DatabaseVendor.SEQUELIZE,
        connection: { url: 'postgres://localhost/db' },
        instance: fakeSequelize as DatabaseConfig['instance'],
      } as DatabaseConfig);

      expect((fakeSequelize as Record<string, unknown>)['authenticate']).toHaveBeenCalledOnce();
    });

    it('registers the instance in the DI container after connecting', async () => {
      const fakeSequelize = makeSequelize();

      await adapter.connect('svc', {
        vendor: DatabaseVendor.SEQUELIZE,
        connection: { url: 'postgres://localhost/db' },
        instance: fakeSequelize as DatabaseConfig['instance'],
      } as DatabaseConfig);

      expect(mockRegisterValue).toHaveBeenCalledOnce();
      expect(mockRegisterValue).toHaveBeenCalledWith(
        createDatabaseToken('SEQUELIZE', 'SEQUELIZE'),
        fakeSequelize,
        expect.anything(),
      );
    });

    it('calls onDatabaseConnected callback when provided', async () => {
      const fakeSequelize = makeSequelize();
      const onConnected = vi.fn().mockResolvedValue(undefined);

      await adapter.connect('svc', {
        vendor: DatabaseVendor.SEQUELIZE,
        connection: { url: 'postgres://localhost/db' },
        instance: fakeSequelize as DatabaseConfig['instance'],
        onDatabaseConnected: onConnected,
      } as DatabaseConfig);

      expect(onConnected).toHaveBeenCalledOnce();
      expect(onConnected).toHaveBeenCalledWith(fakeSequelize);
    });

    it('closes the authenticated instance when onDatabaseConnected rejects', async () => {
      const close = vi.fn().mockResolvedValue(undefined);
      const fakeSequelize = makeSequelize({ close });
      const onConnected = vi.fn().mockRejectedValue(new Error('setup failed'));

      await expect(adapter.connect('svc', {
        vendor: DatabaseVendor.SEQUELIZE,
        connection: { url: 'postgres://localhost/db' },
        instance: fakeSequelize as DatabaseConfig['instance'],
        onDatabaseConnected: onConnected,
      } as DatabaseConfig)).rejects.toThrow('setup failed');

      await adapter.disconnect();
      expect(close).toHaveBeenCalledOnce();
    });
  });

  describe('disconnect()', () => {
    it('resolves without error', async () => {
      await expect(adapter.disconnect()).resolves.toBeUndefined();
    });
  });
});
