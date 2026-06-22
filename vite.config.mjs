import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitest.dev/config/#configuration
export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.mjs', '.json'],
    alias: {
      // More specific paths must come first to prevent less specific matches
      '@zacatl/third-party/mongoose': path.resolve(
        __dirname,
        './src/third-party/databases/mongoose',
      ),
      '@zacatl/third-party/sequelize': path.resolve(
        __dirname,
        './src/third-party/databases/sequelize',
      ),
      '@zacatl/optionals': path.resolve(__dirname, './src/utils/optionals.ts'),
      '@zacatl/orm': path.resolve(__dirname, './src/service/layers/infrastructure/orm'),
      '@zacatl/infrastructure': path.resolve(__dirname, './src/service/layers/infrastructure'),
      '@zacatl/domain': path.resolve(__dirname, './src/service/layers/domain'),
      '@zacatl/application': path.resolve(__dirname, './src/service/layers/application'),
      '@zacatl/platform': path.resolve(__dirname, './src/service/platforms'),
      // Generic paths after specific ones
      '@zacatl/configuration': path.resolve(__dirname, './src/configuration'),
      '@zacatl/dependency-injection': path.resolve(__dirname, './src/dependency-injection'),
      '@zacatl/error': path.resolve(__dirname, './src/error'),
      '@zacatl/localization': path.resolve(__dirname, './src/localization'),
      '@zacatl/logs': path.resolve(__dirname, './src/logs'),
      '@zacatl/service': path.resolve(__dirname, './src/service'),
      '@zacatl/utils': path.resolve(__dirname, './src/utils'),
      '@zacatl/third-party': path.resolve(__dirname, './src/third-party'),
    },
  },
  test: {
    globals: true,
    include: ['test/**/*.test.ts'],
    environment: 'node',
    environmentOptions: {
      // Add Node.js globals to prevent undici issues
      nodeOptions: {
        experimentalGlobal: true,
      },
    },
    logHeapUsage: true,
    reporters: 'verbose',
    globalSetup: './test/unit/lib/global-setup.ts',
    setupFiles: ['./test/setup.ts', './test/unit/lib/setup-files.ts'],
    coverage: {
      reporter: ['lcov', 'text'],
      reportsDirectory: './coverage',
      all: true,
      include: ['src/**/*.ts'],
      provider: 'istanbul',
      exclude: [
        // Generated files:
        '**/*.d.ts',
        // macOS metadata files:
        '**/.DS_Store',
      ],
    },
    /*
     * When using threads you are unable to use process related APIs such as process.chdir().
     * Some libraries written in native languages, such as Prisma, bcrypt and canvas, have problems when running in multiple threads and run into segfaults.
     * In these cases it is advised to use forks pool instead.
     * https://vitest.dev/config/#pool
     */
    pool: 'threads',
    // Move poolOptions to top-level (Vitest 4 migration)
    isolate: true,

    sequence: {
      hooks: 'parallel',
    },
  },
});
