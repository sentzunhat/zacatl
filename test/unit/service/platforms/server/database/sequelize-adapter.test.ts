import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRegister = vi.fn();
vi.mock('../../../../../../src/dependency-injection/container', () => ({
  getContainer: () => ({ register: mockRegister }),
}));

import { CustomError } from '@zacatl/error';

import { SequelizeAdapter } from '../../../../../../src/service/platforms/server/database/sequelize-adapter';

const makeSequelize = (
  overrides: Partial<{ authenticate: () => Promise<void> }> = {},
): Record<string, unknown> => ({
  authenticate: vi.fn().mockResolvedValue(undefined),
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
          vendor: 'SEQUELIZE' as any,
          connectionString: 'postgres://localhost/db',
        } as any),
      ).rejects.toBeInstanceOf(CustomError);
    });

    it('throws CustomError when instance has no authenticate method', async () => {
      await expect(
        adapter.connect('svc', {
          vendor: 'SEQUELIZE' as any,
          connectionString: 'postgres://localhost/db',
          instance: { notAuthenticate: true } as any,
        }),
      ).rejects.toBeInstanceOf(CustomError);
    });

    it('calls authenticate() on a valid instance', async () => {
      const fakeSequelize = makeSequelize();

      await adapter.connect('svc', {
        vendor: 'SEQUELIZE' as any,
        connectionString: 'postgres://localhost/db',
        instance: fakeSequelize as any,
      });

      expect((fakeSequelize as Record<string, any>)['authenticate']).toHaveBeenCalledOnce();
    });

    it('registers the instance in the DI container after connecting', async () => {
      const fakeSequelize = makeSequelize();

      await adapter.connect('svc', {
        vendor: 'SEQUELIZE' as any,
        connectionString: 'postgres://localhost/db',
        instance: fakeSequelize as any,
      });

      expect(mockRegister).toHaveBeenCalledOnce();
    });

    it('calls onDatabaseConnected callback when provided', async () => {
      const fakeSequelize = makeSequelize();
      const onConnected = vi.fn().mockResolvedValue(undefined);

      await adapter.connect('svc', {
        vendor: 'SEQUELIZE' as any,
        connectionString: 'postgres://localhost/db',
        instance: fakeSequelize as any,
        onDatabaseConnected: onConnected,
      });

      expect(onConnected).toHaveBeenCalledOnce();
      expect(onConnected).toHaveBeenCalledWith(fakeSequelize);
    });
  });

  describe('disconnect()', () => {
    it('resolves without error', async () => {
      await expect(adapter.disconnect()).resolves.toBeUndefined();
    });
  });
});
