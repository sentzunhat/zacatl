# Fix immediate script lint drift in generate-tsconfig-paths tooling

input: |
  `npm run lint:silent` reported one script error in `scripts/dev/generate-tsconfig-paths.ts` for an unused `GENERATED_HEADER`, plus a warning about a boolean conditional.

context: |
  The script is part of the new path-generation work and should be lint-clean before broader stabilization work depends on it.

mission: |
  Clean up the script lint issues without changing the intended behavior of path generation.

constraints: |
  Keep the change local to the script and closely related helpers. Do not broaden into unrelated refactors or path-policy changes.

output: |
  Lint-clean script code and a re-run result that shows the script lane is no longer failing for this item.

## Completion Notes

- Close date: 2026-06-21
- Direct verification: `npm run lint:silent`
- Result: `scripts/dev/generate-tsconfig-paths.ts` no longer trips the script lint lane.
