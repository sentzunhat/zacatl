/**
 * Zacatl ESLint configs for TypeScript and hexagonal patterns.
 *
 * @returns Flat config arrays; no side effects.
 *
 * @example
 * import { recommended } from "@sentzunhat/zacatl/eslint";
 */

import baseConfig from './base.mjs';
import bestPracticesConfig from './best-practices.mjs';
import fileNamingRules from './file-naming.mjs';
import importsConfig from './imports.mjs';
import namingConventions from './naming-conventions.mjs';
import solidConfig from './solid.mjs';
import strictConfig from './strict.mjs';
import typeSafetyConfig from './type-safety.mjs';

/**
 * Recommended ESLint configuration combining all Zacatl configs.
 *
 * Composition order (each layer builds on the previous):
 *  1. baseConfig        — js.recommended + tseslint.recommended + core overrides
 *  2. strictConfig      — no-explicit-any, no-unused-vars
 *  3. typeSafetyConfig  — strict-boolean-expressions, no-floating-promises, prefer-readonly …
 *  4. bestPracticesConfig — prefer-const, no-var, eqeqeq, prefer-template …
 *  5. importsConfig     — import/order, no-unresolved, TypeScript resolver
 *  6. namingConventions — PascalCase classes, camelCase methods, UPPER_CASE enums …
 *  7. fileNamingRules   — kebab-case files, -port.ts / -adapter.ts suffixes
 *  8. solidConfig       — max-classes-per-file, no-default-export, no-cycle
 */
const recommended = [
  ...baseConfig,
  strictConfig,
  typeSafetyConfig,
  bestPracticesConfig,
  importsConfig,
  namingConventions,
  fileNamingRules,
  ...solidConfig,
];

// Named exports for granular control
export {
  baseConfig,
  strictConfig,
  typeSafetyConfig,
  bestPracticesConfig,
  importsConfig,
  namingConventions,
  fileNamingRules,
  solidConfig,
  recommended,
};

// Default export for convenience
export default recommended;
