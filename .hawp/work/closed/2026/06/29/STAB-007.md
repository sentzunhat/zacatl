# Review ESLint config hierarchy and import-order baseline

input: |
  The repository uses separate ESLint layers for `src`, `test`, and `scripts`. The source rules are stricter, while tests and scripts are intentionally more permissive. The user wants the import sorting base to be consistent across all of them, while keeping tests and scripts more practical.

context: |
  Current config surfaces:
  - `eslint.config.mjs`
  - `eslint.src.config.mjs`
  - `eslint.test.config.mjs`
  - `src/eslint/imports.mjs`
  - `src/eslint/scripts.mjs`

  The source config already treats `import/order` as an error, while the test and script configs currently soften several rules to warnings. The goal is to make the structure coherent rather than stricter everywhere.

mission: |
  Review the ESLint config hierarchy and define a stable import-order baseline plus severity split that keeps source strict, keeps tests/scripts workable, and avoids unnecessary disable comments or policy drift.

constraints: |
  Do not over-relax source linting. Keep testing and scripts practical, but still honest about real errors. Avoid broad config churn unless it materially improves consistency and maintainability.

output: |
  A config review plan or implementation notes that show the chosen import-order baseline, the intended rule severities per area, and the verification path for `lint:silent`.
