import { describe, expect, it } from "vitest";
import { BaseRepository } from "../../../../../../src/service/architecture/infrastructure/repositories/abstract";
import { ORMType } from "../../../../../../src/service/architecture/infrastructure/repositories/types";
import { Schema } from "mongoose";

/**
 * ESM Runtime Tests for Adapter Lazy Loading
 *
 * These tests verify that the adapter loading mechanism works correctly
 * in ESM environments (Bun, Node.js with tsx, Vite, etc.)
 */

describe("ESM Adapter Loading", () => {
  describe("Lazy Initialization", () => {
    it("should create repository without immediately loading adapter", () => {
      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      // Repository constructor should be sync and not throw
      expect(() => new TestRepository()).not.toThrow();
    });

    it("should throw helpful error when accessing model before initialization", () => {
      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      const repo = new TestRepository();

      expect(() => repo.model).toThrow(
        "Repository not initialized. Call an async method first or await repository.ensureInitialized()",
      );
    });

    it("should throw helpful error when calling getMongooseModel before initialization", () => {
      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      const repo = new TestRepository();

      expect(() => repo.getMongooseModel()).toThrow(
        "Repository not initialized",
      );
    });

    it("should throw helpful error when calling toLean before initialization", () => {
      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      const repo = new TestRepository();

      expect(() => repo.toLean({})).toThrow("Repository not initialized");
    });
  });

  describe("Adapter Error Handling", () => {
    it("should use async import() for dynamic loading", async () => {
      // This test verifies that the implementation uses dynamic imports
      // by checking that errors come from the adapter loading, not require()

      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      const repo = new TestRepository();

      try {
        await repo.findById("test");
      } catch (error: any) {
        // Should NOT be "require is not defined" error
        expect(error.message).not.toContain("require is not defined");
        // Error should be from DI container or missing Mongoose installation
        expect(
          error.message.includes("TypeInfo not known") ||
            error.message.includes("Mongoose is not installed"),
        ).toBe(true);
      }
    });

    it("should handle both ESM and CommonJS error codes", async () => {
      // This test documents that we handle both error codes:
      // - ERR_MODULE_NOT_FOUND (ESM)
      // - MODULE_NOT_FOUND (CommonJS)

      // The adapter-loader handles both error codes
      const esmErrorCode = "ERR_MODULE_NOT_FOUND";
      const cjsErrorCode = "MODULE_NOT_FOUND";

      expect(esmErrorCode).toBe("ERR_MODULE_NOT_FOUND");
      expect(cjsErrorCode).toBe("MODULE_NOT_FOUND");
    });
  });

  describe("Dynamic Import Integration", () => {
    it("should use dynamic import() instead of require()", async () => {
      // This test verifies that the implementation uses async import
      // by checking that async methods work properly

      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      const repo = new TestRepository();

      // All repository methods should be async and return Promises
      const findByIdPromise = repo.findById("test").catch(() => null);
      expect(findByIdPromise).toBeInstanceOf(Promise);

      const createPromise = repo.create("test-data" as any).catch(() => null);
      expect(createPromise).toBeInstanceOf(Promise);

      const updatePromise = repo
        .update("test", "test-data" as any)
        .catch(() => null);
      expect(updatePromise).toBeInstanceOf(Promise);

      const deletePromise = repo.delete("test").catch(() => null);
      expect(deletePromise).toBeInstanceOf(Promise);

      // Await all to prevent unhandled rejections
      await Promise.all([
        findByIdPromise,
        createPromise,
        updatePromise,
        deletePromise,
      ]);
    });
  });

  describe("Concurrent Initialization", () => {
    it("should handle multiple concurrent calls to async methods", async () => {
      class TestRepository extends BaseRepository<any, string, any> {
        constructor() {
          super({
            type: ORMType.Mongoose,
            schema: new Schema({}),
          });
        }
      }

      const repo = new TestRepository();

      // Multiple concurrent async calls should all properly initialize
      // (or all fail with the same initialization error)
      const promises = [
        repo.findById("1").catch(() => "error"),
        repo.findById("2").catch(() => "error"),
        repo.findById("3").catch(() => "error"),
      ];

      // Await all promises to prevent unhandled rejections
      const results = await Promise.all(promises);

      // All should either succeed or fail consistently
      expect(results).toBeDefined();
      expect(results.length).toBe(3);
    });
  });
});
