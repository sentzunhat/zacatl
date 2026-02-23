import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";
import { recommended as zacatlRecommended } from "./src/eslint/index.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname, resolvePluginsRelativeTo: __dirname });

export default [...compat.config({}), ...zacatlRecommended];
