import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: {
      '@sentzunhat/zacatl/service': path.resolve(__dirname, '../../../../../src/service'),
      '@sentzunhat/zacatl/configuration': path.resolve(__dirname, '../../../../../src/configuration'),
      '@sentzunhat/zacatl/dependency-injection': path.resolve(
        __dirname,
        '../../../../../src/dependency-injection',
      ),
      '@sentzunhat/zacatl/error': path.resolve(__dirname, '../../../../../src/error'),
      '@sentzunhat/zacatl/localization': path.resolve(__dirname, '../../../../../src/localization'),
      '@sentzunhat/zacatl/logs': path.resolve(__dirname, '../../../../../src/logs'),
      '@sentzunhat/zacatl/utils': path.resolve(__dirname, '../../../../../src/utils'),
      '@sentzunhat/zacatl/optionals': path.resolve(__dirname, '../../../../../src/optionals.ts'),
      '@sentzunhat/zacatl/third-party': path.resolve(__dirname, '../../../../../src/third-party'),
      '@sentzunhat/zacatl/third-party/dependency-injection/tsyringe': path.resolve(
        __dirname,
        '../../../../../src/third-party/dependency-injection/tsyringe.ts',
      ),
      '@sentzunhat/zacatl/third-party/fastify': path.resolve(
        __dirname,
        '../../../../../src/third-party/fastify.ts',
      ),
      '@sentzunhat/zacatl/third-party/databases/sequelize': path.resolve(
        __dirname,
        '../../../../../src/third-party/databases/sequelize.ts',
      ),
      '@sentzunhat/zacatl/infrastructure': path.resolve(
        __dirname,
        '../../../../../src/service/layers/infrastructure',
      ),
      '@sentzunhat/zacatl/domain': path.resolve(__dirname, '../../../../../src/service/layers/domain'),
      '@sentzunhat/zacatl/application': path.resolve(
        __dirname,
        '../../../../../src/service/layers/application',
      ),
      '@sentzunhat/zacatl/platform': path.resolve(__dirname, '../../../../../src/service/platforms'),
      '@sentzunhat/zacatl/service': path.resolve(__dirname, '../../../../../src/service'),
      '@sentzunhat/zacatl/third-party/fastify': path.resolve(
        __dirname,
        '../../../../../src/third-party/fastify.ts',
      ),
      '@sentzunhat/zacatl/third-party/databases/sequelize': path.resolve(
        __dirname,
        '../../../../../src/third-party/databases/sequelize.ts',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
