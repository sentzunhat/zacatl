import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Scripts-area overrides — applied on top of zacatlRecommended from the root config.
 *
 * Rules that are too strict for build/dev scripts are downgraded to 'warn'.
 *
 * Standalone use:
 *   import { recommended } from '@sentzunhat/zacatl/eslint';
 *   import scriptsOverrides from './scripts/eslint.config.mjs';
 *   export default [...recommended, ...scriptsOverrides];
 */
export default [
  {
    files: ['scripts/**/*.{ts,cts,mts,js,cjs,mjs}'],
    languageOptions: {
      // Scripts have their own tsconfig files — override the project reference only
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
    rules: {
      // Scripts are not public API — explicit boundary types add no value
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      // Build scripts use dynamic patterns that require boolean coercion
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      // Async handling in scripts is less critical to enforce strictly
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-misused-promises': 'warn',
      // Scripts may legitimately use any for CLI arg / dynamic config parsing
      '@typescript-eslint/no-explicit-any': 'warn',
      // Scripts use console for progress and diagnostic output
      'no-console': 'warn',
      // Single-class-per-file is nice-to-have in scripts
      'max-classes-per-file': ['warn', 1],
      // Scripts may use default exports for CJS compatibility
      'import/no-default-export': 'warn',
      // Scripts can import devDependencies
      'import/no-extraneous-dependencies': [
        'error',
        { devDependencies: true, optionalDependencies: false, peerDependencies: true },
      ],
    },
  },
  // .mjs/.cjs files in scripts/ are not in any tsconfig — disable project-based parsing
  // and all type-aware rules (they require parserOptions.project) for these files
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
