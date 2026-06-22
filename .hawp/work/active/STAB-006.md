# Audit type safety and lint suppressions for production readiness

input: |
  The repository is locally passing `type:check`, `lint:silent`, and `test`, but the codebase still contains targeted lint suppressions and a few type-oriented exceptions. The user wants the library to stay type-safe and type-literate, with warnings acceptable but errors not hidden.

context: |
  Recent stabilization work fixed the release gates and aligned the SQLite adapter tests, but the repo still has visible suppression debt:
  - many `// eslint-disable-next-line no-console` comments in scripts
  - a small number of `@typescript-eslint/*` suppressions in `src`
  - explicit warnings in the test lint config

mission: |
  Audit the repository for lint and type-safety drift, identify which suppressions are justified, and plan or apply the smallest fixes that reduce hidden errors without over-relaxing the lint policy.

constraints: |
  Keep warnings acceptable, but do not bury real errors behind broad rule disables. Preserve intentional script console usage where it is operationally useful. Do not weaken typechecking just to make the repo quiet.

output: |
  A prioritized audit or fix plan that distinguishes confirmed lint/type errors, justified suppressions, and cleanup candidates, with verification notes from the relevant local checks.
