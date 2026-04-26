## STAB-021 — Path-based naming alignment for repositories and providers

Status: done (2026-07-08)
Scope: `src/service/layers/infrastructure/repositories/**`, `src/service/platforms/server/providers/**`, `src/service/platforms/server/server.ts`, `src/service/index.ts`, `docs/guidelines/architecture.md`, all 8 examples' repository adapters

### Completion notes (2026-07-08)

Implemented exactly as planned, all 10 steps. Verified: root `npm test`
555/555 (down from 564 — 9 tests removed with the deleted old
cross-vendor `BaseRepository` and its two dedicated test files), root
`type:check` 0/3 failures, root `lint` 0/3 failures (confirmed via probe:
the renamed `BaseRepository` classes pass the existing Abstract/Base-prefix
lint rule with zero config changes, exactly as predicted), all 8 examples'
`tsc --noEmit` PASS, grep sweep for every old name returns zero hits outside
the one expected exception (`server.ts`'s local import-site aliasing).
`docs/guidelines/architecture.md` and `docs/changelog.md` updated.

One implementation detail worth recording: after editing `src/`, the 8
examples initially still failed to type-check because they resolve
`@sentzunhat/zacatl` via `file:../../`, which points at **compiled**
`build-src-esm`/`build-src-cjs` output, not live `src/`. Running `npm run
build` picked up the renames, but `npm run local:exports` (wired into
`postbuild`) re-added a stale `./service/layers/infrastructure/repositories/abstract`
entry to `package.json`'s exports map — because the old compiled
`build-src-esm/.../repositories/abstract.js` artifact was still on disk
from before the source deletion. Fixed by running `npm run clean:build`
before rebuilding. Future renames/deletions of exported modules should
always `clean:build` before `build`, not just build on top of stale
artifacts.

### The rule

The exported name is identical across every vendor; only the file path
differs. Handlers already follow this (`GetRouteHandler` at both
`fastify/handlers/` and `express/handlers/`). Repositories and provider
factories bake the vendor into the name instead — this plan aligns both to
the same rule.

### Decision: clean rename, no aliases kept

A prior draft of this plan proposed keeping the old vendor-prefixed names as
back-compat aliases (reusing the existing `export { X as Y }` convention
already used for `MongooseRepository`/`SequelizeRepository`). **Superseded —
going with a full clean rename instead**, per explicit direction: fewer names
for the same thing is more elegant, and this package is pre-1.0 (`0.0.56`)
with its own changelog precedent for clean breaks (0.0.56 already dropped
the root barrel and old flat `third-party` paths entirely with no aliases
kept). One name per concept, disambiguated only by path — nothing left over.

This **is** a breaking change for anyone importing the old names directly.
Ship it with an explicit "Breaking Changes" changelog entry, same style as
0.0.56's.

### Target names

| Concept | Old name(s) (removed) | New name | Vendor paths |
|---|---|---|---|
| Repository | `AbstractMongooseRepository` / `MongooseRepository` | `BaseRepository` | `repositories/mongoose/repository.ts` |
| Repository | `AbstractSequelizeRepository` / `SequelizeRepository` | `BaseRepository` | `repositories/sequelize/repository.ts` |
| Repository | `AbstractNodeSqliteRepository` / `NodeSqliteRepository` | `BaseRepository` | `repositories/nodesqlite/repository.ts` |
| API provider | `createFastifyApiAdapter` | `createApiAdapter` | `providers/fastify/api-adapter.ts` |
| API provider | `createExpressApiAdapter` | `createApiAdapter` | `providers/express/api-adapter.ts` |
| Page provider | `createFastifyPageAdapter` | `createPageAdapter` | `providers/fastify/page-adapter.ts` |
| Page provider | `createExpressPageAdapter` | `createPageAdapter` | `providers/express/page-adapter.ts` |

**Naming decision (updated 2026-07-08):** repository classes keep the `Base`
prefix — target name is `BaseRepository` per vendor path, not bare
`Repository` — so the exported name visibly signals "this is an abstract
class you must extend," consistent with `naming-conventions.mjs`'s existing
Abstract/Base-prefix rule for exported abstract classes. This also reuses
the exact name already freed up by deleting the old cross-vendor
`BaseRepository` in this same pass (see below) — **no lint rule change
needed at all**, which removes the former step 0 from this plan entirely.

Provider factories (`createApiAdapter`/`createPageAdapter`) are plain
functions, not classes, so the Abstract/Base-prefix lint rule never applied
to them — no naming change needed there beyond dropping the vendor prefix.

**Handlers are intentionally left alone.** `GetRouteHandler`/`PostRouteHandler`/etc.
already omit any Abstract/Base marker and pass lint via the `Handler$`
suffix filter, not the abstract-modifier rule — a second, pre-existing
allowlisted convention, not a gap. Renaming these would touch the most
heavily used, most heavily documented public API in the package (all 8
examples, `architecture.md`'s Framework Adapters section, every handler
test) for a purely cosmetic gain — `Handler` is already an unambiguous
"you extend this" role noun, same as `Repository` is in DDD/hexagonal
terms. Recommendation: do not rename handlers. If this is revisited later,
it should be its own ticket, scoped and reviewed separately — not folded
into this one.

`server.ts` is the **one file that imports both vendors together**
(runtime-selects Fastify vs Express from config) — it aliases at the
import site, same as it does today, just pointed at the new name:
`import { createApiAdapter as createFastifyApiAdapter } from './providers/fastify/api-adapter'`.
This is expected and correct — it's the one place vendor selection is
genuinely a runtime decision rather than a per-file consumer choice.

### Old `BaseRepository` — remove, freeing the name for reuse

`repositories/abstract.ts` (`BaseRepository`, runtime `config.type`
branching) has confirmed zero usage across `src/` consumers and all 8
examples (grep-verified). Since this pass is already a breaking-change
rename, remove it outright here rather than leaving it deprecated for a
separate future ticket — no reason to carry known-dead code through
another release. This also frees the `BaseRepository` name for reuse as
the new per-vendor exported class name (see Target names above), so there
is no naming collision to resolve. Also remove its re-export from
`src/service/index.ts` (`export { BaseRepository } from './layers/infrastructure/repositories/abstract';`).

### Implementation steps (in order)

1. Rename the class in each vendor's `repository.ts` to `BaseRepository`
   (remove the old name and its alias entirely — no `export { X as Y }`
   left behind for these three).
2. Update the two barrels that currently re-export the old aliases
   (`repositories/mongoose/index.ts`, `repositories/sequelize/index.ts`,
   `repositories/nodesqlite/index.ts`) to drop the alias lines.
3. Rename the factory functions in each provider file to `createApiAdapter`
   / `createPageAdapter` (remove old vendor-prefixed names entirely).
4. Update `server.ts` to import both vendors' factories aliased at the call
   site (`createApiAdapter as createFastifyApiAdapter`, etc.) — the only
   file that needs this.
5. Delete `repositories/abstract.ts` (old cross-vendor `BaseRepository`) and
   its test file; remove its export from `src/service/index.ts`. Do this
   before step 1 lands so there's never a moment with two same-named
   classes in the tree.
6. Update all 8 examples' repository adapter imports
   (`examples/*/apps/backend/src/infrastructure/greetings/repositories/greeting/adapter.ts`)
   from `SequelizeRepository`/`MongooseRepository` to `BaseRepository`.
7. Update `docs/guidelines/architecture.md`'s "Database Adapters" and "Named
   Provider Pattern" sections to show only the final names — no
   back-compat note needed since nothing old remains.
8. Update/remove any existing tests referencing the old names directly
   (`MongooseRepository`, `SequelizeRepository`, `AbstractNodeSqliteRepository`,
   `createFastifyApiAdapter`, `createExpressApiAdapter`,
   `createFastifyPageAdapter`, `createExpressPageAdapter`, old
   `BaseRepository`).
9. Changelog entry under "Breaking Changes", same style as the 0.0.56 entry
   (list old → new import paths so consumers can find/replace).
10. Run `npx eslint` across `src/` to confirm the renamed classes pass the
    existing Abstract/Base-prefix rule with no config changes (expected,
    not a step that should require edits — treat any lint failure here as
    a signal something else is wrong).

### Verification

- `tsc --noEmit` across `src/` and all 8 examples.
- `npm test` — full suite green after the renames land; no leftover
  references to any removed name.
- Grep confirms **zero** remaining usages anywhere in `src/`, `test/`, or
  `examples/` of: `MongooseRepository`, `SequelizeRepository`,
  `AbstractNodeSqliteRepository`, `NodeSqliteRepository`, `BaseRepository`,
  `createFastifyApiAdapter`, `createExpressApiAdapter`,
  `createFastifyPageAdapter`, `createExpressPageAdapter`.
- `docs/guidelines/architecture.md` shows one consistent, single-name,
  path-differentiates-vendor rule across handlers, providers, and
  repositories — no aliases to explain.
- Changelog has a "Breaking Changes" entry documenting the rename.

### Direct evidence log (for future reference)

- All 8 examples' repository adapters already `extends SequelizeRepository`
  / the vendor-named class — never `BaseRepository` (verified via
  `fastify-sqlite-react/.../repositories/greeting/adapter.ts` and a repo-wide
  grep across all 8).
- `repositories/abstract.ts` (`BaseRepository`) sits at 73.1% coverage
  (19/26 lines, `coverage/lcov.info`), consistent with zero real-world usage
  — further supporting outright removal over deprecation.
- `server.ts` is the only file importing more than one vendor's provider
  factory in the same scope (`createFastifyApiAdapter` +
  `createExpressApiAdapter` + both page adapters, lines 12–15), confirmed via
  grep — this is why it needs vendor-prefixed aliasing at the import site
  even after the rename.
- `repositories/mongoose/repository.ts` and `repositories/sequelize/repository.ts`
  currently carry a `/** @public Backward-compatible alias used by examples
  and consumers. */` comment on their old-name export — that alias pattern
  exists in the codebase already but is being retired here rather than
  extended, per the "no aliases" decision above.
