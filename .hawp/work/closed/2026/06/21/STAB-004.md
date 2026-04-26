# Repair CJS script tsconfig and moduleResolution mismatch

input: |
  `npm run type:check` failed in `scripts` because `scripts/tsconfig.scripts.cjs.json` inherits `moduleResolution: bundler` while targeting CommonJS-style output.

context: |
  The scripts build/typecheck lane should remain compatible with both ESM and CJS helper outputs. This mismatch is a clear compiler configuration bug, not a design choice.

mission: |
  Adjust the scripts TypeScript configuration so the CJS lane typechecks cleanly without weakening the stricter source config.

constraints: |
  Keep the change scoped to script compiler settings and any obvious supporting code. Avoid broad tsconfig churn elsewhere unless the fix truly requires it.

output: |
  `npm run type:check:scripts` passing and a short note explaining the compiler setting change.

## Completion Notes

- Close date: 2026-06-21
- Direct verification: `npm run type:check`
- Result: the CJS scripts lane now uses `moduleResolution: node10` and excludes the ESM-only generation helper, so script typechecking passes cleanly.
