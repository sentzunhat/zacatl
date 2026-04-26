import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitest.dev/config/#configuration
export default defineConfig({
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.mjs', '.json'],
    alias: [
      // Exact-match entries first (regex) — prevent subpath bleed-through
      { find: /^@zacatl\/service$/, replacement: path.resolve(__dirname, './src/service/service.ts') },
      // Specific subpath prefixes before shorter ones
      { find: '@zacatl/third-party/databases/mongoose', replacement: path.resolve(__dirname, './src/third-party/databases/mongoose') },
      { find: '@zacatl/third-party/databases/sequelize', replacement: path.resolve(__dirname, './src/third-party/databases/sequelize') },
      { find: '@zacatl/optionals', replacement: path.resolve(__dirname, './src/utils/optionals.ts') },
      { find: '@zacatl/orm', replacement: path.resolve(__dirname, './src/service/layers/infrastructure/orm') },
      { find: '@zacatl/infrastructure', replacement: path.resolve(__dirname, './src/service/layers/infrastructure') },
      { find: '@zacatl/domain', replacement: path.resolve(__dirname, './src/service/layers/domain') },
      { find: '@zacatl/application', replacement: path.resolve(__dirname, './src/service/layers/application') },
      { find: '@zacatl/platform', replacement: path.resolve(__dirname, './src/service/platforms') },
      // Generic prefixes after specific ones
      { find: '@zacatl/configuration', replacement: path.resolve(__dirname, './src/configuration') },
      { find: '@zacatl/dependency-injection', replacement: path.resolve(__dirname, './src/dependency-injection') },
      { find: '@zacatl/error', replacement: path.resolve(__dirname, './src/error') },
      { find: '@zacatl/localization', replacement: path.resolve(__dirname, './src/localization') },
      { find: '@zacatl/logs', replacement: path.resolve(__dirname, './src/logs') },
      { find: '@zacatl/service', replacement: path.resolve(__dirname, './src/service') },
      { find: '@zacatl/utils', replacement: path.resolve(__dirname, './src/utils') },
      { find: '@zacatl/third-party', replacement: path.resolve(__dirname, './src/third-party') },
    ],
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
