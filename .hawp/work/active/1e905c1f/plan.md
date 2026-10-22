# Review import/export and path-generation scripts for scalable maintenance

**Backlog ID (Legacy):** — (UUID-native item)
**UUID:** `1e905c1f-b6dd-4236-81f2-d406479d8f17`
**Type:** improvement
**Reported:** 2026-10-21

---

## Input (verbatim)

> Audit the scripts that generate source path aliases, synchronize package exports, rewrite runtime aliases, prepare publish output, and prune barrels. Check source-of-truth boundaries, generated versus handwritten ownership, idempotence, repository-root/cwd assumptions, validation, test coverage, cross-platform paths, and future scale. Propose a small follow-up plan without refactoring before review.

## Intake Summary

Review the scripts that generate TypeScript source aliases, synchronize local
package exports, rewrite runtime aliases, prepare publish output, and prune
nested barrels. Decide whether the maintenance flow has clear canonical inputs,
portable execution, and scalable validation before proposing refactors.

## Current Context

The publish build runs TypeScript builds and then `postbuild`, which invokes
`local:exports` followed by `prune:barrels`. The source alias generator,
runtime alias rewriter, local export synchronizer, publish preparation,
shared export policy, and barrel pruning are separate programs with related
responsibilities. Existing work `19965b11` owns the DI and third-party export
contract; `b0649873` owns source-root placement and export mapping. This item
will audit scripts and their interfaces without changing product behavior or
moving source folders.

## Initial Analysis

**Directly verified:**

- `scripts/dev/generate-tsconfig-paths.ts` scans source directories and writes
  TypeScript path mappings. Its header says the generated section is replaced,
  while the current implementation replaces `compilerOptions.paths` and keeps
  only explicit aliases.
- `scripts/dev/sync-local-exports.ts` writes the root package export map from
  discovered build artifacts and uses `process.cwd()` for project paths.
- `scripts/publish/export-policy.ts` is shared by export synchronization and
  publish preparation; `scripts/publish/prepare-publish.ts` stages package
  metadata and export targets.
- `scripts/publish/prune-barrels.ts` compares build outputs to package exports
  and also has a `process.cwd()` package-manifest default.
- `scripts/build/rewrite-runtime-aliases.ts` and `scripts/build/fix-esm.ts`
  participate in build output rewriting/fixup.
- `postbuild` invokes local export synchronization and barrel pruning. No
  `.hawp/config/search.json` existed before this intake; HAWP search was using
  the default `.hawp/kit` and `.hawp/work` paths.

**Inferred (not yet proven):**

- Multiple scripts may encode overlapping assumptions about source roots,
  export eligibility, and working directory. A structured audit should verify
  rather than merge them based on naming similarity.
- Repository-root execution may be an undocumented precondition for scripts
  using `process.cwd()`, and may limit editor, CI, or package-manager use from
  nested directories.

**Likely scope:**

- Trace inputs, outputs, generated ownership, and call order for the alias and
  export/publish pipeline.
- Check deterministic/idempotent behavior, cwd independence or explicit cwd
  contracts, platform-safe path handling, error messages, and test coverage.
- Produce options and a small sequenced follow-up plan. Do not refactor scripts
  or alter public exports in this audit.

## Options considered

- **Consolidate scripts before analysis:** might reduce code duplication, but
  risks merging tools with different local-build and publish responsibilities
  before their contracts are understood. Not recommended at this stage.
- **Audit boundaries, inputs, generated ownership, and portability first:**
  produces evidence for small follow-up changes while preserving current
  package behavior. Recommended.

## Plan

1. Map each script's inputs, outputs, call sites, and authoritative policy
   sources, including the relationship between local export sync and publish
   preparation.
2. Compare docs and tests with actual behavior, especially generated path
   ownership, `compilerOptions.paths` preservation, repository-root discovery,
   and export filtering.
3. Evaluate maintainability and scale using concrete cases: new source modules,
   optional-peer subpaths, package execution from a nested cwd, Windows paths,
   missing build artifacts, and repeat runs.
4. Recommend small follow-up items in dependency order, keeping public export
   contract changes under `19965b11` and source-root moves under `b0649873`.
5. Review the recommendations before implementation; record what needs tests
   and what behavior must remain stable.

## Acceptance

- The canonical inputs and generated outputs for each reviewed script are
  documented with exact repository-relative paths.
- Current behavior is distinguished from stale comments or assumptions.
- Idempotence, path portability, failure handling, and coverage have evidence
  or are explicitly marked unproven.
- Recommendations are small, separately reviewable, and do not pre-decide a
  script consolidation or source-tree move.
- No runtime or publish behavior changes are included in this audit.

## Risk + Review Gate

**Risk:** low for the read-only audit; proposed script changes may be medium.
**Gate:** provide recommendations for owner review before any non-trivial
script behavior changes.

## Dependencies and Overlap

Coordinate with `19965b11` for alias/export contracts and `b0649873` for source
root ownership. Keep this item focused on script design and maintenance. It may
create linked follow-up work after the audit but should not duplicate existing
DI, package API, or folder-move tasks.

## Backlog + Plan Link

**Status now:** in-progress; audited migration changes are being applied in
separate path, export/publish, and asset/runtime slices.
**Plan file:** `.hawp/work/active/1e905c1f/plan.md`

## Next Step

- [x] Investigation recorded
- [x] Audit plan written
- [x] Review audit boundaries and conduct the script-by-script assessment
- [x] Record owner-approved breaking path policy and ESLint entry names
- [ ] Apply and review the first migration slices


### Planning refinement — audit targets

Trace this flow as one pipeline with separate responsibilities:
`scripts/dev/generate-tsconfig-paths.ts` -> `tsconfig.base.json`;
`scripts/build/rewrite-runtime-aliases.ts` and `scripts/build/fix-esm.ts`;
`scripts/dev/sync-local-exports.ts` plus
`scripts/publish/export-policy.ts`; `scripts/publish/prepare-publish.ts`; and
`scripts/publish/prune-barrels.ts`. `package.json` runs export synchronization and
barrel pruning from `postbuild`; publish commands then stage the package.

Check the confirmed stale generator header against its behavior: it describes
replacement of a generated paths section while current code replaces
`compilerOptions.paths` and restores only its hard-coded explicit aliases.
Search results did not reveal dedicated path-generator or runtime-alias
rewriter tests; verify test coverage before treating this as a gap.

Audit representative scenarios without changing production scripts: repeat-run
idempotence, invocation from a nested working directory, new facade and
optional-peer source modules, missing/partial ESM and CJS artifacts, Windows
path separators, and differences between local export sync and publish export
preparation. Deliver a prioritized findings report and proposed implementation
slices; do not consolidate the scripts during the audit.


## Audit findings and staged implementation brief

**Confirmed:**

1. `scripts/dev/generate-tsconfig-paths.ts` has stale ownership comments: its
   header describes a marker-delimited generated section that preserves manual
   paths, while it rewrites all of `compilerOptions.paths` and merges only
   `EXPLICIT_PATHS`. It catches and warns on directory-read errors, then can
   write a partial path map.
2. `scripts/dev/sync-local-exports.ts`,
   `scripts/publish/prepare-publish.ts`, and related tooling use `process.cwd()`
   as the project root. That fits root-level npm scripts but not nested direct
   invocation; decide whether root-only execution is a contract or support
   root discovery explicitly.
3. `scripts/publish/prepare-publish.ts` deletes/recreates `publish/`, warns
   rather than failing when build sources are missing, and validates staged
   exports/bin targets later. Preserve that staged-target validation. Its
   fallback export discovery is separate from `scripts/publish/export-policy.ts`
   and can diverge from local export sync when root exports are absent.
4. `prepare-publish.ts` calls `pruneNestedBarrelIndexes()` before writing the
   staged manifest, so pruning reads the root export targets by default. The
   current package uses explicit leaf targets; nested exported index targets
   need a fixture before classifying this as a production defect.
5. `package.json`'s `postbuild:esm` and `postbuild:cjs` use POSIX `mkdir -p` and
   `cp -R`, with `|| true` masking failures.
6. No package script, workflow, or script call site was found for
   `scripts/build/rewrite-runtime-aliases.ts`; treat its use as unclear/manual,
   not definitely dead. Existing `test/unit/third-party/export-strategy.test.ts`
   is the only focused test found for the alias/export policy area; no dedicated
   tests were found for the generator, runtime rewriter, local sync, publish
   prepare, or barrel prune.

**Recommended implementation order:**

1. Correct generator comments; make incomplete directory traversal fail closed;
   add fixture tests for deterministic mapping, explicit aliases, repeat runs,
   and unreadable/partial input.
2. Decide root invocation contract. If nested invocation is required, add a
   shared repository-root resolver and test it; otherwise document and validate
   the root-level precondition in each CLI.
3. Align local and publish fallback export policy and pass publish-stage export
   targets into pruning; fixture-test missing outputs, optional-peer leaves,
   explicit DI export, fallback maps, and nested index export preservation.
4. Replace shell `mkdir`/`cp` asset copying with a portable Node helper and make
   copy failures visible.
5. Establish whether the runtime alias rewriter has a supported caller before
   changing its fixed list or considering deletion.

Treat steps 2–4 as separate reviewable slices, medium/high risk because they
affect local module resolution and publish contents. No script consolidation or
production behavior change should be bundled into the initial generator tests.

### Owner-updated source layout impact — 2026-10-21

The current worktree relocates ESLint assets from `src/eslint/` to
`src/third-party/eslint/` and locale assets from `src/localization/locales/` to
`src/third-party/localization/locales/`. The `package.json` postbuild commands
and Docker copy instructions still name the old paths. Include these moves as a
concrete migration fixture for asset-copy and publish preparation: required
assets must exist in both ESM/CJS build trees and the staged publish tree, and
copy errors must surface instead of being hidden by `|| true`. Keep export-map
target rewriting and copy-source paths as separate assertions so a correct
manifest cannot mask missing runtime assets.

The owner explicitly chose to remove old package subpaths and avoid compatibility
facades. The generator/sync/publish audit must therefore confirm that retired
subpaths disappear and the direct new layout is exported consistently in local
and staged manifests. Do not preserve old names as hand-authored exceptions;
retain only exceptions for real entry files that remain part of the new design.
Document the break and migration mapping in release notes as part of the
implementation, not as runtime compatibility code.

### Parallel manager audit — source relocation and export pipeline — 2026-10-21

**Confirmed alias-generation findings:** `tsconfig.base.json`,
`scripts/tsconfig.json`, and `vite.config.mjs` still map the removed
`@zacatl/configuration` and `@zacatl/localization` paths. The new canonical
source paths are `@zacatl/utils/configuration` and
`@zacatl/third-party/localization`, including their leaves. The exact Vite
`@zacatl/third-party` mapping to `src/third-party.ts` can be shadowed by the
later generic prefix mapping to the directory. `scripts/tsconfig.json` replaces
inherited paths and needs its own synchronization. The path generator still has
a stale `src/configuration/json.ts` example, a caught read-error path that can
write partial aliases, and an explicit legacy DI alias that must be removed or
renamed to the selected canonical path. It does not generate aliases for the
moved `.mjs` config tree.

**Confirmed export collision:** the owner-moved `src/third-party/eslint.ts`
compiles to `third-party/eslint.js`, while `src/third-party/eslint/` contains
the shareable ESLint config tree. `shouldExportBuildArtifact()` includes the
compiled wrapper leaf but excludes nested `index.mjs`, so the current export
policy cannot give both meanings one clear `./third-party/eslint` subpath. The
owner approved this resolution: rename the vendor-package wrapper to
`src/third-party/eslint-plugins.ts`, and reserve `./third-party/eslint` for the
shareable config tree. Explicitly publish that tree's `index.mjs`; do not add an
old-path compatibility facade. This naming decision is settled.

**Confirmed build/publish findings:** `package.json` postbuild commands still
copy the old `src/eslint` and `src/localization/locales` trees and suppress copy
errors; `prepare-publish.ts`'s ESM-to-CJS fallback still uses build-root
`eslint/` and `localization/`. Update both to the selected `third-party/` paths
and verify nested destinations. `prepare-publish.ts` warns and continues when
build inputs are absent, and calls barrel pruning before the staged package
manifest exists; pruning defaults to the root package export targets. Required
publish inputs should fail clearly, and pruning should receive the staged
manifest's export-target set.

**Confirmed runtime/container findings:** locale lookup checks the new sibling
`locales` directory first but retains old source/build fallbacks. The secondary
locale helper has old candidates too. `examples/Dockerfile` and
`examples/DOCKER.md` still copy locale and ESLint assets from the previous source
locations. Determine whether the Docker stages need these source copies after
the new build tree contains the assets. The runtime alias rewriter has no
repository package-script/workflow caller found; retain it until its supported
consumer is established. Three example build callers exist and belong in the
call-site inventory.

**Implementation sequence:**

1. Rename the wrapper to `eslint-plugins.ts`, explicitly export the shareable
   config `index.mjs`, and record the breaking old-to-new path map.
2. Select one canonical alias source of truth; regenerate root and script
   TypeScript paths and align Vite exact aliases, deleting old aliases without
   compatibility fallbacks. Fix generator stale comments and fail closed on
   incomplete traversal.
3. Make ESM/CJS asset copying derive from one declared mapping, target nested
   `third-party/` locations, and surface missing inputs/copy errors.
4. Generate local and publish export manifests from the same policy; remove old
   public keys; validate each target and pass the staged target set into barrel
   pruning. Fixture-test missing/partial builds, the new config/localization
   paths, locale assets, distinct ESLint entries, DI, and nested indexes.
5. Update runtime locale candidates and Docker/example paths; exercise locale
   resolution in source, local build, publish tree, and Docker separately.
6. Establish rewriter support contract before modifying or removing it.

The ESLint namespace collision is resolved. Risk remains high until the exact
generated public path map and asset destinations are implemented and exercised.
The first implementation PR should not consolidate unrelated scripts; keep
generator correctness, export/publish correctness, and runtime/container wiring
as separately reviewable slices within the overall migration.

### Current-head Copilot source-mode alias finding — 2026-10-22

Seven new Copilot comments on PR #180 head `ffb80630` repeat one confirmed
configuration defect across the seven `examples/*/apps/backend/tsconfig.dev.json`
files: each child replaces its parent `paths` map, includes an exact
`@sentzunhat/zacatl/service` mapping, and omits the public
`@sentzunhat/zacatl/*` source wildcard. Deep `/service/...` imports therefore
do not resolve to the current source tree. `npx tsc --showConfig` confirms the
inherited build wildcard is absent from the effective child config. The
existing internal `@zacatl/*` wildcard is already present; do not duplicate it.

The same root cause is repeated, not seven distinct fixes. Add the public
package wildcard to `src` in all seven configs while retaining more-specific
aliases, then verify resolved module paths directly so package/build fallback
cannot produce a false-positive type check. No repository command or workflow
currently invokes these `tsconfig.dev.json` files; the advertised source-mode
checks are therefore not demonstrated by CI. Copilot's runtime/ORM-scope
consequence is not demonstrated by repository usage and should not be stated as
a confirmed current runtime bug.

The latest CI also exposed lint errors after the 0.0.66 version guard was fixed.
Those independent import-order and script-global fixes are tracked in
`b74c989a`; keep them separate from this source-resolution correction.

### Source-mode wildcard correction — 2026-10-22

Added `@sentzunhat/zacatl/* -> ../../../../src/*` to each of the seven example
`tsconfig.dev.json` files with a local `paths` map. The eighth example config
only extends its base config and continues to inherit the existing package
wildcard. Existing exact aliases and the seven internal `@zacatl/*` wildcards
remain intact. All eight example `tsconfig.dev.json` projects passed
`npx tsc --noEmit -p`; TypeScript API checks confirmed a deep Service import
resolves to `src/service/...` in each of the seven local path maps.

### Canonical import boundary clarification — 2026-10-22

Clarified and applied the import convention in `docs/utils/path-aliases.md`:
Zacatl runtime cross-module imports use internal `@zacatl/*` aliases, while
consumer applications use public `@sentzunhat/zacatl/*` package paths for
Zacatl and relative paths for their own local modules. Replaced deep relative
cross-module imports in runtime source with the generated internal aliases;
kept local barrel re-exports and nearby module imports relative. A source audit
of example TypeScript/JavaScript imports found no relative import resolving
into the repository-level `src/`. Do not rewrite valid application-local
relative imports as package imports.
