import path from 'path';
import { fileURLToPath } from 'url';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import importPlugin from 'eslint-plugin-import';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Scripts-specific linting: support various script file extensions and allow dev deps
export default [
  {
    plugins: { '@typescript-eslint': tsPlugin, import: importPlugin },
    files: ['scripts/**/*.{ts,cts,mts,js,cjs,mjs}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ['./tsconfig.scripts.cjs.json', './tsconfig.scripts.esm.json', './tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      globals: {
        require: 'readonly',
        module: 'writable',
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      '@typescript-eslint/no-empty-object-type': [
        'warn',
        { allowInterfaces: 'always', allowObjectTypes: 'never' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/explicit-module-boundary-types': [
        'off',
        { allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
      'no-console': 'off',
      'prefer-const': 'warn',
      'no-throw-literal': 'warn',
      'consistent-return': 'warn',
      'max-classes-per-file': ['warn', 1],
      'import/no-default-export': 'off',
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: true, optionalDependencies: false, peerDependencies: true },
      ],
    },
  },
];
