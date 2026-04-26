/**
 * Script-specific overrides for Zacatl ESLint.
 *
 * These rules are intended for repository scripts and are exported from the
 * library entrypoint as `zacatlScriptsRecommended`.
 */
export const zacatlScriptsRecommended = [
  {
    files: ['scripts/**/*.{ts,cts,mts,js,cjs,mjs}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.scripts.cjs.json', './tsconfig.scripts.esm.json', './tsconfig.json'],
      },
      globals: {
        require: 'readonly',
        module: 'writable',
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-console': 'warn',
      'max-classes-per-file': ['warn', 1],
      'import/no-default-export': 'warn',
      'func-style': ['warn', 'expression', { allowArrowFunctions: true }],
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: true, optionalDependencies: false, peerDependencies: true },
      ],
    },
  },
  {
    files: ['scripts/**/*.mjs', 'scripts/**/*.cjs'],
    languageOptions: {
      parserOptions: { project: false },
    },
    rules: {
      '@typescript-eslint/strict-boolean-expressions': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/prefer-readonly': 'off',
      '@typescript-eslint/return-await': 'off',
    },
  },
];

export default zacatlScriptsRecommended;
