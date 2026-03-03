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
    // Relax errors for test files so we can iterate quickly during development.
    'import/order': 'warn',
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-empty-object-type': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/naming-convention': 'off',
    'import/no-unresolved': 'off',
  },
};

export default [vitestOverrides];
