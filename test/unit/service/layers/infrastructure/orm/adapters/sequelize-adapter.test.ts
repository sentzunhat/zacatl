import { describe, it, expect, vi, beforeEach } from 'vitest';

import { ORMType } from '../../../../../../../src/service/layers/infrastructure/repositories/types';

// Mock Sequelize before partial import
vi.mock('sequelize', () => {
  class Model {
    public static init() {}
    public get(opts: any) {
      if (opts && opts.plain) return JSON.parse(JSON.stringify(this));
      return this;
    }
    constructor(values: any) {
      Object.assign(this, values);
    }
  }
  return { Model };
});

import { Model } from 'sequelize';

import { SequelizeAdapter } from '../../../../../../../src/service/layers/infrastructure/orm/sequelize-adapter';

// Mock Sequelize Model
class MockModel extends Model {
  public id?: string;
  public name?: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  static override findByPk = vi.fn();
  static override create = vi.fn();
  static override update = vi.fn();
  static override destroy = vi.fn();
}

interface TestInput {
  name: string;
}

interface TestOutput {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

describe('SequelizeAdapter', () => {
  let adapter: SequelizeAdapter<MockModel, TestInput, TestOutput>;
  const mockConfig = {
    type: ORMType.Sequelize as const,
    model: MockModel as any,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    adapter = new SequelizeAdapter(mockConfig);
  });

  describe('toLean', () => {
    it('should return null if input is falsy', () => {
      expect(adapter.toLean(null)).toBeNull();
      expect(adapter.toLean(undefined)).toBeNull();
    });

    it('should convert Model instance to plain object', () => {
      const now = new Date();
      const plainData = {
        id: '123',
        name: 'Test',
        createdAt: now,
        updatedAt: now,
      };

      const mockInstance = new MockModel();
      mockInstance.get = vi.fn().mockReturnValue(plainData);

      const result = adapter.toLean(mockInstance);
      expect(result).toEqual(plainData);
      expect(mockInstance.get).toHaveBeenCalledWith({ plain: true });
    });

    it('should handle plain object input', () => {
      const now = new Date();
      const plainData = {
        id: '123',
        name: 'Test',
        createdAt: now,
        updatedAt: now,
      };

      const result = adapter.toLean(plainData);
      expect(result).toEqual(plainData);
    });

    it('should handle missing timestamps', () => {
      const plainData = {
        id: '123',
        name: 'Test',
      };

      const result = adapter.toLean(plainData);
      expect(result).not.toBeNull();
      expect(result!.createdAt).toBeInstanceOf(Date);
      expect(result!.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('findById', () => {
    it('should return entity when found', async () => {
      const now = new Date();
      const plainData = {
        id: '123',
        name: 'Found',
        createdAt: now,
        updatedAt: now,
      };

      const mockInstance = new MockModel();
      mockInstance.get = vi.fn().mockReturnValue(plainData);
      MockModel.findByPk.mockResolvedValue(mockInstance);

      const result = await adapter.findById('123');
      expect(result).toEqual(plainData);
      expect(MockModel.findByPk).toHaveBeenCalledWith('123');
    });

    it('should return null when not found', async () => {
      MockModel.findByPk.mockResolvedValue(null);

      const result = await adapter.findById('999');
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return entity', async () => {
      const input = { name: 'New' };
      const now = new Date();
      const plainData = {
        id: 'new-id',
        name: 'New',
        createdAt: now,
        updatedAt: now,
      };

      const mockInstance = new MockModel();
      mockInstance.get = vi.fn().mockReturnValue(plainData);
      MockModel.create.mockResolvedValue(mockInstance);

      const result = await adapter.create(input);
      expect(result).toEqual(plainData);
      expect(MockModel.create).toHaveBeenCalledWith(input);
    });
  });

  describe('update', () => {
    it('should update and return new entity', async () => {
      const updateData = { name: 'Updated' };
      const now = new Date();
      const updatedData = {
        id: '123',
        name: 'Updated',
        createdAt: now,
        updatedAt: now,
      };

      MockModel.update.mockResolvedValue([1]); // 1 affected row

      // Mock findById for the return value
      const mockInstance = new MockModel();
      mockInstance.get = vi.fn().mockReturnValue(updatedData);
      MockModel.findByPk.mockResolvedValue(mockInstance);

      const result = await adapter.update('123', updateData);

      expect(MockModel.update).toHaveBeenCalledWith(updateData, {
        where: { id: '123' },
      });
      expect(result).toEqual(updatedData);
    });

    it('should return null if no rows affected', async () => {
      MockModel.update.mockResolvedValue([0]);

      const result = await adapter.update('999', { name: 'Ghost' });
      expect(result).toBeNull();
      expect(MockModel.findByPk).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete and return the deleted entity', async () => {
      const now = new Date();
      const existingData = {
        id: '123',
        name: 'To Delete',
        createdAt: now,
        updatedAt: now,
      };

      // Mock findById finding the entity first
      const mockInstance = new MockModel();
      mockInstance.get = vi.fn().mockReturnValue(existingData);
      MockModel.findByPk.mockResolvedValue(mockInstance);

      MockModel.destroy.mockResolvedValue(1);

      const result = await adapter.delete('123');

      expect(result).toEqual(existingData);
      expect(MockModel.destroy).toHaveBeenCalledWith({ where: { id: '123' } });
    });

    it('should return null if entity not found before delete', async () => {
      MockModel.findByPk.mockResolvedValue(null);

      const result = await adapter.delete('999');
      expect(result).toBeNull();
      expect(MockModel.destroy).not.toHaveBeenCalled();
    });
  });
});
