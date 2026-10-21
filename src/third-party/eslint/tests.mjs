/**
 * Test-specific overrides for Zacatl ESLint.
 *
 * These rules are intended for project test files and are exported from the
 * library entrypoint as `zacatlTestsRecommended`.
 */
export const zacatlTestsRecommended = [
  {
    files: ['test/**/*.ts', 'test/**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./test/tsconfig.json'],
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
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/naming-convention': 'warn',
      'import/no-extraneous-dependencies': 'warn',
      'no-console': 'warn',
      'import/order': 'warn',
      'import/no-unresolved': 'warn',
      'func-style': ['warn', 'expression', { allowArrowFunctions: true }],
    },
  },
];

export default zacatlTestsRecommended;
