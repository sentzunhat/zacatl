import path from 'path';
import { fileURLToPath } from 'url';

import { zacatlTestsRecommended } from './src/eslint/tests.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const zacatlTestsRecommendedWithRoot = zacatlTestsRecommended.map((config) => ({
  ...config,
  languageOptions: {
    ...config.languageOptions,
    parserOptions: {
      ...config.languageOptions?.parserOptions,
      tsconfigRootDir: __dirname,
    },
  },
}));

export { zacatlTestsRecommendedWithRoot as zacatlTestsRecommended };
export default zacatlTestsRecommendedWithRoot;
