# Audit import extensions and TypeScript resolution for code files

input: |
  The repository still has code imports that include file extensions, especially in `scripts/`, and the user wants the codebase to prefer imports without extensions where possible. The TypeScript config should be aligned so extensionless imports work reliably instead of depending on ad hoc per-file exceptions.

context: |
  A quick scan already shows extension-bearing imports in the script/tooling layer, while the main `tsconfig.json` includes `src/**/*.ts` and `src/**/*.js` under the current bundler resolution setup. This suggests the issue is real but should be audited carefully before changing resolution rules.

mission: |
  Audit `src/`, `scripts/`, and any relevant support configs for import-specifier extension drift, then either fix the imports or produce a concrete plan for the minimal TypeScript and ESLint changes needed to support extensionless imports consistently.

constraints: |
  Keep the change compatible with the current ESM/CJS build split. Do not weaken TypeScript resolution globally unless that is required to preserve working imports. Avoid changing generated outputs by hand if the source config can be updated instead.

output: |
  A scoped audit or fix plan that identifies which files still use extension-bearing imports, which ones can be converted to extensionless imports, and what TypeScript or tooling config must change for the pattern to hold.
