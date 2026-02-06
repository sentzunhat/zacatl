/**
 * Zacatl ESLint Configurations
 *
 * Provides modular ESLint configurations for TypeScript projects
 * following Hexagonal Architecture patterns.
 *
 * Available configurations:
 * - baseConfig: Core TypeScript linting rules
 * - namingConventions: Port-Adapter naming patterns
 * - importsConfig: Import ordering and organization
 * - recommended: All configs combined
 *
 * Usage Examples:
 *
 * 1. Use all recommended configs:
 * ```javascript
 * import { recommended } from "@sentzunhat/zacatl/eslint";
 * export default [recommended];
 * ```
 *
 * 2. Pick specific configs:
 * ```javascript
 * import { baseConfig, namingConventions } from "@sentzunhat/zacatl/eslint";
 * export default [baseConfig, namingConventions];
 * ```
 *
 * 3. Extend with custom rules:
 * ```javascript
 * import { recommended } from "@sentzunhat/zacatl/eslint";
 * export default [
 *   recommended,
 *   {
 *     files: ["src/**\/*.ts"],
 *     rules: {
 *       // Your custom rules
 *     }
 *   }
 * ];
 * ```
 *
 * @module @sentzunhat/zacatl/eslint
 */

import baseConfig from "./base.mjs";
import importsConfig from "./imports.mjs";
import namingConventions from "./naming-conventions.mjs";
import fileNamingRules from "./file-naming.mjs";

/**
 * Recommended ESLint configuration combining all Zacatl configs
 */
const recommended = [
  baseConfig,
  importsConfig,
  namingConventions,
  fileNamingRules,
];

// Named exports for granular control
export {
  baseConfig,
  importsConfig,
  namingConventions,
  fileNamingRules,
  recommended,
};

// Default export for convenience
export default recommended;
