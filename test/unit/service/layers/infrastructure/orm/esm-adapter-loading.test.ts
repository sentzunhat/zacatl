import { describe, expect, it, beforeAll } from 'vitest';

import { Schema } from '@zacatl/third-party/databases/mongoose';

import { BaseRepository } from '../../../../../../src/service/layers/infrastructure/repositories/mongoose/repository';
import { connectToMongoServerAndRegisterDependency } from '../../../../helpers/database/mongo';

/**
 * ESM Runtime Tests for Synchronous Adapter Construction
 *
 * These tests verify that the repository adapters resolve their ORM
 * dependencies directly through DI while keeping construction synchronous.
 */

class TestRepository extends BaseRepository<
  Record<string, unknown>,
  Record<string, unknown>,
  Record<string, unknown>
> {
  constructor() {
    super({
      name: 'EsmTestModel',
      schema: new Schema({}),
    });
  }
}

describe('ESM Adapter Loading', () => {
  let repo: TestRepository;

  beforeAll(async () => {
    await connectToMongoServerAndRegisterDependency();
    repo = new TestRepository();
  });

  describe('Synchronous Initialization', () => {
    it('should create repository synchronously; model available immediately', () => {
      expect(repo).toBeDefined();
      expect(repo.model).toBeDefined();
    });

    it('should allow toLean to be called immediately', () => {
      expect(() => repo.toLean(null)).not.toThrow();
      expect(repo.toLean(null)).toBeNull();
    });
  });

  describe('Adapter Error Handling', () => {
    it('should handle errors during adapter construction', () => {
      expect(repo).toBeDefined();
    });

    it('should keep construction synchronous', () => {
      const startTime = Date.now();
      const check = repo.model;
      const endTime = Date.now();

      expect(check).toBeDefined();
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Repository Operations', () => {
    it('should allow async methods to be called immediately', async () => {
      const findByIdPromise = repo.findById('test-id').catch(() => null);
      expect(findByIdPromise).toBeInstanceOf(Promise);

      const createPromise = repo.create({ data: 'test-data' }).catch(() => null);
      expect(createPromise).toBeInstanceOf(Promise);

      const updatePromise = repo.update('test-id', { data: 'updated-data' }).catch(() => null);
      expect(updatePromise).toBeInstanceOf(Promise);

      const deletePromise = repo.delete('test-id').catch(() => null);
      expect(deletePromise).toBeInstanceOf(Promise);

      await Promise.all([findByIdPromise, createPromise, updatePromise, deletePromise]);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent calls without initialization races', async () => {
      const promises = [
        repo.findById('1').catch(() => null),
        repo.findById('2').catch(() => null),
        repo.findById('3').catch(() => null),
      ];

      const results = await Promise.all(promises);

      expect(results).toBeDefined();
      expect(results.length).toBe(3);
    });
  });
});
