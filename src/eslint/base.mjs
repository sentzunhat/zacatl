/**
 * Base ESLint Configuration for Zacatl
 *
 * Provides foundational TypeScript linting rules that can be extended
 * by consuming projects.
 *
 * Usage:
 * import { baseConfig } from "@sentzunhat/zacatl/eslint";
 * // or
 * import baseConfig from "@sentzunhat/zacatl/eslint/base";
 *
 * export default [
 *   baseConfig,
 *   // ... additional configs
 * ];
 */

import tsEslintParser from '@typescript-eslint/parser';
import tseslint from 'typescript-eslint';
import js from '@eslint/js';

const baseConfig = {
  ...js.configs.recommended,

  files: ['src/**/*.ts', '!src/**/*.d.ts'],
  languageOptions: {
    parser: tsEslintParser,
    parserOptions: {
      project: ['./tsconfig.json', './test/tsconfig.json'],
    },
    globals: {
      __dirname: 'readonly',
      process: 'readonly',
      console: 'readonly',
    },
  },
  plugins: {
    '@typescript-eslint': tseslint.plugin,
  },
  rules: {
    // TypeScript-specific rules
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-empty-object-type': [
      'error',
      {
        allowInterfaces: 'always', // Empty interfaces OK for ports
        allowObjectTypes: 'never', // Disallow literal {} types
      },
    ],
    '@typescript-eslint/explicit-function-return-type': [
      'warn',
      {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
        allowHigherOrderFunctions: true,
      },
    ],
    // Prefer type-only imports where possible to avoid bundlers pulling runtime deps
    '@typescript-eslint/consistent-type-imports': [
      'error',
      {
        prefer: 'type-imports',
      },
    ],
    'no-unused-vars': 'off', // Use TypeScript-specific rule instead
  },
};

export default baseConfig;
export { baseConfig };
