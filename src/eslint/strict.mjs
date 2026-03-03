// parser, plugins, and project are all provided by baseConfig (tseslint.configs.recommended).
// strict.mjs rules are AST-based; they don't need type information.

const strictConfig = {
  // Apply to all TypeScript files — _-prefix ignore pattern should be universal
  files: ['**/*.ts'],
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: false,
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'error',
  },
};

export default strictConfig;
export { strictConfig };
