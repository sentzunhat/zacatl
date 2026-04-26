import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@backend': resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['../../tests/**/*.test.ts'],
    exclude: ['dist/**', '../**/dist/**'],
    server: {
      deps: {
        inline: [/@sentzunhat\/zacatl/],
      },
    },
  },
});
