import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import tsEslintParser from "@typescript-eslint/parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname, // optional; default: process.cwd()
  resolvePluginsRelativeTo: __dirname, // optional
  recommendedConfig: js.configs.recommended, // optional unless you're using "eslint:recommended"
  allConfig: js.configs.all, // optional unless you're using "eslint:all"
});

export default [
  {
    ignores: [
      "README.md",
      "package-lock.json",
      "package.json",
      "tsconfig.json",
      "bun.lockb",
      "build/**/*",
      "report/**/*",
      "eslint.config.mjs",
      "vite.config.mjs",
      "LICENSE",
      "Dockerfile",
      "config/**/*",
      "doc/**/*",
      "locales/**/*",
    ],
  },
  {
    files: ["src/*.ts"],
    languageOptions: {
      parser: tsEslintParser,
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        __dirname: "readonly",
        process: "readonly",
        console: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      "no-unused-vars": "off",
    },
  },
  js.configs.recommended,
  ...compat.config({}),
];
