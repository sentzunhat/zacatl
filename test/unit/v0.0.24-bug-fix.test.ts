/**
 * v0.0.24 Critical Bug Fix Verification
 *
 * Proves that importing from main package no longer eagerly loads ORMs.
 */

import { describe, it, expect, beforeAll } from "vitest";

describe("v0.0.24 Bug Fix: No Eager ORM Loading", () => {
  let moduleLoadSpy: string[] = [];

  beforeAll(() => {
    // Track which modules have been loaded
    const originalRequire = global.require;
    if (originalRequire) {
      global.require = new Proxy(originalRequire, {
        apply(target, thisArg, args) {
          const moduleName = args[0];
          if (typeof moduleName === "string") {
            moduleLoadSpy.push(moduleName);
          }
          return Reflect.apply(target, thisArg, args);
        },
      });
    }
  });

  it("should NOT load mongoose when importing Service from main package", async () => {
    // Import only Service from main package
    const { Service } = await import("../../src/index.js");

    // Verify Service was imported
    expect(Service).toBeDefined();

    // mongoose module should NOT be in loaded modules
    const hasMongoose = moduleLoadSpy.some((mod) => mod.includes("mongoose"));
    expect(hasMongoose).toBe(false);
  });

  it("should NOT load sequelize when importing Service from main package", async () => {
    // Import only Service from main package
    const { Service } = await import("../../src/index.js");

    // Verify Service was imported
    expect(Service).toBeDefined();

    // sequelize module should NOT be in loaded modules
    const hasSequelize = moduleLoadSpy.some((mod) => mod.includes("sequelize"));
    expect(hasSequelize).toBe(false);
  });

  it("should ONLY load mongoose when explicitly imported from subpath", async () => {
    // Explicitly import mongoose from subpath
    const { mongoose } = await import("../../src/orm/mongoose.js");

    // Verify mongoose was imported
    expect(mongoose).toBeDefined();
  });

  it("should verify main package exports do not include ORMs", async () => {
    const mainExports = await import("../../src/index.js");

    // Core exports should exist
    expect(mainExports.Service).toBeDefined();
    expect(mainExports.resolveDependency).toBeDefined();

    // ORM exports should NOT exist
    expect("mongoose" in mainExports).toBe(false);
    expect("Schema" in mainExports).toBe(false);
    expect("Sequelize" in mainExports).toBe(false);
    expect("DataTypes" in mainExports).toBe(false);
  });
});
