/**
 * Dual Import Strategy Tests
 *
 * Verifies users can import ORMs via:
 * 1. Main package (convenience): import { mongoose } from "@sentzunhat/zacatl"
 * 2. Subpath (minimal): import { mongoose } from "@sentzunhat/zacatl/orm/mongoose"
 */

import { describe, it, expect } from "vitest";

describe("Dual Import Strategy", () => {
  it("should import ORMs from main package (convenience option)", async () => {
    const mainExports = await import("../../src/index.js");

    expect(mainExports.Service).toBeDefined();
    expect(mainExports.resolveDependency).toBeDefined();
    expect(mainExports.BaseRepository).toBeDefined();

    // ✅ ORMs available from main package for convenience
    expect(mainExports.mongoose).toBeDefined();
    expect(mainExports.Schema).toBeDefined();
    expect(mainExports.Sequelize).toBeDefined();
    expect(mainExports.DataTypes).toBeDefined();
  });

  it("should import Mongoose from dedicated subpath (minimal bundle)", async () => {
    const mongooseExports = await import("../../src/orm/mongoose.js");

    expect(mongooseExports.mongoose).toBeDefined();
    expect(mongooseExports.Schema).toBeDefined();
    expect(mongooseExports.Model).toBeDefined();
  });

  it("should import Sequelize from dedicated subpath (minimal bundle)", async () => {
    const sequelizeExports = await import("../../src/orm/sequelize.js");

    expect(sequelizeExports.Sequelize).toBeDefined();
    expect(sequelizeExports.DataTypes).toBeDefined();
    expect(sequelizeExports.SequelizeModel).toBeDefined();
  });

  it("should support both import styles for flexibility", async () => {
    // Both options work - users choose based on needs
    const fromMain = await import("../../src/index.js");
    const fromSubpath = await import("../../src/orm/mongoose.js");

    expect(fromMain.mongoose).toBe(fromSubpath.mongoose);
    expect(fromMain.Schema).toBe(fromSubpath.Schema);
  });
});
