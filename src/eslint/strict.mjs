import tsEslintParser from '@typescript-eslint/parser';
import tsEslintPlugin from '@typescript-eslint/eslint-plugin';

const strictConfig = {
  files: ['src/**/*.ts', '!src/**/*.d.ts'],
  languageOptions: {
    parser: tsEslintParser,
    parserOptions: {
      project: './tsconfig.json',
    },
  },
  plugins: { '@typescript-eslint': tsEslintPlugin },
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
