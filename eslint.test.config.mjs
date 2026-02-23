import { recommended as zacatlRecommended } from './src/eslint/index.mjs';

// Test-area overrides (Vitest)
const vitestOverrides = {
  ...zacatlRecommended,
  files: ['test/**/*.ts', 'test/**/*.tsx'],
  languageOptions: {
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
