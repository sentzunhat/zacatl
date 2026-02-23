module.exports = [
  {
    files: ['scripts/**/*.{ts,cts,mts}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        project: ['./tsconfig.scripts.cjs.json', './tsconfig.scripts.esm.json'],
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      import: require('eslint-plugin-import'),
    },
    settings: {
      'import/resolver': { typescript: { project: './tsconfig.scripts.cjs.json' } },
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
