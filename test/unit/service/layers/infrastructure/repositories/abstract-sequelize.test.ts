import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Sequelize before partial import
vi.mock('sequelize', () => {
  class Model {
    public static init(): void {}
    public get(opts?: { plain?: boolean }): unknown {
      if (opts?.plain === true) return JSON.parse(JSON.stringify(this));
      return this;
    }
    constructor(values: Record<string, unknown> = {}) {
      Object.assign(this, values);
    }
  }
  return { ['Model']: Model };
});

import { SequelizeModel as Model } from '@zacatl/third-party/databases/sequelize';
import { container } from '@zacatl/third-party/dependency-injection/tsyringe';

import { clearContainer } from '../../../../../../src/dependency-injection';
import { SequelizeToken } from '../../../../../../src/service/layers/infrastructure/orm/tokens/sequelize';
import { BaseRepository } from '../../../../../../src/service/layers/infrastructure/repositories/sequelize/repository';
import { ORMType } from '../../../../../../src/service/layers/infrastructure/repositories/types';

class MockModel extends Model {
  public id?: string;
  public name?: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  static override findByPk = vi.fn();
  static override create = vi.fn();
  static override update = vi.fn();
  static override destroy = vi.fn();
  static override findAll = vi.fn();
  static override count = vi.fn();
}

interface UserInput {
  name: string;
}

interface UserOutput {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const MODEL_NAME = 'SequelizeTestUser';

class UserRepository extends BaseRepository<MockModel, UserInput, UserOutput> {
  constructor() {
    super({ type: ORMType.Sequelize, name: MODEL_NAME });
  }
}

describe('BaseRepository (Sequelize)', () => {
  let repository: UserRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    clearContainer();
    container.register(SequelizeToken, {
      useValue: { model: (_name: string) => MockModel },
    });
    repository = new UserRepository();
  });

  describe('constructor', () => {
    it('resolves model eagerly from DI on construction', () => {
      expect(repository.model).toBe(MockModel);
    });

    it('throws on first model access when DI is not registered (construction is safe)', () => {
      clearContainer();
      const repo = new UserRepository();
      expect(() => repo.model).toThrow(
        'Sequelize instance not registered in DI container',
      );
    });
  });

  describe('model getter', () => {
    it('returns the Sequelize model from the adapter', () => {
      expect(repository.model).toBe(MockModel);
    });

    it('is stable across multiple calls', () => {
      expect(repository.model).toBe(repository.model);
    });
  });

  describe('toLean', () => {
    it('returns null for null input', () => {
      expect(repository.toLean(null)).toBeNull();
    });

    it('converts a model instance via get({ plain: true })', () => {
      const now = new Date();
      const instance = new MockModel();
      instance.get = vi.fn().mockReturnValue({
        id: 'abc',
        name: 'Alice',
        createdAt: now,
        updatedAt: now,
      });

      const result = repository.toLean(instance);
      expect(result).not.toBeNull();
      expect(result?.id).toBe('abc');
      expect(result?.name).toBe('Alice');
    });

    it('normalizes timestamps from string values', () => {
      const result = repository.toLean({
        id: '123',
        name: 'Bob',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-02-01T00:00:00.000Z',
      });

      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.updatedAt).toBeInstanceOf(Date);
    });

    it('uses empty string for id when missing', () => {
      const result = repository.toLean({ name: 'Charlie', createdAt: null, updatedAt: null });
      expect(result?.id).toBe('');
    });
  });

  describe('findById', () => {
    it('delegates to the adapter and returns null when not found', async () => {
      MockModel.findByPk.mockResolvedValue(null);

      const result = await repository.findById('nonexistent');
      expect(result).toBeNull();
    });

    it('returns lean output when found', async () => {
      const now = new Date();
      const instance = new MockModel();
      instance.get = vi.fn().mockReturnValue({
        id: '123',
        name: 'Dave',
        createdAt: now,
        updatedAt: now,
      });
      MockModel.findByPk.mockResolvedValue(instance);

      const result = await repository.findById('123');
      expect(result?.id).toBe('123');
      expect(result?.name).toBe('Dave');
    });
  });

  describe('create', () => {
    it('creates a record and returns lean output', async () => {
      const now = new Date();
      const instance = new MockModel();
      instance.get = vi.fn().mockReturnValue({
        id: 'new-id',
        name: 'Eve',
        createdAt: now,
        updatedAt: now,
      });
      MockModel.create.mockResolvedValue(instance);

      const result = await repository.create({ name: 'Eve' });
      expect(result.id).toBe('new-id');
      expect(result.name).toBe('Eve');
      expect(MockModel.create).toHaveBeenCalledWith({ name: 'Eve' });
    });
  });

  describe('update', () => {
    it('returns null when record not found', async () => {
      MockModel.update.mockResolvedValue([0]);

      const result = await repository.update('nonexistent', { name: 'Ghost' });
      expect(result).toBeNull();
    });

    it('returns updated lean output', async () => {
      const now = new Date();
      const instance = new MockModel();
      instance.get = vi.fn().mockReturnValue({
        id: '123',
        name: 'Updated',
        createdAt: now,
        updatedAt: now,
      });
      MockModel.update.mockResolvedValue([1]);
      MockModel.findByPk.mockResolvedValue(instance);

      const result = await repository.update('123', { name: 'Updated' });
      expect(result?.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('returns null when record not found', async () => {
      MockModel.findByPk.mockResolvedValue(null);

      const result = await repository.delete('nonexistent');
      expect(result).toBeNull();
    });

    it('deletes and returns last lean state', async () => {
      const now = new Date();
      const instance = new MockModel();
      instance.get = vi.fn().mockReturnValue({
        id: '123',
        name: 'Frank',
        createdAt: now,
        updatedAt: now,
      });
      MockModel.findByPk.mockResolvedValue(instance);
      MockModel.destroy.mockResolvedValue(1);

      const result = await repository.delete('123');
      expect(result?.id).toBe('123');
      expect(result?.name).toBe('Frank');
    });
  });

  describe('exists', () => {
    it('returns false when record does not exist', async () => {
      MockModel.count.mockResolvedValue(0);

      const result = await repository.exists('nonexistent');
      expect(result).toBe(false);
    });

    it('returns true when record exists', async () => {
      MockModel.count.mockResolvedValue(1);

      const result = await repository.exists('123');
      expect(result).toBe(true);
    });
  });
});
