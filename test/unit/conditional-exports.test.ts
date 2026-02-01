/**
 * Subpath-Only Import Strategy Tests (v0.0.24)
 *
 * Critical Bug Fix: Main package NO LONGER exports ORMs
 *
 * Users MUST import ORMs via dedicated subpaths:
 *   import { mongoose } from "@sentzunhat/zacatl/orm/mongoose"
 *   import { Sequelize } from "@sentzunhat/zacatl/orm/sequelize"
 */

import { describe, it, expect } from "vitest";

describe("Dual Import Strategy", () => {
  it("should NOT import ORMs from main package (bug fix)", async () => {
    const mainExports = await import("../../src/index.js");

    expect(mainExports.Service).toBeDefined();
    expect(mainExports.resolveDependency).toBeDefined();
    expect(mainExports.BaseRepository).toBeDefined();

    // ✅ ORMs NOT exported from main package (prevents eager loading)
    expect("mongoose" in mainExports).toBe(false);
    expect("Schema" in mainExports).toBe(false);
    expect("Sequelize" in mainExports).toBe(false);
    expect("DataTypes" in mainExports).toBe(false);
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

  it("should require subpath imports for ORM access", async () => {
    // Subpath imports are the ONLY way to access ORMs
    const mongooseExports = await import("../../src/orm/mongoose.js");
    const sequelizeExports = await import("../../src/orm/sequelize.js");

    expect(mongooseExports.mongoose).toBeDefined();
    expect(sequelizeExports.Sequelize).toBeDefined();
  });
});
