import { defineConfig } from 'vitest/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^@sentzunhat\/zacatl\/third-party\/dependency-injection$/,
        replacement: path.resolve(__dirname, '../../../../src/third-party/dependency-injection.ts'),
      },
      {
        find: /^@sentzunhat\/zacatl\/third-party$/,
        replacement: path.resolve(__dirname, '../../../../src/third-party.ts'),
      },
      {
        find: /^@zacatl\/third-party\/dependency-injection$/,
        replacement: path.resolve(__dirname, '../../../../src/third-party/dependency-injection.ts'),
      },
      {
        find: /^@zacatl\/third-party$/,
        replacement: path.resolve(__dirname, '../../../../src/third-party.ts'),
      },
      {
        find: /^@zacatl\/(.+)$/,
        replacement: `${path.resolve(__dirname, '../../../../src')}/$1`,
      },
      {
        find: /^@sentzunhat\/zacatl\/(.+)$/,
        replacement: `${path.resolve(__dirname, '../../../../src')}/$1`,
      },
    ],
  },
  test: {
    globals: true,
    environment: 'node',
    include: [
      '**/*.{test,spec}.?(c|m)[jt]s?(x)',
      path.resolve(__dirname, '../../../shared/zacatl-source-resolution.test.ts'),
    ],
  },
});
