import path from 'path';
import { fileURLToPath } from 'url';

import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';

import { recommended as zacatlRecommended } from './src/eslint/index.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
  recommendedConfig: eslint.configs.recommended,
  allConfig: eslint.configs.all,
});

// Top-level ignores — build artifacts, examples, and generated files
const topIgnore = {
  ignores: [
    'examples/**',
    'build-src-esm/**',
    'build-src-cjs/**',
    'build-scripts-esm/**',
    'build-scripts-cjs/**',
    'coverage/**',
    'publish/**',
    'node_modules/**',
  ],
};

const testDefault = (await import('./eslint.test.config.mjs')).default ?? [];

let scriptsDefault = [];
try {
  scriptsDefault = (await import('./scripts/eslint.config.mjs')).scriptsEslintConfig ?? [];
} catch {
  scriptsDefault = [];
}

export default [
  topIgnore,
  ...compat.config({}),
  ...zacatlRecommended,
  ...testDefault,
  ...scriptsDefault,
];
