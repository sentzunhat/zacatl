import path from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc";
import eslint from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import tsEslintPlugin from "@typescript-eslint/eslint-plugin";
import tsEslintParser from "@typescript-eslint/parser";
import tseslint from "typescript-eslint";

import namingConventions from "./naming-conventions.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
  {
    ignores: [
      "*.md",
      "package-lock.json",
      "package.json",
      "tsconfig.json",
      "bun.lockb",
      "build/**/*",
      "report/**/*",
      "*.config.mjs",
      "*.config.js",
      "LICENSE",
      "Dockerfile",
      "config/**/*",
      "doc/**/*",
      "locales/**/*",
    ],
  },
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
      "import/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", ["parent", "sibling", "index"]],
          pathGroups: [{ pattern: "src/**", group: "internal" }],
          pathGroupsExcludedImportTypes: ["builtin", "external"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
    },
  },
  namingConventions,
];

export { namingConventions };
