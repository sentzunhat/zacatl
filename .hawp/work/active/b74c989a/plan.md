# Restore the publish dry-run lint gate after the Service alias migration

**Backlog ID (Legacy):** — (UUID-native item)
**UUID:** `b74c989a-5ae4-4962-9b76-d79ee5c77290`
**Type:** bug
**Reported:** 2026-10-22

---

## Input (verbatim)

> CI on PR #180 head ffb80630 passes prepublish guard, 85 tests, type checks, and downstream checks but fails lint:silent: 13 src import/order errors across 11 Service files, plus 3 scripts no-undef errors for console in scripts/build/copy-runtime-assets.mjs (two lines) and scripts/graphics/generate-zacatl-featured-card.mjs (one line). Plan a focused lint correction and verification so publish:dry:ci can reach build/package/consumer dry-run stages. Do not publish or merge.

## Intake Summary

The version guard was corrected on PR #180 head `ffb80630`, which allowed the
publish dry-run to continue. The run then failed at `lint:silent`, before the
build, package preparation, consumer smoke, and `npm publish --dry-run` stages.
The independent source-alias review and the lint failure are tracked separately
under `1e905c1f` and this item.

## Current Context

The package is prepared as `0.0.66`; this item only addresses the CI lint
failure. No publish or merge is authorized by this work item. The CI run is
[`39792969590`](https://github.com/sentzunhat/zacatl/actions/runs/39792969590).

## Initial Analysis

**Directly verified:**

- CI passed the prepublish guard, all 85 test files, and all source/test/script
  type checks on PR head `ffb80630`.
- `lint:src` failed with 13 `import/order` errors across ten Service source
  files, including import ordering for the new `@zacatl/third-party` aliases
  and two relative-import ordering errors in database files.
- `lint:scripts` failed with three `no-undef` errors for `console`: two in
  `scripts/build/copy-runtime-assets.mjs` and one in
  `scripts/graphics/generate-zacatl-featured-card.mjs`.
- Eight Docker smoke jobs, CVE scan, and peer-install check passed. The dry-run
  stopped before build/package/consumer-smoke steps.
- The PR remains open and draft; no code was changed during this audit.

**Inferred (not yet proven):**

- The Service import-order errors likely came from alias rewrites that changed
  ESLint's grouping/order classification. Confirm the configured import groups
  before applying an automatic fix.
- The `console` errors may indicate missing Node globals in the scripts lint
  config or an inappropriate logging choice; inspect existing script
  conventions before deciding between config and source changes.

**Likely scope:**

- `src/service/**/*.ts` files named in CI lint output.
- `scripts/build/copy-runtime-assets.mjs` and the graphics generator, subject
  to confirming whether the private card generator should remain in PR #180.
- ESLint configuration only if the intended Node runtime globals are not
  declared for the scripts scope.

## Risk + Review Gate

**Risk:** medium — lint fixes could accidentally reorder or regroup imports;
script-global changes affect validation for build and graphics tools.
**Gate:** focused lint changes and review before the full publish dry-run.

## Backlog + Plan Link

**Status now:** in-progress
**Plan file:** work/active/b74c989a/plan.md

## Plan

1. Reproduce and isolate the exact 13 source import-order errors and three
   script `no-undef` errors with the repo lint commands.
2. Make import ordering conform to the configured grouping while preserving
   runtime behavior; decide whether the script errors call for Node-global
   config or narrow source adjustments.
3. Run `npm run lint:silent` and focused affected-file checks.
4. Rerun `npm run publish:dry:ci` on the corrected PR head and confirm it gets
   through build, export preparation, optional-peer checks, consumer smokes,
   and npm dry-run.
5. Record the CI evidence; do not publish, merge, or claim release completion.

## Implementation Update — 2026-10-22

- Applied ESLint's import-order auto-fixes to the ten Service files reported by
  the CI run.
- Added `console` as a read-only Node global in the shared scripts lint config;
  this covers the runtime asset copier and the graphics generator without
  weakening `no-undef` or changing script behavior.
- `npm run lint:silent` passes with the existing warning baseline and no
  errors; `npm run type:check` passes.
- All eight example `tsconfig.dev.json` projects type-check. A TypeScript API
  resolution check confirms deep Service imports in each of the seven local
  path maps resolve to `src/service/...` rather than build output.
- `npm run publish:dry:ci` completes through the final npm publish dry-run on
  Node 26.3.0 / npm 11.17.0. Consumer fixtures pass; the two Sequelize
  fixtures report the known consumer-owned nested UUID advisory.
- The matching GitHub run on the pushed commit is pending and must be read
  back before closing this item. No package was published.

## Acceptance

- The affected lint targets pass with no new errors.
- The publish dry-run completes successfully through the npm dry-run stage.
- No release, publication, or merge occurs as part of the fix.
