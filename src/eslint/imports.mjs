/**
 * ESLint Import Ordering Configuration for Zacatl
 *
 * Enforces consistent import organization:
 * 1. Built-in Node.js modules
 * 2. External dependencies
 * 3. Internal workspace imports
 * 4. Parent/sibling/index imports
 *
 * Usage:
 * import { importsConfig } from "@sentzunhat/zacatl/eslint";
 * // or
 * import importsConfig from "@sentzunhat/zacatl/eslint/imports";
 *
 * export default [
 *   importsConfig,
 *   // ... additional configs
 * ];
 */

import importPlugin from 'eslint-plugin-import';

const importsConfig = {
  ...importPlugin.flatConfigs.recommended,
  rules: {
    'import/order': [
      'error',
      {
        groups: [
          'builtin', // Node.js built-in modules
          'external', // npm packages
          'internal', // Aliased imports
          ['parent', 'sibling', 'index'], // Relative imports
        ],
        pathGroups: [
          {
            pattern: 'src/**',
            group: 'internal',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin', 'external'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    // Disable rules that may conflict with TypeScript
    'import/no-unresolved': 'off',
    'import/named': 'off',
    'import/namespace': 'off',
    'import/default': 'off',
    'import/no-named-as-default-member': 'off',
    // Discourage importing the library root; prefer explicit subpath imports
    'no-restricted-imports': [
      'warn',
      {
        paths: [
          {
            name: '@zacatl',
            message:
              "Import explicit subpaths instead (e.g. '@zacatl/third-party/mongoose' or '@zacatl/service') to avoid pulling runtime implementations unintentionally.",
          },
        ],
      },
    ],
  },
};

export default importsConfig;
export { importsConfig };
