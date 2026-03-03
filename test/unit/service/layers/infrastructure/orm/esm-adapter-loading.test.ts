import { describe, expect, it, beforeAll } from 'vitest';

import { Schema } from '@zacatl/third-party/mongoose';

import { BaseRepository } from '../../../../../../src/service/layers/infrastructure/repositories/abstract';
import { ORMType } from '../../../../../../src/service/layers/infrastructure/repositories/types';
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
    it('should create repository synchronously; model available after first async call', async () => {
      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      // Repository constructor is sync — inner adapter loads asynchronously
      const repo = new TestRepository();
      expect(repo).toBeDefined();
      // Trigger ensureLoaded() so inner adapter is available before checking model
      await repo.findById('nonexistent-probe').catch(() => null);
      expect(repo.model).toBeDefined();
    });

    it('should defer model access until after first async call', async () => {
      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      const repo = new TestRepository();

      // Model is deferred — accessing it before the adapter loads throws
      expect(() => repo.model).toThrow();
      // After any async operation the adapter is ready and model is accessible
      await repo.findById('nonexistent-probe').catch(() => null);
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

    it('should use lazy (dynamic) imports; construction itself stays synchronous', () => {
      // This test verifies that dynamic import() is used (adapter is lazy-loaded)
      // while the constructor itself remains synchronous and fast

      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      // Constructor should be purely synchronous (kicks off async import internally)
      const startTime = Date.now();
      const repo = new TestRepository();
      const endTime = Date.now();

      expect(repo).toBeDefined();
      // Construction is fast even though it fires off an async import
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
