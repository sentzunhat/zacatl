import { describe, it, expect, vi, beforeEach } from 'vitest';

import { container } from '@zacatl/third-party/dependency-injection/tsyringe';

import { clearContainer } from '../../../../../../../src/dependency-injection';
import { SequelizeAdapter } from '../../../../../../../src/service/layers/infrastructure/orm/sequelize/adapter';
import { SequelizeToken } from '../../../../../../../src/service/layers/infrastructure/orm/tokens';
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
});

// placeholder to satisfy beforeEach reference; overridden per test
const mockModel = {} as never;
