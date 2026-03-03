/**
 * General JavaScript/TypeScript Best Practices for Zacatl
 *
 * Language-level rules not tied to TypeScript type-checking, covering:
 * - Modern JS idioms: const, no-var, template literals, arrow callbacks
 * - Clarity and predictability: eqeqeq, consistent-return, object-shorthand
 * - Defensive coding: no-throw-literal, no-param-reassign
 *
 * These rules do not require a tsconfig project reference — they are syntax-level
 * checks that run fast and do not need the full TypeScript language service.
 *
 * Usage:
 * import { bestPracticesConfig } from "@sentzunhat/zacatl/eslint";
 * // or
 * import bestPracticesConfig from "@sentzunhat/zacatl/eslint/best-practices";
 *
 * export default [
 *   bestPracticesConfig,
 *   // ... additional configs
 * ];
 */

const bestPracticesConfig = {
  files: ['src/**/*.ts'],
  rules: {
    // Use the logger adapter rather than console.log — allow warn/error for emergencies
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // Prefer const for all bindings that are never reassigned
    'prefer-const': 'error',

    // No var — var is function-scoped and has no place in modern ESM code
    'no-var': 'error',

    // Throw proper Error objects — throwing strings hides stack traces
    'no-throw-literal': 'error',

    // Every code path must return the same type — prevents subtle undefined returns
    'consistent-return': 'error',

    // Always use === / !== so coercion does not silently change semantics
    // Null exclusion: null == undefined is idiomatic and intentional
    eqeqeq: ['error', 'always', { null: 'ignore' }],

    // Template literals over string concatenation — clearer and less error-prone
    'prefer-template': 'warn',

    // Method shorthand: { doThing() {} } not { doThing: function() {} }
    'object-shorthand': ['error', 'always'],

    // Avoid mutating function parameters — causes confusing side-effects
    // Property mutations are allowed (e.g. `req.user = ...`)
    'no-param-reassign': ['error', { props: false }],

    // Arrow functions for callbacks — lexical `this` and cleaner syntax
    'prefer-arrow-callback': ['error', { allowNamedFunctions: false }],
  },
};

export default bestPracticesConfig;
export { bestPracticesConfig };
