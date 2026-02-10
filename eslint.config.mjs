import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import path from "path";
import { fileURLToPath } from "url";
import { recommended as zacatlRecommended } from "./src/eslint/index.mjs";

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
      "src/**/*.mjs",
    ],
  },
  js.configs.recommended,
  ...compat.config({}),
  ...zacatlRecommended,
  {
    rules: {
      // Prevent circular dependencies
      "import/no-cycle": ["error", { maxDepth: Infinity }],
      // Warn when using 'any' type - promotes type safety
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
