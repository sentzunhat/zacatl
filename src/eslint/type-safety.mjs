/**
 * TypeScript Type Safety Configuration for Zacatl
 *
 * Enforces strict runtime and compile-time safety patterns aligned with the
 * Zacatl coding standards:
 * - No unhandled floating promises
 * - Strict boolean expressions (no implicit truthiness from "" / 0 / null)
 * - Explicit module-boundary types on all public APIs
 * - Mark immutable class fields as readonly
 * - Prefer interface over type for object shapes (extensibility)
 * - Disallow redundant type assertions and non-null bangs
 *
 * Usage:
 * import { typeSafetyConfig } from "@sentzunhat/zacatl/eslint";
 * // or
 * import typeSafetyConfig from "@sentzunhat/zacatl/eslint/type-safety";
 *
 * export default [
 *   typeSafetyConfig,
 *   // ... additional configs
 * ];
 */

// parser and plugins are provided by baseConfig (tseslint.configs.recommended).
// Only parserOptions.project is needed here for type-checked rules.

const typeSafetyConfig = {
  files: ['src/**/*.ts'],
  languageOptions: {
    parserOptions: { project: './tsconfig.json' },
  },
  rules: {
    // All async operations must be awaited or explicitly handled — prevents swallowed errors
    '@typescript-eslint/no-floating-promises': 'error',

    // Prevents async functions being accidentally used where void is expected (e.g. forEach)
    '@typescript-eslint/no-misused-promises': 'error',

    // Requires truthiness to be explicit — `if (str)` must be `if (str !== '')` etc.
    '@typescript-eslint/strict-boolean-expressions': 'error',

    // Mark class properties never reassigned after construction as readonly
    '@typescript-eslint/prefer-readonly': ['error', { onlyInlineLambdas: false }],

    // Disallow type assertions that TypeScript's control-flow already knows
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',

    // Warn on non-null assertions (!) — prefer optional chaining or runtime guards
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // Require await inside try-catch so thrown errors remain catchable
    '@typescript-eslint/return-await': ['error', 'in-try-catch'],

    // Public API must declare explicit return types — aids documentation + consumers
    '@typescript-eslint/explicit-module-boundary-types': [
      'warn',
      { allowTypedFunctionExpressions: true },
    ],

    // Prefer interface for object shapes — supports declaration merging and extensibility
    '@typescript-eslint/consistent-type-definitions': ['warn', 'interface'],
  },
};

export default typeSafetyConfig;
export { typeSafetyConfig };
