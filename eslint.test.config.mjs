import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Test-area overrides — applied on top of zacatlRecommended from the root config.
 *
 * Rules that are too strict for test code are downgraded to 'warn' so violations
 * are visible in the output but never block iteration.
 *
 * Standalone use (e.g. a CI job that only lints tests):
 *   import { recommended } from '@sentzunhat/zacatl/eslint';
 *   import testOverrides from './eslint.test.config.mjs';
 *   export default [...recommended, ...testOverrides];
 */
export default [
  {
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
      // Tests frequently use `any` for mocks and stubs — error is too disruptive
      '@typescript-eslint/no-explicit-any': 'warn',
      // Empty object types appear in mock generic parameters
      '@typescript-eslint/no-empty-object-type': 'warn',
      // Type annotation noise adds no value in test describe/it callbacks
      '@typescript-eslint/explicit-function-return-type': 'warn',
      // import type enforcement is lower priority in tests
      '@typescript-eslint/consistent-type-imports': 'warn',
      // Naming conventions relaxed (vi.fn() assignees, PascalCase model vars)
      '@typescript-eslint/naming-convention': 'warn',
      // Test helpers may import from devDependencies
      'import/no-extraneous-dependencies': 'warn',
      // Test setup files use console for debug output
      'no-console': 'warn',
      // Import ordering is a nice-to-have, not a blocker, in tests
      'import/order': 'warn',
      // Path aliases resolve at test runtime — resolver may not trace them statically
      'import/no-unresolved': 'warn',
    },
  },
];
