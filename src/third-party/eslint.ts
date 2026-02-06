/**
 * ESLint and TypeScript-ESLint exports
 *
 * These are re-exported for use in ESLint config files (.mjs)
 * which don't require strict TypeScript typing.
 *
 * @example Import from third-party
 * import { tsEslintParser, tseslint, importPlugin } from "@sentzunhat/zacatl/third-party/eslint";
 *
 * @example Usage in eslint config
 * import { tsEslintParser, tseslint } from "@sentzunhat/zacatl/third-party/eslint";
 * const config = {
 *   languageOptions: { parser: tsEslintParser },
 *   plugins: { "@typescript-eslint": tseslint.plugin }
 * };
 */

// Core TypeScript ESLint packages
export { default as tsEslintParser } from "@typescript-eslint/parser";
export { default as tseslint } from "typescript-eslint";

// Additional ESLint plugins
export { default as tsEslintPlugin } from "@typescript-eslint/eslint-plugin";
export { default as importPlugin } from "eslint-plugin-import";
