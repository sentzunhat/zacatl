import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";
import { recommended as zacatlRecommended } from "./src/eslint/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname, resolvePluginsRelativeTo: __dirname });

const vitestOverrides = {
  files: ["test/**/*.ts", "test/**/*.tsx"],
  languageOptions: {
    globals: {
      describe: "readonly",
      it: "readonly",
      expect: "readonly",
      vi: "readonly",
      beforeEach: "readonly",
      afterEach: "readonly",
      beforeAll: "readonly",
      afterAll: "readonly",
    },
  },
  rules: {
    "import/no-extraneous-dependencies": "off",
    "no-console": "off",
  },
};

export default [...compat.config({}), ...zacatlRecommended, vitestOverrides];
