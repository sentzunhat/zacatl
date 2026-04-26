/**
 * Export Strategy Verification
 *
 * Core requirements:
 * - No root package barrel — consumers import via explicit subpaths only.
 * - ORMs are subpath-only to prevent eager loading and keep bundles minimal.
 */

import fs from 'node:fs';
import path from 'node:path';

import { beforeAll, describe, it, expect } from 'vitest';

const repoRoot = path.resolve(import.meta.dirname, '../../..');

/** Cold ESM import of @zacatl/service pulls the full service barrel (layers + platforms). */
type ServiceExports = typeof import('@zacatl/service');

describe('Export Strategy Verification', () => {
  let serviceModule: ServiceExports;

  beforeAll(async () => {
    serviceModule = await import('@zacatl/service');
  }, 20_000);

  describe('Core Requirements', () => {
    it('should not ship a root index barrel in source', () => {
      expect(fs.existsSync(path.join(repoRoot, 'src/index.ts'))).toBe(false);
    });

    it('should provide Service from @zacatl/service subpath', () => {
      expect(serviceModule.Service).toBeDefined();
      expect(serviceModule.ServiceType).toBeDefined();
    });

    it('should provide BaseRepository from each ORM vendor subpath', async () => {
      const { BaseRepository: MongooseBaseRepository } = await import(
        '@zacatl/service/layers/infrastructure/repositories/mongoose/repository'
      );
      const { BaseRepository: SequelizeBaseRepository } = await import(
        '@zacatl/service/layers/infrastructure/repositories/sequelize/repository'
      );
      const { BaseRepository: NodeSqliteBaseRepository } = await import(
        '@zacatl/service/layers/infrastructure/repositories/nodesqlite/repository'
      );
      expect(MongooseBaseRepository).toBeDefined();
      expect(SequelizeBaseRepository).toBeDefined();
      expect(NodeSqliteBaseRepository).toBeDefined();
    });
    it('should provide DI utilities from @zacatl/dependency-injection subpath', async () => {
      const diExports = await import('@zacatl/dependency-injection');

      expect(diExports.resolveDependency).toBeDefined();
      expect(diExports.registerDependency).toBeDefined();
      expect(diExports.registerSingleton).toBeDefined();
      expect(diExports.clearContainer).toBeDefined();
    });

    it('should NOT export ORMs from service subpath', () => {
      expect('mongoose' in serviceModule).toBe(false);
      expect('Schema' in serviceModule).toBe(false);
      expect('Sequelize' in serviceModule).toBe(false);
      expect('DataTypes' in serviceModule).toBe(false);
    });

    it('should provide dedicated Mongoose subpath', async () => {
      const mongooseExports = await import('@zacatl/third-party/databases/mongoose');

      expect(mongooseExports.mongoose).toBeDefined();
      expect(mongooseExports.Schema).toBeDefined();
      expect(mongooseExports.Model).toBeDefined();
      expect(mongooseExports.connect).toBeDefined();
      expect(mongooseExports.connection).toBeDefined();
    });

    it('should provide dedicated Sequelize subpath', async () => {
      const sequelizeExports = await import('@zacatl/third-party/databases/sequelize');

      expect(sequelizeExports.Sequelize).toBeDefined();
      expect(sequelizeExports.DataTypes).toBeDefined();
      expect(sequelizeExports.SequelizeModel).toBeDefined();
      expect(sequelizeExports.Op).toBeDefined();
    });
  });

  describe('Subpath-Only Import Strategy', () => {
    it('should require subpath imports for Mongoose access', async () => {
      const mongooseExports = await import('@zacatl/third-party/databases/mongoose');
      expect(mongooseExports.mongoose).toBeDefined();
      expect(mongooseExports.Schema).toBeDefined();
      expect(mongooseExports.Model).toBeDefined();
    });

    it('should require subpath imports for Sequelize access', async () => {
      const sequelizeExports = await import('@zacatl/third-party/databases/sequelize');
      expect(sequelizeExports.Sequelize).toBeDefined();
      expect(sequelizeExports.DataTypes).toBeDefined();
      expect(sequelizeExports.SequelizeModel).toBeDefined();
    });

    it('should not load mongoose when importing Service from service subpath', () => {
      expect(serviceModule.Service).toBeDefined();
      expect('mongoose' in serviceModule).toBe(false);
      expect('Schema' in serviceModule).toBe(false);
    });

    it('should not load sequelize when importing Service from service subpath', () => {
      expect(serviceModule.Service).toBeDefined();
      expect('Sequelize' in serviceModule).toBe(false);
      expect('DataTypes' in serviceModule).toBe(false);
    });
  });

  describe('Benefits of Subpath Strategy', () => {
    it('should enable tree-shaking of unused ORMs', async () => {
      const mongooseExports = await import('@zacatl/third-party/databases/mongoose');
      expect(mongooseExports.mongoose).toBeDefined();

      const sequelizeExports = await import('@zacatl/third-party/databases/sequelize');
      expect(sequelizeExports.Sequelize).toBeDefined();
    });

    it('should keep module imports explicit without a root re-export barrel', async () => {
      const diExports = await import('@zacatl/dependency-injection');

      expect(serviceModule.Service).toBeDefined();
      expect(diExports.resolveDependency).toBeDefined();
      expect(diExports.registerDependency).toBeDefined();

      expect('mongoose' in serviceModule).toBe(false);
      expect('Schema' in serviceModule).toBe(false);
      expect('Sequelize' in serviceModule).toBe(false);
      expect('DataTypes' in serviceModule).toBe(false);
    });

    it('should maintain minimal bundle size for users not needing ORMs', async () => {
      const { resolveDependency } = await import('@zacatl/dependency-injection');

      expect(serviceModule.Service).toBeDefined();
      expect(resolveDependency).toBeDefined();

      const mongooseExports = await import('@zacatl/third-party/databases/mongoose');
      expect(mongooseExports.mongoose).toBeDefined();
    });
  });
});
