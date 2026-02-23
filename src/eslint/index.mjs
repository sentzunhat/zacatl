/**
 * Zacatl ESLint configs for TypeScript and hexagonal patterns.
 *
 * @returns Flat config arrays; no side effects.
 *
 * @example
 * import { recommended } from "@sentzunhat/zacatl/eslint";
 */

import baseConfig from './base.mjs';
import importsConfig from './imports.mjs';
import namingConventions from './naming-conventions.mjs';
import fileNamingRules from './file-naming.mjs';
import solidConfig from './solid.mjs';

/**
 * Recommended ESLint configuration combining all Zacatl configs
 */
const recommended = [baseConfig, importsConfig, namingConventions, fileNamingRules, ...solidConfig];

// Named exports for granular control
export { baseConfig, importsConfig, namingConventions, fileNamingRules, solidConfig, recommended };

// Default export for convenience
export default recommended;
