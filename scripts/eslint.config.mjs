import path from 'path';
import { fileURLToPath } from 'url';

import { zacatlScriptsRecommended } from '../src/eslint/scripts.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const zacatlScriptsRecommendedWithRoot = zacatlScriptsRecommended.map((config) => ({
  ...config,
  languageOptions: {
    ...config.languageOptions,
    parserOptions: {
      ...config.languageOptions?.parserOptions,
      tsconfigRootDir: __dirname,
    },
  },
}));

export { zacatlScriptsRecommendedWithRoot as zacatlScriptsRecommended };
