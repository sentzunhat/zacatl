/**
 * Base ESLint Configuration for Zacatl
 *
 * Foundation layer: JS recommended + TypeScript recommended + project-level overrides.
 * Exported as an array so tseslint.configs.recommended (itself an array) is spread
 * correctly and none of the recommended rules are silently overridden.
 *
 * Usage:
 * import { baseConfig } from "@sentzunhat/zacatl/eslint";
 * // or
 * import baseConfig from "@sentzunhat/zacatl/eslint/base";
 *
 * export default [
 *   ...baseConfig,
 *   // ... additional configs
 * ];
 */

import js from '@eslint/js';
import tseslint from 'typescript-eslint';

const baseConfig = [
  // Core JS rules (no-undef, no-unused-vars, etc.)
  js.configs.recommended,

  // TypeScript recommended rules (array of configs)
  // Note: tseslint.configs.recommended sets the TS parser for all files.
  // The override below re-disables project-based parsing for non-TS files
  // (e.g. .mjs config files) so they don't cause "file not in project" errors.
  ...tseslint.configs.recommended,

  // Non-TypeScript files must not use project-based type-checking.
  // Without this, .mjs/.js/.cjs files picked up by the TS parser throw:
  //   "parserOptions.project: file was not found in any provided project(s)"
  {
    files: ['**/*.mjs', '**/*.cjs', '**/*.js'],
    languageOptions: {
      parserOptions: { project: false },
    },
  },

  {
    files: ['src/**/*.ts'],
    // parser and plugins are already set by tseslint.configs.recommended;
    // only override parserOptions to add the project reference.
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
      },
      globals: {
        __dirname: 'readonly',
        process: 'readonly',
        console: 'readonly',
      },
    },
    rules: {
      // Allow empty interfaces — used for ports/extension points in hexagonal architecture
      '@typescript-eslint/no-empty-object-type': [
        'error',
        {
          allowInterfaces: 'always',
          allowObjectTypes: 'never',
        },
      ],
      // Require return type annotations on non-trivial functions (consumers benefit from docs)
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true,
          allowTypedFunctionExpressions: true,
          allowHigherOrderFunctions: true,
        },
      ],
      // Prefer import type { Foo } over import { Foo } for type-only references
      // Prevents bundlers from pulling in runtime modules just for types
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      // Replaced by @typescript-eslint/no-unused-vars in strict.mjs
      'no-unused-vars': 'off',
    },
  },
];

export default baseConfig;
export { baseConfig };
