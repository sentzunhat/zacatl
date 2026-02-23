import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Scripts-specific linting: use scripts/tsconfig.json, allow console and dev deps
export default [
  {
    files: ['scripts/**/*.ts'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
      },
      globals: { process: 'readonly', __dirname: 'readonly' },
    },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.json' } },
    },
    rules: {
      '@typescript-eslint/no-empty-object-type': [
        'warn',
        { allowInterfaces: 'always', allowObjectTypes: 'never' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/explicit-module-boundary-types': [
        'off',
        { allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
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
