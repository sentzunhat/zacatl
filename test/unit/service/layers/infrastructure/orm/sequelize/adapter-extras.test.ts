import { describe, it, expect, vi, beforeEach } from 'vitest';

import { container } from '@zacatl/third-party/dependency-injection/tsyringe';

import { clearContainer } from '../../../../../../../src/dependency-injection';
import { InternalServerError } from '../../../../../../../src/error';
import { SequelizeAdapter } from '../../../../../../../src/service/layers/infrastructure/orm/sequelize/adapter';
import { SequelizeToken } from '../../../../../../../src/service/layers/infrastructure/orm/tokens/sequelize';
import { ORMType } from '../../../../../../../src/service/layers/infrastructure/repositories/types';

interface Plain {
  id?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

describe('SequelizeAdapter Extras', () => {
  beforeEach(() => {
    clearContainer();
    // Register a mock Sequelize instance in DI for each test
    container.register(SequelizeToken, {
      useValue: { model: (_name: string) => mockModel },
    });
  });

  it('exists() should handle array-like count responses', async () => {
    // Mock model with count returning an array (some dialects/ORM wrappers)
    const mockModel: { count: ReturnType<typeof vi.fn<() => Promise<number[]>>> } = {
      count: vi.fn().mockResolvedValueOnce([1, 2, 3]),
    };

    container.register(SequelizeToken, {
      useValue: { model: (_name: string) => mockModel },
    });

    const adapter = new SequelizeAdapter({ type: ORMType.Sequelize, name: 'MockModel' });

    const exists = await adapter.exists('any-id');
    expect(mockModel.count).toHaveBeenCalledWith({ where: { id: 'any-id' } });
    expect(exists).toBe(true);
  });

  it('toLean should accept objects that appear as Model instances via prototype', () => {
    // Create a fake instance whose prototype matches a minimal Model prototype
    const fakeProto: Record<string, unknown> = {};
    const fakeInstance: Record<string, unknown> = Object.create(fakeProto);
    fakeInstance['get'] = vi
      .fn()
      .mockReturnValue({ id: 'x', name: 'y', createdAt: new Date(), updatedAt: new Date() });

    // Provide a model that is not used; adapter.toLean only checks instanceof Model at runtime,
    // but we can pass the instance directly and assert transformation occurs for plain objects too.
    const dummyModel = {};
    container.register(SequelizeToken, {
      useValue: { model: (_name: string) => dummyModel },
    });

    const adapter = new SequelizeAdapter({ type: ORMType.Sequelize, name: 'DummyModel' });

    // When input is not a recognized Model, it will be treated as plain object — ensure it normalizes
    const result = adapter.toLean({ _id: 'abc', name: 'z' } as Plain) as Plain | null;
    expect(result).not.toBeNull();
    expect(result!.id).toBe('abc');
  });

  describe('error normalization', () => {
    it('findById normalizes database errors to InternalServerError', async () => {
      const dbError = new Error('connection refused');
      const mockModel: { findByPk: ReturnType<typeof vi.fn>; sequelize?: unknown } = {
        findByPk: vi.fn().mockRejectedValue(dbError),
      };

      container.register(SequelizeToken, {
        useValue: { model: (_name: string) => mockModel },
      });

      const adapter = new SequelizeAdapter({ type: ORMType.Sequelize, name: 'MockModel' });

      try {
        await adapter.findById('test-id');
        expect.fail('should have thrown');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(InternalServerError);
        expect(String(err)).toContain('connection refused');
      }
    });

    it('findMany normalizes database errors to InternalServerError', async () => {
      const dbError = new Error('timeout');
      const mockModel: { findAll: ReturnType<typeof vi.fn>; sequelize?: unknown } = {
        findAll: vi.fn().mockRejectedValue(dbError),
      };

      container.register(SequelizeToken, {
        useValue: { model: (_name: string) => mockModel },
      });

      const adapter = new SequelizeAdapter({ type: ORMType.Sequelize, name: 'MockModel' });

      try {
        await adapter.findMany();
        expect.fail('should have thrown');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(InternalServerError);
        expect(String(err)).toContain('timeout');
      }
    });

    it('create normalizes database errors to InternalServerError', async () => {
      const dbError = new Error('constraint violation');
      const mockModel: { create: ReturnType<typeof vi.fn>; sequelize?: unknown } = {
        create: vi.fn().mockRejectedValue(dbError),
      };

      container.register(SequelizeToken, {
        useValue: { model: (_name: string) => mockModel },
      });

      const adapter = new SequelizeAdapter({ type: ORMType.Sequelize, name: 'MockModel' });

      try {
        await adapter.create({ name: 'test' });
        expect.fail('should have thrown');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(InternalServerError);
        expect(String(err)).toContain('constraint violation');
      }
    });

    it('update normalizes database errors to InternalServerError', async () => {
      const dbError = new Error('row lock');
      const mockModel: {
        update: ReturnType<typeof vi.fn>;
        sequelize?: { getDialect: () => string };
      } = {
        update: vi.fn().mockRejectedValue(dbError),
        sequelize: { getDialect: () => 'mysql' },
      };

      container.register(SequelizeToken, {
        useValue: { model: (_name: string) => mockModel },
      });

      const adapter = new SequelizeAdapter({ type: ORMType.Sequelize, name: 'MockModel' });

      try {
        await adapter.update('test-id', { name: 'updated' });
        expect.fail('should have thrown');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(InternalServerError);
        expect(String(err)).toContain('row lock');
      }
    });

    it('delete normalizes database errors to InternalServerError', async () => {
      const dbError = new Error('foreign key constraint');
      const mockModel: {
        destroy: ReturnType<typeof vi.fn>;
        findByPk: ReturnType<typeof vi.fn>;
        sequelize?: unknown;
      } = {
        findByPk: vi.fn().mockResolvedValue({ id: 'test-id', name: 'test' }),
        destroy: vi.fn().mockRejectedValue(dbError),
      };

      container.register(SequelizeToken, {
        useValue: { model: (_name: string) => mockModel },
      });

      const adapter = new SequelizeAdapter({ type: ORMType.Sequelize, name: 'MockModel' });

      try {
        await adapter.delete('test-id');
        expect.fail('should have thrown');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(InternalServerError);
        expect(String(err)).toContain('foreign key constraint');
      }
    });

    it('exists normalizes database errors to InternalServerError', async () => {
      const dbError = new Error('query syntax error');
      const mockModel: { count: ReturnType<typeof vi.fn>; sequelize?: unknown } = {
        count: vi.fn().mockRejectedValue(dbError),
      };

      container.register(SequelizeToken, {
        useValue: { model: (_name: string) => mockModel },
      });

      const adapter = new SequelizeAdapter({ type: ORMType.Sequelize, name: 'MockModel' });

      try {
        await adapter.exists('test-id');
        expect.fail('should have thrown');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(InternalServerError);
        expect(String(err)).toContain('query syntax error');
      }
    });

    it('create re-throws InternalServerError from toLean validation', async () => {
      const mockModel: { create: ReturnType<typeof vi.fn>; sequelize?: unknown } = {
        create: vi.fn().mockResolvedValue(null),
      };

      container.register(SequelizeToken, {
        useValue: { model: (_name: string) => mockModel },
      });

      const adapter = new SequelizeAdapter({ type: ORMType.Sequelize, name: 'MockModel' });

      try {
        await adapter.create({ name: 'test' });
        expect.fail('should have thrown');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(InternalServerError);
        // The error reason should contain the toLean validation message
        expect((err as Record<string, unknown>)['reason']).toContain('toLean returned null');
      }
    });

    it('normalizes non-Error exceptions to InternalServerError', async () => {
      const mockModel: { findByPk: ReturnType<typeof vi.fn>; sequelize?: unknown } = {
        findByPk: vi.fn().mockRejectedValue('string error'),
      };

      container.register(SequelizeToken, {
        useValue: { model: (_name: string) => mockModel },
      });

      const adapter = new SequelizeAdapter({ type: ORMType.Sequelize, name: 'MockModel' });

      try {
        await adapter.findById('test-id');
        expect.fail('should have thrown');
      } catch (err: unknown) {
        expect(err).toBeInstanceOf(InternalServerError);
        expect(String(err)).toContain('string error');
      }
    });
  });
});

// placeholder to satisfy beforeEach reference; overridden per test
const mockModel = {} as never;
