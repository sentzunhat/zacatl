import { recommended as zacatlRecommended } from './src/eslint/index.mjs';

// Source-area config: export the recommended Zacatl rule set for `src`.
// The root `eslint.config.mjs` is responsible for adding `FlatCompat` once.
export default [...zacatlRecommended];
