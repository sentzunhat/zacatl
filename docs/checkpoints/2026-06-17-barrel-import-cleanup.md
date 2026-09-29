# 2026-06-17 — Barrel import cleanup and publish safety checkpoint

## Scope

Conversation/event period: 2026-06-17 through 2026-06-24  
Archive date: 2026-09-29  
Repository: `sentzunhat/zacatl`  
Primary PR: #26  
Working branch: `copilot/remove-barrol-imports-again`  
Base branch at PR time: `another-update-branch-work`

Public-safety note: this checkpoint contains only repository-relevant technical context. Unrelated private project and personal context is intentionally excluded.

## Purpose

Preserve the transition away from generated directory-level `index.ts` barrels while keeping Zacatl's package entrypoints, ESM/CJS builds, and publish output stable.

## Before

Zacatl relied on generated barrel files and supporting automation:

- directory-level `index.ts` files were generated and used broadly,
- development/git-hook tooling generated and staged barrels,
- script utilities also imported through `scripts/utils/index.ts`,
- package consumers depended on stable root/subpath exports,
- removing index files indiscriminately risked breaking ESM resolution and published package exports.

Several related PRs explored the cleanup. The durable direction became to keep one canonical barrel-removal PR rather than parallel implementations.

## During

PR #26 became the canonical barrel-import cleanup.

Completed changes included:

- removed/deprecated generated directory-level barrel automation,
- removed barrel generation from git hooks and npm scripts,
- updated architecture/code-style guidance toward explicit named modules and stable subpath imports,
- added `scripts/publish/prune-barrels.ts` to remove nested internal `index.*` files from publish output,
- kept the root `src/index.ts` intentionally because the package root remained a public entrypoint,
- changed new script imports to concrete modules instead of introducing additional barrel dependencies,
- made `prune-barrels.ts` import-safe so `prepare-publish.ts` could call its exported function without accidentally executing the CLI,
- hardened pruning so files referenced by package `main`, `module`, `types`, or `exports` are preserved,
- changed `scripts/dev/sync-local-exports.ts` and `scripts/dev/update-coverage-readme.ts` to import `measureTime` directly.

Duplicate PR #28 was closed so #26 remained the single canonical barrel-import PR.

A remaining cleanup item was identified in `scripts/dev/parallel-runner.ts`, which still imported from `../utils/index.js`. That item was not completed during the reviewed conversation because the remote edit was blocked; it should be verified against current `main` before doing any new work.

## After

PR #26 was merged on 2026-06-24.

Merge commit:

`35543cd8e6966d7a600db42da748dfb7425102fd`

The resulting design rule is:

> Generated directory-level barrels are deprecated. Prefer concrete module files and explicit subpath imports, while preserving intentional public package entrypoints and any files referenced by the package export contract.

Publish-time pruning is defensive rather than blind: internal nested barrel files may be removed, but declared package entrypoints must survive.

## Decisions

1. Do not remove every `index.ts` solely because it is named `index.ts`.
2. Root/public entrypoints are intentional API surfaces and may remain.
3. Internal code should prefer concrete module imports.
4. Publish pruning must respect the package export contract.
5. Build/publish scripts should not depend on barrels they are responsible for removing.
6. Keep the implementation minimal: explicit imports plus one publish-pruning boundary rather than new abstraction layers.

## Strategic impact

The cleanup reduces hidden coupling from generated barrels without forcing a breaking package-layout rewrite.

It also establishes a safer order of operations for future cleanup:

1. update imports,
2. preserve intentional public entrypoints,
3. build,
4. generate/sync exports,
5. prepare publish output,
6. prune only undeclared internal barrels,
7. validate the packed package as a consumer.

This direction supports NodeNext/ESM work because runtime file specifiers and package exports remain explicit.

## Continuation state

Current state:

- PR #26 is merged.
- The barrel generator/deprecated automation direction is settled.
- Publish pruning exists and was hardened to preserve declared exports.
- Root/public entrypoints are intentionally distinct from generated internal barrels.

Next milestone:

- Verify current `main` contains no remaining internal imports that depend on deprecated barrel files, especially script-side imports.
- Confirm current package/publish validation still exercises the export contract after subsequent repository changes.

Recommended next actions:

1. Inspect current `main` for imports ending in `/index.js` or resolving through directory barrels.
2. Check whether `scripts/dev/parallel-runner.ts` still imports `../utils/index.js`; if so, replace it with concrete imports.
3. Run the repository's current validation commands rather than relying on the historical command names.
4. Build and prepare the publish tree.
5. Verify every target in the generated/published `package.json.exports` exists.
6. Run the current packed-consumer/publish dry-run gates.
7. Only remove additional `src/**/index.ts` files after all callers have moved to concrete modules and the file is not an intentional package entrypoint.

Blockers / unresolved questions:

- Historical local validation results from the final pre-merge conversation were not captured.
- The repository has evolved since June; current validation scripts and package layout must be treated as authoritative.
- The historical `parallel-runner.ts` barrel import needs current-main verification before changing it.

## Resume summary

Resume from: merged PR #26 and the rule that internal generated barrels are deprecated while declared package entrypoints are preserved.

Next objective: audit current `main` for any remaining deprecated barrel dependencies, then validate ESM/CJS build and packed package exports with the repository's current release gates.
