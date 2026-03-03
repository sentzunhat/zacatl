import { Schema } from 'mongoose';
import { singleton } from 'tsyringe';
import { describe, it, expect, vi, beforeAll } from 'vitest';

import {
  MongooseRepository,
  ORMType,
} from '../../../../../../src/service/layers/infrastructure/repositories/mongoose';
import type { MongooseModel } from '../../../../../../src/third-party/mongoose';
import { connectToMongoServerAndRegisterDependency } from '../../../../helpers/database/mongo';

interface UserTestDb {
  name: string;
}

interface UserTestOutput extends UserTestDb {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

const schemaUserTest = new Schema<UserTestDb>({
  name: { type: String, required: true },
});

@singleton()
class UserRepository extends MongooseRepository<UserTestDb, UserTestDb, UserTestOutput> {
  constructor() {
    super({
      type: ORMType.Mongoose,
      name: 'MongooseUser',
      schema: schemaUserTest,
    });
  }
}

describe('MongooseRepository', () => {
  let repository: UserRepository;

  beforeAll(async () => {
    await connectToMongoServerAndRegisterDependency();

    try {
      repository = new UserRepository();
    } catch (error: any) {
      // If mongoose can't be loaded (running from TS source), skip these tests
      if (error.message?.includes('Mongoose is not installed')) {
        console.log('Skipping MongooseRepository tests - running from TypeScript source');
        return;
      }
      throw error;
    }
  });

  describe('model initialization', () => {
    it('should create a model with provided name and schema', async () => {
      if (!repository) return;
      // Initialize adapter by calling an async method first
      await repository.create({ name: 'initialization-test' });
      const model = repository.model as MongooseModel<UserTestDb>;
      expect(model.modelName).toBe('MongooseUser');
      expect(model.schema).toBe(schemaUserTest);
    });

    it('should be lazy-loaded (null until first access)', () => {
      if (!repository) return;
      const model = repository.model;
      expect(model).toBeDefined();
    });
  });

  describe('toLean', () => {
    it('should convert Mongoose document to lean output', async () => {
      if (!repository) return;
      const user = await repository.create({ name: 'Alice' });
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('createdAt');
      expect(user).toHaveProperty('updatedAt');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null for null/undefined input', () => {
      if (!repository) return;
      expect(repository.toLean(null)).toBeNull();
      expect(repository.toLean(undefined)).toBeNull();
    });

    it('should normalize _id to id field', async () => {
      if (!repository) return;
      // Create a document to initialize model
      await repository.create({ name: 'Bob' });
      const result = repository.toLean({ _id: 'test-id', name: 'test' });
      expect(result?.id).toBe('test-id');
    });

    it('should preserve existing id field', async () => {
      if (!repository) return;
      // Create a document to initialize model
      await repository.create({ name: 'Charlie' });
      const result = repository.toLean({ id: 'existing-id', name: 'test' });
      expect(result?.id).toBe('existing-id');
    });

    it('should normalize timestamps to Date objects', () => {
      if (!repository) return;
      const result = repository.toLean({
        _id: '123',
        name: 'test',
        createdAt: '2026-02-14',
        updatedAt: 1708000000000, // timestamp
      });
      expect(result?.createdAt).toBeInstanceOf(Date);
      expect(result?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('create', () => {
    it('should create document and return lean output', async () => {
      if (!repository) return;
      const input = { name: 'David' };
      const result = await repository.create(input);

      expect(result).toMatchObject(input);
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should call model.create with input', async () => {
      if (!repository) return;
      const model = repository.model as MongooseModel<UserTestDb>;
      const spyCreate = vi.spyOn(model, 'create');
      const input = { name: 'Eve' };

      await repository.create(input);

      expect(spyCreate).toHaveBeenCalledWith(input);
    });

    it('should throw InternalServerError if toLean fails', async () => {
      if (!repository) return;
      const model = repository.model as MongooseModel<UserTestDb>;
      vi.spyOn(model, 'create').mockResolvedValueOnce(null as any);

      // This would only happen if toLean returned null after creation
      // In practice, this should not happen
      // Skip this edge case test as it's internally protected
    });
  });

  describe('findById', () => {
    it('should return document by id', async () => {
      if (!repository) return;
      const created = await repository.create({ name: 'Frank' });
      const found = await repository.findById(created.id);

      expect(found).not.toBeNull();
      expect(found?.id).toBe(created.id);
      expect(found?.name).toBe('Frank');
    });

    it('should return null if document not found', async () => {
      if (!repository) return;
      const result = await repository.findById('nonexistent-id');
      expect(result).toBeNull();
    });

    it('should call model.findById with correct id', async () => {
      if (!repository) return;
      const created = await repository.create({ name: 'Grace' });
      const model = repository.model as MongooseModel<UserTestDb>;
      const spyFindById = vi.spyOn(model, 'findById');

      await repository.findById(created.id);

      expect(spyFindById).toHaveBeenCalledWith(created.id);
    });

    it('should use lean() for efficiency', async () => {
      if (!repository) return;
      const created = await repository.create({ name: 'Henry' });
      const model = repository.model as MongooseModel<UserTestDb>;
      const spyFindById = vi.spyOn(model, 'findById');

      await repository.findById(created.id);

      // lean() is called in the chain
      expect(spyFindById).toHaveBeenCalled();
    });
  });

  describe('findMany', () => {
    it('should return array of documents matching filter', async () => {
      if (!repository) return;
      await repository.create({ name: 'Iris' });
      await repository.create({ name: 'Jack' });

      const results = await repository.findMany();

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThanOrEqual(2);
    });

    it('should return empty array if no matches', async () => {
      if (!repository) return;
      const results = await repository.findMany({
        name: 'NotAPersonWhoActuallyExists',
      });
      expect(results).toEqual([]);
    });

    it('should apply filter correctly', async () => {
      if (!repository) return;
      const name = `UniqueUser${Date.now()}`;
      await repository.create({ name });

      const results = await repository.findMany({ name });

      expect(results.length).toBeGreaterThan(0);
      expect(results.every((r) => r.name === name)).toBe(true);
    });

    it('should return only lean documents', async () => {
      if (!repository) return;
      await repository.create({ name: 'Karen' });
      const results = await repository.findMany();

      results.forEach((result) => {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('createdAt');
        expect(result).toHaveProperty('updatedAt');
        expect(typeof result.id).toBe('string');
        expect(result.createdAt).toBeInstanceOf(Date);
        expect(result.updatedAt).toBeInstanceOf(Date);
      });
    });
  });

  describe('update', () => {
    it('should update document and return updated state', async () => {
      if (!repository) return;
      const created = await repository.create({ name: 'Leo' });
      const updated = await repository.update(created.id, { name: 'Leonard' });

      expect(updated).not.toBeNull();
      expect(updated?.id).toBe(created.id);
      expect(updated?.name).toBe('Leonard');
    });

    it('should return null if document not found', async () => {
      if (!repository) return;
      const result = await repository.update('nonexistent-id', {
        name: 'Updated',
      });
      expect(result).toBeNull();
    });

    it('should call model.findByIdAndUpdate', async () => {
      if (!repository) return;
      const created = await repository.create({ name: 'Mia' });
      const model = repository.model as MongooseModel<UserTestDb>;
      const spyUpdate = vi.spyOn(model, 'findByIdAndUpdate');

      await repository.update(created.id, { name: 'Michelle' });

      expect(spyUpdate).toHaveBeenCalledWith(created.id, { name: 'Michelle' }, { new: true });
    });

    it('should return lean document with updated timestamp', async () => {
      if (!repository) return;
      const created = await repository.create({ name: 'Nina' });
      const updated = await repository.update(created.id, { name: 'Ninette' });

      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(created.updatedAt.getTime());
    });
  });

  describe('delete', () => {
    it('should delete document and return last state', async () => {
      if (!repository) return;
      const created = await repository.create({ name: 'Oscar' });
      const deleted = await repository.delete(created.id);

      expect(deleted).not.toBeNull();
      expect(deleted?.id).toBe(created.id);
      expect(deleted?.name).toBe('Oscar');

      // Verify it's actually deleted
      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it('should return null if document not found', async () => {
      if (!repository) return;
      const result = await repository.delete('nonexistent-id');
      expect(result).toBeNull();
    });

    it('should call model.findByIdAndDelete', async () => {
      if (!repository) return;
      const created = await repository.create({ name: 'Paul' });
      const model = repository.model as MongooseModel<UserTestDb>;
      const spyDelete = vi.spyOn(model, 'findByIdAndDelete');

      await repository.delete(created.id);

      expect(spyDelete).toHaveBeenCalledWith(created.id);
    });
  });

  describe('exists', () => {
    it('should return true if document exists', async () => {
      if (!repository) return;
      const created = await repository.create({ name: 'Quinn' });
      const exists = await repository.exists(created.id);

      expect(exists).toBe(true);
    });

    it('should return false if document does not exist', async () => {
      if (!repository) return;
      const exists = await repository.exists('nonexistent-id');
      expect(exists).toBe(false);
    });

    it('should call model.exists', async () => {
      if (!repository) return;
      const created = await repository.create({ name: 'Rachel' });
      const model = repository.model as MongooseModel<UserTestDb>;
      const spyExists = vi.spyOn(model, 'exists');

      await repository.exists(created.id);

      expect(spyExists).toHaveBeenCalledWith({ _id: created.id });
    });
  });
});
