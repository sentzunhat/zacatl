# Audit documentation for current source layout and public module paths

**Backlog ID (Legacy):** — (UUID-native item)
**UUID:** `04b3e320-af19-441f-9d67-fd9ccd3cf2b4`
**Type:** task
**Reported:** 2026-10-21

---

## Input (verbatim)

> Review current repository documentation for stale source paths, import/export examples, third-party module layout, root folder ownership, and contradictory diagrams. Coordinate source-root decisions with b0649873, API/example documentation with 19965b11 and 0ab7e9b2, and avoid duplicating their scopes. Include docs related to Scripts only when needed to explain their supported usage.

## Intake Summary

Inventory repository documentation against current source folders, aliases,
package exports, and examples. Record concrete stale references and plan small
alignment changes without duplicating the Service guide, DI/export, or source
root work already tracked elsewhere.

## Current Context

- `0ab7e9b2` owns the real-world Service composition guide and consumer lessons.
- `19965b11` owns the public DI/export contract and current example alias work.
- `b0649873` owns the `src/` target tree, root ownership, and where `eslint`
  belongs.
- This item covers the broader accuracy pass over supporting docs and links;
  it should route tree and API decisions back to those owning plans.

## Initial Analysis

**Directly verified:**

- `docs/utils/path-aliases.md` maps `@zacatl/third-party` to the directory
  `src/third-party/`, while `tsconfig.base.json` maps it to the sibling source
  barrel `./src/third-party.ts`.
- `docs/service/dependency-exports.md` says the root `package.json` has no
  `exports` map even though the current manifest has one. The guide also uses
  `build/esm/` for a diagnostic that should be compared with current local
  outputs under `build-src-esm/`; published-package `build/esm` examples may be
  valid if their stage is labeled.
- Other candidates for stage-aware review include the export example in
  `docs/guidelines/architecture.md`, installed path descriptions in
  `docs/localization/README.md`, and whether the testing tree in
  `docs/guidelines/testing.md` promises a mirror or gives an illustration.
- `docs/guidelines/architecture.md` and
  `docs/guidelines/framework-overview.md` include source-tree diagrams and
  examples that need comparison with the current root and `third-party/` files.
- Three source-mode example Vitest configs currently cover the public
  `@sentzunhat/zacatl/*` namespace but do not resolve internal `@zacatl/*`
  imports. The review finding is tracked in `19965b11` as the owning
  implementation item; this audit should check documentation and any related
  setup guidance, not duplicate the config fix.
- The root `docs/` tree contains roughly 70 Markdown files. HAWP search defaults
  to `.hawp/kit` and `.hawp/work`; adding `.hawp/config/search.json` can make
  project docs and selected script guidance searchable as custom Markdown.

**Inferred (not yet proven):**

- Additional public docs may have stale paths or conflicting guidance beyond
  the examples found; systematic search and link checking are needed before
  claiming the repository is aligned.
- Some diagrams may intentionally be conceptual rather than exhaustive. Their
  intended level of detail must be judged from surrounding text and current
  architecture, not mechanically expanded.

**Likely scope:**

- Inventory user-facing docs and docs that explain imports, exports, source
  layout, examples, and scripts; verify claims against source/config.
- Make narrowly scoped corrections or prepare linked changes under
  `19965b11`/`b0649873` when the source/API decision is owned there.
- Add a project HAWP search config for `.hawp/kit`, `.hawp/work`, `docs`,
  `README.md`, and relevant script documentation; verify re-indexing.

## Options considered

- **Rewrite the documentation set broadly:** may create consistent prose but
  risks erasing useful distinctions between source, local build, and published
  paths and duplicating existing API guides. Not recommended.
- **Inventory claims and correct evidence-backed mismatches in bounded slices:**
  preserves the owning plans for architecture/API decisions and makes each
  change reviewable. Recommended.

## Plan

1. Establish a bounded doc inventory and classify each doc as current, stale,
   intentionally conceptual, or requiring a decision from an owning HAWP item.
2. Verify import aliases, package subpaths, third-party layout, example
   commands, and source-tree claims against current source/configuration.
   Distinguish source paths, local generated build paths, and published tarball
   paths; do not “correct” an illustrative publish path as though it were a
   local build directory.
3. Record findings with exact repo-relative paths and distinguish observed
   mismatch from interpretation.
4. Correct clearly factual, low-risk path/link errors in small slices; append
   architectural/API questions to `b0649873`, `19965b11`, or `0ab7e9b2`.
5. Configure the HAWP index to include project docs in addition to default kit
   and work records; re-index and confirm representative docs are searchable.
6. Run local Markdown link checks and targeted docs/example validation for any
   corrections. Do not claim consumer runtime behavior from docs alone.

## Acceptance

- Findings cover the relevant docs without rewriting documentation wholesale.
- Every current alias and package-export claim is checked against
  `tsconfig.base.json`, root `package.json`, `scripts/dev/sync-local-exports.ts`,
  `scripts/publish/prepare-publish.ts`, and actual build output where needed.
- Source, local-build, and published-tarball paths are clearly distinguished;
  every corrected claim is supported by current source/configuration, and
  conceptual diagrams remain intentionally scoped.
- No source ownership or public API decision is made inside this docs audit.
- `.hawp/config/search.json` explicitly preserves default kit/work indexing and
  adds the selected project documentation; index results are verified.
- Link and targeted validation results, remaining unknowns, and cross-item
  handoffs are recorded.

## Risk + Review Gate

**Risk:** low for factual path/link corrections and index configuration; medium
for architecture or public API wording changes.
**Gate:** make factual low-risk corrections after documenting evidence; route
medium changes through their owning plan for review.

## Dependencies and Overlap

Coordinate with `b0649873` on source-root diagrams and `src/eslint` placement;
with `19965b11` on package entry points and example aliases; with `0ab7e9b2`
on Service API/consumer documentation. Do not repeat implementation owned by
those plans.

## Backlog + Plan Link

**Status now:** in-progress
**Plan file:** `.hawp/work/active/04b3e320/plan.md`

## Next Step

- [x] Investigation recorded
- [x] Audit plan written
- [x] Add `.hawp/config/search.json`, index the selected Markdown paths, and verify work-plan retrieval
- [ ] Review boundaries, then conduct doc-by-doc inventory


## Audit findings and implementation-ready doc corrections

**Confirmed corrections:**

- `docs/utils/path-aliases.md` maps `@zacatl/third-party` to
  `src/third-party/`; `tsconfig.base.json` maps it to the sibling
  `src/third-party.ts`, and `package.json` exposes that barrel as
  `./third-party`. Correct the alias row and explain leaf aliases separately.
- `docs/service/dependency-exports.md` says the root package manifest has no
  export map and its table says no map is committed by default; the current
  tracked root `package.json` has 161 export entries and `postbuild` runs local
  export synchronization. Update the local-development text/table to describe
  the checked-in root map accurately.
- The local diagnostic at `docs/service/dependency-exports.md:453` uses
  `ls build/esm/third-party/`; local build output is `build-src-esm/`, while
  `scripts/publish/prepare-publish.ts` rewrites it to `build/esm/` in the
  publish tree. Correct the local command or label it as a publish-tree check.

**Stage-specific content to preserve and label:** `build/esm`/`build/cjs`
examples in `docs/service/dependency-exports.md` and
`docs/guidelines/architecture.md` are valid published-package paths when labeled
as such. Runtime locale candidates in `docs/localization/README.md` match
`src/localization/i18n-node.ts`; clarify the candidate stage rather than
removing those fallbacks. `docs/guidelines/testing.md` correctly lists the
`test/unit/dependency-injection/` suite, but its claim that tests “must mirror”
`src/` is too absolute; soften it to describe mirroring as the default with
intentional logical groupings for compatibility/facade tests.

**Ownership:** source-tree diagrams and ESLint/root disposition stay in
`b0649873`; public alias/export contract and example Vitest config stay in
`19965b11`; Service behavior prose stays in `0ab7e9b2`. This item should make
only factual doc corrections and stage labels.

**Ready checks:** inspect the root and staged publish manifests, run
`.hawp/bin/hawp links check` and `git diff --check`, and verify the affected
local path examples against current build output. Do not infer installed consumer
runtime behavior from documentation checks alone.

### Owner-updated source layout impact — 2026-10-21

The worktree now relocates configuration under `src/utils/configuration/`,
localization under `src/third-party/localization/`, and Zacatl ESLint configs
under `src/third-party/eslint/`. The earlier doc correction list must be applied
against this proposed layout, not the previous root tree. Update source-tree
examples, aliases, Docker copy paths, locale discovery examples, testing-layout
wording, and path-alias docs only after the implementation chooses stable public
facades and build destinations. Keep source paths, local build paths, and staged
published paths labeled separately. In particular, the package may retain
`./configuration`, `./localization`, and `./eslint` subpaths even as their source
implementations move; verify the final export map before documenting any break.

Do not claim docs are implementation-ready until aliases, manifest exports,
postbuild asset copying, and locale runtime candidate paths are resolved by the
source-layout work item. This docs lane remains staged behind `b0649873` for the
canonical tree and `19965b11` for public alias/export decisions.

### Owner decisions resolved — 2026-10-21

The owner approved breaking the old package subpaths and does not want legacy
compatibility forwarders. Document the new direct module paths and list the old
paths as breaking removals; do not describe `./configuration`,
`./localization`, or `./eslint` as stable. The ESLint wrapper/config split is
settled: `./third-party/eslint-plugins` is the vendor wrapper and
`./third-party/eslint` is the shareable config entry. Align docs after generated
manifests and aliases land so examples match the actual new package export map.

### Documentation implementation update — 2026-10-21

Updated the README, module guides, path-alias guidance, examples, and source
layout diagrams to the new direct paths. The architecture diagram now places
`command-runner/` under `utils/`; the framework overview shows one
`third-party/` directory plus its sibling aggregate `third-party.ts` file.
Updated the moved ESLint config README and inline import examples. HAWP indexing
and local Markdown links pass; diff review remains in progress, and no product
tests or build were run. Also corrected the Unreleased package migration notes
and removed stale 0.0.65 release-candidate wording after confirming PR #138 is
merged, GitHub release `v0.0.65` exists, and npm serves package version 0.0.65.

### PR #180 latest Copilot review follow-up — 2026-10-22

The latest Copilot review of PR #180 (submitted 2026-10-21 22:36 UTC) reports
no open code issues, five earlier DI/export findings resolved, and one newly
missed documentation finding. An independent read-only review confirmed the
finding and checked the other review comments against the current PR head
`56dc8136e846a989e74d96bc7f802bec85da9d6a`.

**Confirmed bug, low risk:**
`.hawp/work/closed/BACKLOG-ARCHIVE.md:102` links to
`closed/2026/09/29/5c2c9ef3-1a6e-469f-9c25-f644b5e3d635.md`. Because the
index itself is in `.hawp/work/closed/`, that link resolves to a nonexistent
`.hawp/work/closed/closed/2026/...` path. The intended plan exists at
`.hawp/work/closed/2026/09/29/5c2c9ef3-1a6e-469f-9c25-f644b5e3d635.md`.
The repository link checker reported all 213 links valid, so direct relative
path resolution is required for this case and related archive-index links
should be spot-checked.

**Review disposition:** The five DI/export findings are already fixed in the
current head and all 13 GitHub review threads are resolved. CI for this head
passes the pending-release, CVE, peer-install, and eight Docker smoke checks;
publish dry-run is skipped by workflow policy. The latest review overview
says “two documentation nits remain,” but its detailed body enumerates only
the broken archive link as a newly missed issue. Earlier callback descriptions
record a prior positional design and later sections explicitly supersede them;
treat them as historical notes unless a pass finds current guidance that still
presents the old shape as active. The changelog's plain version heading follows
its existing version-heading convention, so an emoji there is not required by
the established structure.

**Recommended work:** Reuse this documentation-audit item; do not create a
duplicate. Correct the extra `closed/` component in the archive-index link,
inspect sibling archive links with native relative-path resolution, rerun the
HAWP link checker and `git diff --check`, and record why the checker did or did
not catch the original path. This is a low-risk factual documentation fix;
no code or API change is required. The existing unrelated working-tree edits
remain outside this item. Implementation is not included in this planning
update.

**Implementation update — 2026-10-22:** Corrected the archived plan link in
`.hawp/work/closed/BACKLOG-ARCHIVE.md`. A direct relative-link pass confirmed
all 39 local Markdown links in that index resolve. The native
`.hawp/bin/hawp links check` then passed for 213 Markdown files, and
`git diff --check` passed. The archive-link fix is complete; the broader
source-layout and public-module documentation consistency review remains
active and is not claimed complete.

**Supplemental manager review:** A parallel read-only implementation pass on
`56dc8136` found no additional plausible defect in lifecycle/connection
ownership, the page-registration context/API-prefix handling, or aliases/export
generation. The restart-after-stop question remains explicitly tracked in
`f1080c66`, so it is not a newly missed work item. The current GitHub run passed
pending-release, peer-install, CVE, and all eight Docker smoke jobs; publish
dry-run was skipped by workflow policy. Unit/type/lint/build/packed-consumer
checks are not represented by that run, although the local suite and build
passed against the same source before the documentation-only commit. Treat
this as a CI evidence limitation, not a confirmed implementation bug.
