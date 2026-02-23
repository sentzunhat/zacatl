import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test-area overrides (Vitest)
const vitestOverrides = {
  files: ['test/**/*.ts', 'test/**/*.tsx'],
  languageOptions: {
    parserOptions: {
      project: ['./test/tsconfig.json'],
      tsconfigRootDir: __dirname,
    },
    globals: {
      describe: 'readonly',
      it: 'readonly',
      expect: 'readonly',
      vi: 'readonly',
      beforeEach: 'readonly',
      afterEach: 'readonly',
      beforeAll: 'readonly',
      afterAll: 'readonly',
    },
  },
  rules: {
    'import/no-extraneous-dependencies': 'off',
    'no-console': 'off',
  },
};

export default [vitestOverrides];
