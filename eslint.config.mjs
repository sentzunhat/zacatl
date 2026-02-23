import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";
import { recommended as zacatlRecommended } from "./src/eslint/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname, // optional; default: process.cwd()
  resolvePluginsRelativeTo: __dirname, // optional
});

const tsEslintPlugin = await import("@typescript-eslint/eslint-plugin");

const scriptsConfig = {
  files: ["scripts/**/*.ts"],
  languageOptions: {
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: ["./scripts/tsconfig.scripts.esm.json"],
      tsconfigRootDir: __dirname,
    },
  },
  plugins: {
    "@typescript-eslint": tsEslintPlugin.default || tsEslintPlugin,
  },
  rules: {},
};

export default [...compat.config({}), ...zacatlRecommended, scriptsConfig];
