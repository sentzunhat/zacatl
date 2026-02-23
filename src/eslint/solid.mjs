/**
 * ESM module (import/export). This file demonstrates deriving `__dirname` via
 * `fileURLToPath(import.meta.url)` which is the correct ESM pattern — prefer
 * this over legacy CommonJS `__dirname` usage.
 */

import path from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import tsEslintParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";

import namingConventions from "./naming-conventions.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: eslint.configs.recommended,
  allConfig: eslint.configs.all,
});

export default [
  {
    ignores: [
      "README.md",
      "*.md",
      "package-lock.json",
      "package.json",
      "tsconfig.json",
      "bun.lockb",
      "build/**/*",
      "report/**/*",
      "scripts/**/*",
      "*.config.mjs",
      "*.config.js",
      "eslint.config.mjs",
      "vite.config.mjs",
      "LICENSE",
      "Dockerfile",
      "config/**/*",
      "doc/**/*",
      "locales/**/*",
      "src/**/*.mjs",
    ],
  },

  // Ensure import plugin can resolve TypeScript `paths` from tsconfig
  {
    settings: {
      "import/resolver": {
        typescript: {
          project: "./tsconfig.json",
        },
      },
    },
  },

  // Provide compat + recommended bases so consumers don't duplicate setup
  ...compat.config({}),
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // Import plugin recommended base (keeps import/order centralized)
  { ...importPlugin.flatConfigs.recommended },

  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: { project: "./tsconfig.json" },
      globals: { __dirname: "readonly", process: "readonly" },
    },
    rules: {
      "@typescript-eslint/no-empty-object-type": [
        "error",
        { allowInterfaces: "always", allowObjectTypes: "never" },
      ],

      /* TypeScript strictness and best-practices */
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/strict-boolean-expressions": "error",
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": "error",
      "@typescript-eslint/explicit-module-boundary-types": [
        "warn",
        { allowTypedFunctionExpressions: true },
      ],
      "@typescript-eslint/consistent-type-definitions": ["warn", "interface"],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/prefer-readonly": ["error", { onlyInlineLambdas: false }],

      /* General best-practices */
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-throw-literal": "error",
      "consistent-return": "error",
      "max-classes-per-file": ["error", 1],

      /* import plugin rules to catch module issues */
      "import/no-default-export": "error",
      "import/no-extraneous-dependencies": [
        "error",
        {
          devDependencies: false,
          optionalDependencies: false,
          peerDependencies: true,
        },
      ],
    },
  },

  // repository-level post-rules (kept light) — repo config can add extra overrides
  {
    rules: {
      "import/no-cycle": ["error", { maxDepth: Infinity }],
      "@typescript-eslint/no-explicit-any": "error",
    },
  },

  // Allow some relaxations for internal tooling and third-party re-exports
  {
    files: ["src/third-party/**", "src/eslint/**"],
    rules: {
      "import/no-default-export": "off",
      "import/no-extraneous-dependencies": [
        "error",
        { devDependencies: true, optionalDependencies: false, peerDependencies: true },
      ],
    },
  },
];

export { namingConventions };
