# Organize the `src/` root around the agreed architecture

**UUID:** `b0649873-176f-479d-8406-06940dab8cec`
**Type:** refactoring
**Reported:** 2026-10-20

## Input (verbatim)

> Clean up the root folder where the source code lives too.

## Intake summary

Inventory and reorganize the top-level `src/` structure so ownership is clear
and matches the agreed model: Service coordinates lifecycle; Layers owns
Application, Domain, and Infrastructure; Platforms owns CLI, Desktop, and
Server. Establish a target map first, then move code in small slices.

## Confirmed evidence

Current top-level folders include `configuration`, `dependency-injection`,
`error`, `eslint`, `localization`, `logs`, `service`, `third-party`, and
`utils`. Their ownership is mixed: some are cross-cutting package facilities,
while others may belong under Service, Layers, or Platforms. The current
architecture and public export map need to be considered together before
moving files.

## Decision and boundary

Do not move every root folder mechanically into `service/`. First distinguish
framework orchestration from cross-cutting package facilities and
layer/platform-owned code. Avoid a broad rename or public export change without
an import/export map and consumer impact assessment.

## Small changes

1. Inventory every `src/` top-level file/folder, its imports, runtime owner,
   package export, generated output, and documentation references.
2. Propose a target tree aligned with Service, Layers, and Platforms, including
   an explicit home for cross-cutting facilities that remain package-wide.
3. Review the target map against `package.json` exports, declaration/build
   scripts, tests, examples, and the website consumer before moving code.
4. Move one cohesive subsystem at a time, updating imports and exports in the
   same slice. Remove old paths only under the documented pre-0.1.0 policy and
   include consumer migration guidance where needed.
5. Verify each slice with type checks, focused tests, build output, example
   imports, documentation links, and final CI.

## Acceptance

- Every `src/` top-level area has a documented owner and a reason for its
  location.
- The resulting tree clearly reflects Service orchestration, Layers, and
  Platforms while keeping true shared facilities easy to find.
- Package exports and generated declarations match the new source locations.
- Moves are reviewable, consumer impact is recorded, and all required checks
  pass on the final integration head.

## Dependencies and gate

Coordinate the target map with architecture item `19965b11`, database
ownership item `bfea146e`, and Domain-boundary item `4c4365a1`. Agree on the
map before implementation; keep this separate from the public compatibility
cleanup in item `533c3a53`.

**Status:** in-progress. The owner-proposed file moves are present in the worktree;
aliases, exports, build/runtime paths, and docs are being aligned with the
approved breaking-path decision.


## 2026-10-21 scope clarification: root layout, third-party docs, and ESLint

Keep this existing item as the owner for the source-root and folder-placement
decision. The requested review includes `src/third-party.ts` alongside
`src/third-party/`, whether wrapper/facade files are placed consistently,
whether the root is clean, and whether `src/eslint/` should move. Do not assume
that a move is needed: `scripts/eslint.config.mjs` imports the shared script
configuration from `src/eslint/scripts.mjs`, and package exports, generated
paths, tests, examples, and docs must be traced before choosing a target.

The architecture diagrams in `docs/guidelines/architecture.md` and
`docs/guidelines/framework-overview.md` are in scope only for alignment to the
reviewed target tree. `docs/utils/path-aliases.md` currently maps the public
third-party alias to `src/third-party/`, although the root barrel is the sibling
file `src/third-party.ts`; the docs correction belongs to the documentation
alignment item `04b3e320`, coordinated with this target-map decision.

**Next investigation:** inventory each top-level `src/` path, runtime owner,
package export, test/example use, and documentation reference. Propose a target
tree and explicit disposition for `src/eslint/` before any file moves.


### Planning refinement — source root and ESLint decision

The root inventory should distinguish `src/eslint/` (the package's shareable
ESLint configs) from `src/third-party/eslint.ts` (a vendor wrapper). The former
is currently copied to ESM/CJS build outputs in `package.json`, exported through
ESLint package subpaths, imported by `scripts/eslint.config.mjs`, and specially
handled by `scripts/publish/prepare-publish.ts`. These are direct reasons it may
remain a package-wide root area. Compare at least two target options: retain it
at root with ownership documentation, or move it only if a real architecture
benefit justifies coordinating all published paths and tooling consumers.

For third-party layout, keep the sibling public barrel `src/third-party.ts`
distinct from `src/third-party/` implementation and wrapper files. Package
exports in `package.json` and TypeScript mappings in `tsconfig.base.json`
intentionally expose explicit facade/leaf paths; do not infer a need for a
folder-level barrel. The target map must cover the wrapper README, DI facade and
implementation, database wrappers, `src/third-party/eslint.ts`, and any
root-level cross-cutting modules.

**Decision sequence:** inventory exact files and owners; trace package exports,
TypeScript aliases, build copies and publish rewrites; search tests/examples/docs
and consumer use; compare keep/move options; review a target tree; then create a
separate bounded implementation item only if a move is selected. Any move is
medium/high risk due to published path compatibility. No move or API change is
authorized by this inventory plan.


### Implementation-ready target map proposal

**Owner-updated working layout observed 2026-10-21:** the live worktree now
moves configuration to `src/utils/configuration{.ts,/}`, and localization plus
shareable ESLint files to `src/third-party/{localization{.ts,/},eslint/}`.
`src/service/service.ts` now imports the localization facade from
`../third-party/localization`. Preserve these owner edits as the current proposal;
the prior keep-at-root target map is superseded. This is not yet a validated or
complete migration.

The observed layout leaves important wiring stale: `tsconfig.base.json`,
`scripts/tsconfig.json`, `vite.config.mjs`, package postbuild asset-copy scripts,
Docker copy instructions, examples, tests, and documentation still refer to old
source paths. The owner has now decided to allow the old package paths to break
and explicitly prefers no compatibility facades. Therefore retire old
`./configuration`, `./localization`, and `./eslint` entrypoints when the new
layout and export map are ready; publish the direct new subpaths instead, with
breaking-change migration notes. Do not add forwarding files or aliases that
silently keep the old public paths alive. Keep required actual integration
entrypoints such as `src/third-party/localization.ts` distinct from compatibility
shims.

**Current implementation boundary:** complete and validate the source move,
aliases, export maps, asset copying, Docker/example paths, and runtime locale
discovery as one coordinated migration slice. Preserve the owner's current
third-party organization and explicit leaf entries. Remove superseded legacy
package subpaths rather than adding compatibility forwarders. Keep any aggregate
barrels only where the new layout deliberately defines them as first-class
entrypoints, not as old-path shims.

The ESLint name collision is resolved: `src/third-party/eslint-plugins.ts` is
the vendor-package wrapper entry, and `src/third-party/eslint/index.mjs` is the
shareable config entry. Publish `./third-party/eslint-plugins` and
`./third-party/eslint` separately; the latter needs an explicit export-policy
exception for its nested `index.mjs`.

**Acceptance:** no active aliases, imports, examples, manifests, or runtime
lookups refer to removed paths. Historical changelog and migration notes may
name old paths only to explain the breaking change. Source aliases resolve in
TypeScript, Vite, and examples; package exports and ESM/CJS asset copies point
to the selected files; Docker build/runtime locale discovery uses the new
locale location; architecture and framework diagrams match the tree. Run
focused type checks, alias/export
fixtures, build and consumer checks after implementation, plus HAWP link and
diff checks. Risk is medium/high because the public paths intentionally break
and runtime asset lookup changes.
