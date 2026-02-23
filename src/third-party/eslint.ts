/**
 * ESLint and TypeScript-ESLint exports
 *
 * These are re-exported for use in ESLint config files (.mjs)
 * which don't require strict TypeScript typing.
 *
 * @example Import from third-party
 * import { tsEslintParser, tseslint, importPlugin } from "@zacatl/third-party/eslint";
 *
 * @example Usage in eslint config
 * import { tsEslintParser, tseslint } from "@zacatl/third-party/eslint";
 * const config = {
 *   languageOptions: { parser: tsEslintParser },
 *   plugins: { "@typescript-eslint": tseslint.plugin }
 * };
 */

// Core TypeScript ESLint packages - use runtime requires so the CJS build
// step doesn't try to resolve their ESM type entrypoints.
/* eslint-disable @typescript-eslint/no-require-imports */
export const tsEslintParser: unknown = (() => {
  try {
    // runtime import resolution may vary between environments
    const mod = require("@typescript-eslint/parser");
    const candidate = mod != null ? (mod.default ?? mod) : undefined;
    return candidate as unknown;
  } catch {
    return undefined;
  }
})();

export const tseslint: unknown = (() => {
  try {
    // runtime import resolution may vary between environments
    return require("typescript-eslint") as unknown;
  } catch {
    return undefined;
  }
})();

// Additional ESLint plugins
export const tsEslintPlugin: unknown = (() => {
  try {
    // runtime import resolution may vary between environments
    const mod = require("@typescript-eslint/eslint-plugin");
    const candidate = mod != null ? (mod.default ?? mod) : undefined;
    return candidate as unknown;
  } catch {
    return undefined;
  }
})();

export const importPlugin: unknown = (() => {
  try {
    // runtime import resolution may vary between environments
    return require("eslint-plugin-import") as unknown;
  } catch {
    return undefined;
  }
})();
/* eslint-enable @typescript-eslint/no-require-imports */
