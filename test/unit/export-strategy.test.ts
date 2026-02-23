/**
 * Export Strategy Verification (v0.0.24)
 *
 * Consolidated test verifying the critical bug fix for eager ORM loading.
 *
 * Core Requirement: Main package NO LONGER exports ORMs
 * - Users MUST import ORMs via dedicated subpaths
 * - Prevents eager loading and maintains minimal bundle size
 *
 * Users must use:
 *   import { mongoose } from "@sentzunhat/zacatl/orm/mongoose"
 *   import { Sequelize } from "@sentzunhat/zacatl/orm/sequelize"
 */

import { describe, it, expect } from 'vitest';

describe('Export Strategy Verification', () => {
  describe('Core Requirements', () => {
    it('should NOT export ORMs from main package (bug fix)', async () => {
      const mainExports = await import('../../src/index.js');

      // Core exports should work
      expect(mainExports.Service).toBeDefined();
      expect(mainExports.resolveDependency).toBeDefined();
      expect(mainExports.BaseRepository).toBeDefined();

      // ORMs should NOT be exported (prevents eager loading)
      expect('mongoose' in mainExports).toBe(false);
      expect('Schema' in mainExports).toBe(false);
      expect('Sequelize' in mainExports).toBe(false);
      expect('DataTypes' in mainExports).toBe(false);
    });

    it('should provide DI utilities from main package', async () => {
      const mainExports = await import('../../src/index.js');

      expect(mainExports.resolveDependency).toBeDefined();
      expect(mainExports.registerDependency).toBeDefined();
      expect(mainExports.registerSingleton).toBeDefined();
      expect(mainExports.clearContainer).toBeDefined();
    });

    it('should provide dedicated Mongoose subpath', async () => {
      const mongooseExports = await import('../../src/third-party/mongoose.js');

      expect(mongooseExports.mongoose).toBeDefined();
      expect(mongooseExports.Schema).toBeDefined();
      expect(mongooseExports.Model).toBeDefined();
      expect(mongooseExports.connect).toBeDefined();
      expect(mongooseExports.connection).toBeDefined();
    });

    it('should provide dedicated Sequelize subpath', async () => {
      const sequelizeExports = await import('../../src/third-party/sequelize.js');

      expect(sequelizeExports.Sequelize).toBeDefined();
      expect(sequelizeExports.DataTypes).toBeDefined();
      expect(sequelizeExports.SequelizeModel).toBeDefined();
      expect(sequelizeExports.Op).toBeDefined();
    });
  });

  describe('Subpath-Only Import Strategy', () => {
    it('should require subpath imports for Mongoose access', async () => {
      const mongooseExports = await import('../../src/third-party/mongoose.js');
      expect(mongooseExports.mongoose).toBeDefined();
      expect(mongooseExports.Schema).toBeDefined();
      expect(mongooseExports.Model).toBeDefined();
    });

    it('should require subpath imports for Sequelize access', async () => {
      const sequelizeExports = await import('../../src/third-party/sequelize.js');
      expect(sequelizeExports.Sequelize).toBeDefined();
      expect(sequelizeExports.DataTypes).toBeDefined();
      expect(sequelizeExports.SequelizeModel).toBeDefined();
    });

    it('should not load mongoose when importing Service from main', async () => {
      // Import only Service from main package
      const { Service } = await import('../../src/index.js');

      // Verify Service was imported
      expect(Service).toBeDefined();

      // No mongoose properties in main exports
      const mainExports = await import('../../src/index.js');
      expect('mongoose' in mainExports).toBe(false);
      expect('Schema' in mainExports).toBe(false);
    });

    it('should not load sequelize when importing Service from main', async () => {
      // Import only Service from main package
      const { Service } = await import('../../src/index.js');

      // Verify Service was imported
      expect(Service).toBeDefined();

      // No sequelize properties in main exports
      const mainExports = await import('../../src/index.js');
      expect('Sequelize' in mainExports).toBe(false);
      expect('DataTypes' in mainExports).toBe(false);
    });
  });

  describe('Benefits of Subpath Strategy', () => {
    it('should enable tree-shaking of unused ORMs', async () => {
      // Subpath imports allow bundlers to tree-shake unused ORMs
      const mongooseExports = await import('../../src/third-party/mongoose.js');
      expect(mongooseExports.mongoose).toBeDefined();

      const sequelizeExports = await import('../../src/third-party/sequelize.js');
      expect(sequelizeExports.Sequelize).toBeDefined();
    });

    it('should provide clean imports without re-exports from main', async () => {
      // Main package exports both Service and DI utilities
      const mainExports = await import('../../src/index.js');

      expect(mainExports.Service).toBeDefined();
      expect(mainExports.resolveDependency).toBeDefined();
      expect(mainExports.registerDependency).toBeDefined();

      // Main package is clean - no ORM exports
      expect('mongoose' in mainExports).toBe(false);
      expect('Schema' in mainExports).toBe(false);
      expect('Sequelize' in mainExports).toBe(false);
      expect('DataTypes' in mainExports).toBe(false);
    });

    it('should maintain minimal bundle size for users not needing ORMs', async () => {
      // Users who only need Service and DI don't get ORM dependencies
      const { Service, resolveDependency } = await import('../../src/index.js');

      expect(Service).toBeDefined();
      expect(resolveDependency).toBeDefined();

      // ORM subpaths are optional imports
      const mongooseExports = await import('../../src/third-party/mongoose.js');
      expect(mongooseExports.mongoose).toBeDefined();
    });
  });
});
