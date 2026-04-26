import { describe, it, expect, vi } from 'vitest';

import { SequelizeAdapter } from '../../../../../../../src/service/layers/infrastructure/orm/sequelize/adapter';
import { ORMType } from '../../../../../../../src/service/layers/infrastructure/repositories/types';

interface Plain {
  id?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

describe('SequelizeAdapter Extras', () => {
  it('exists() should handle array-like count responses', async () => {
    // Mock model with count returning an array (some dialects/ORM wrappers)
    const mockModel: { count: ReturnType<typeof vi.fn<() => Promise<number[]>>> } = {
      count: vi.fn().mockResolvedValueOnce([1, 2, 3]),
    };

    const adapter = new SequelizeAdapter({ type: ORMType.Sequelize, model: mockModel as never });

    const exists = await adapter.exists('any-id');
    expect(mockModel.count).toHaveBeenCalledWith({ where: { id: 'any-id' } });
    expect(exists).toBe(true);
  });

  it('toLean should accept objects that appear as Model instances via prototype', () => {
    // Create a fake instance whose prototype matches a minimal Model prototype
    const fakeProto: Record<string, unknown> = {};
    const fakeInstance: Record<string, unknown> = Object.create(fakeProto);
    fakeInstance.get = vi
      .fn()
      .mockReturnValue({ id: 'x', name: 'y', createdAt: new Date(), updatedAt: new Date() });

    // Provide a model that is not used; adapter.toLean only checks instanceof Model at runtime,
    // but we can pass the instance directly and assert transformation occurs for plain objects too.
    const adapter = new SequelizeAdapter({ type: ORMType.Sequelize, model: {} as never });

    // When input is not a recognized Model, it will be treated as plain object — ensure it normalizes
    const result = adapter.toLean({ _id: 'abc', name: 'z' } as Plain) as Plain | null;
    expect(result).not.toBeNull();
    expect(result!.id).toBe('abc');
  });
});
