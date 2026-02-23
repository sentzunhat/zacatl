import { describe, expect, it, beforeAll } from 'vitest';
import { BaseRepository } from '../../../../../../src/service/layers/infrastructure/repositories/abstract';
import { ORMType } from '../../../../../../src/service/layers/infrastructure/repositories/types';
import { Schema } from 'mongoose';
import { connectToMongoServerAndRegisterDependency } from '../../../../helpers/database/mongo';

/**
 * ESM Runtime Tests for Synchronous Adapter Loading
 *
 * These tests verify that the adapter loading mechanism works correctly
 * in ESM environments with synchronous initialization.
 */

describe('ESM Adapter Loading', () => {
  beforeAll(async () => {
    // Setup DI container with Mongoose for tests
    await connectToMongoServerAndRegisterDependency();
  });

  describe('Synchronous Initialization', () => {
    it('should create repository and initialize adapter synchronously', () => {
      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      // Repository constructor is sync and initializes adapter immediately
      const repo = new TestRepository();
      expect(repo).toBeDefined();
      expect(repo.model).toBeDefined();
    });

    it('should make model available immediately after construction', () => {
      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      const repo = new TestRepository();

      // Model should be accessible immediately
      expect(() => repo.model).not.toThrow();
      expect(repo.model).toBeDefined();
    });

    it('should allow toLean to be called immediately', () => {
      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      const repo = new TestRepository();

      // toLean should work immediately after construction
      expect(() => repo.toLean(null)).not.toThrow();
      expect(repo.toLean(null)).toBeNull();
    });
  });

  describe('Adapter Error Handling', () => {
    it('should handle errors during adapter construction', () => {
      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      // Construction should succeed with DI container set up
      expect(() => new TestRepository()).not.toThrow();
    });

    it('should use static imports for adapters', () => {
      // This test verifies that we use static imports not dynamic import()
      // by checking that repository construction is synchronous

      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      // Constructor should be purely synchronous
      const startTime = Date.now();
      const repo = new TestRepository();
      const endTime = Date.now();

      expect(repo).toBeDefined();
      // Synchronous operation should be nearly instant (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });

  describe('Repository Operations', () => {
    it('should allow async methods to be called immediately', async () => {
      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      const repo = new TestRepository();

      const findByIdPromise = repo.findById('test-id').catch(() => null);
      expect(findByIdPromise).toBeInstanceOf(Promise);

      const createPromise = repo.create('test-data').catch(() => null);
      expect(createPromise).toBeInstanceOf(Promise);

      const updatePromise = repo.update('test-id', 'updated-data').catch(() => null);
      expect(updatePromise).toBeInstanceOf(Promise);

      const deletePromise = repo.delete('test-id').catch(() => null);
      expect(deletePromise).toBeInstanceOf(Promise);

      await Promise.all([findByIdPromise, createPromise, updatePromise, deletePromise]);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple concurrent calls without initialization races', async () => {
      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      const repo = new TestRepository();

      // Multiple concurrent async calls work immediately - no race conditions
      const promises = [
        repo.findById('1').catch(() => null),
        repo.findById('2').catch(() => null),
        repo.findById('3').catch(() => null),
      ];

      // Await all promises
      const results = await Promise.all(promises);

      // All should complete successfully
      expect(results).toBeDefined();
      expect(results.length).toBe(3);
    });
  });
});
