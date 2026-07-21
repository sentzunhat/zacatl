# Rename Config*-prefixed types to *Config suffix style

**UUID:** `d8f31c7a` · **Type:** refactoring · **Priority:** P2 · **Reported:** 2026-07-15
**Source:** Owner request (2026-07-13/15 sessions): align `Config*` names with
the rest of the API surface (`MongooseRepositoryConfig`, `DatabaseConfig`,
`QueryOptions` already use the suffix style).

## Inventory (measured 2026-07-15, dev @ 0.0.57)

All 10 are `interface`s; **zero collisions** with existing `*Config` names;
**zero references in examples/** (they configure via inline object literals).

| Current | Proposed | src files | test files | docs files |
| ------- | -------- | --------- | ---------- | ---------- |
| `ConfigService` (service/types.ts, re-exported from service.ts barrel) | `ServiceConfig` | 2 | 1 | 4 |
| `ConfigServer` (platforms/server/server.ts) | `ServerConfig` | 3 | 2 | 6 |
| `ConfigLayers` (layers/types.ts) | `LayersConfig` | 3 | 1 | 1 |
| `ConfigApplication` (layers/application/types.ts) | `ApplicationConfig` | 3 | 1 | 0 |
| `ConfigInfrastructure` (layers/infrastructure/types.ts) | `InfrastructureConfig` | 3 | 1 | 0 |
| `ConfigDomain` (layers/domain/types.ts) | `DomainConfig` | 3 | 0 | 0 |
| `ConfigCLI` (platforms/cli/types.ts) | `CliConfig` (see naming note) | 4 | 0 | 0 |
| `ConfigDesktop` (platforms/desktop/types.ts) | `DesktopConfig` | 4 | 0 | 0 |
| `ConfigPlatforms` (platforms/types.ts, re-exported from service.ts) | `PlatformsConfig` | 4 | 1 | 1 |
| `ConfigLocalization` (service/types.ts) | `LocalizationConfig` | 1 | 0 | 0 |

Naming note: `ConfigCLI` → `CliConfig` vs `CLIConfig` — pick one at review.
Recommendation: `CliConfig` (matches TS convention for treating acronyms as
words in PascalCase; the repo has both styles today).

No runtime/string usage of these names exists (`grep "'Config` / `"Config`
in src returns nothing relevant) — this is a pure type-level rename.

## Strategy: two-phase, alias-first (recommended)

**Phase 1 — additive, ships in 0.0.58 (non-breaking):**
1. Rename each declaration to the new `*Config` name.
2. Keep the old name as a deprecated alias at the same export site:
   `/** @deprecated Use ServiceConfig — will be removed in 0.1.0. */`
   `export type ConfigService = ServiceConfig;`
   (precedent: the `@deprecated` JSDoc pattern already used in
   src/utils/hmac.ts). Consumers get IDE strikethrough, nothing breaks.
3. Update all internal src/ + test/ usage to the new names.
4. Update the ~8 docs files (README, docs/guidelines/*, changelog note).
5. Changelog entry under 0.0.58 with a migration table (old → new).

**Phase 2 — breaking, ships in 0.1.0:**
6. Delete the 10 deprecated aliases. Changelog ⚠️ breaking entry reuses the
   same migration table.

## Effort & risk

- Phase 1 ≈ half a day: 10 declarations, ~30 src/test files touched
  (mechanical find/replace + alias blocks), ~8 docs files, full suite run.
- Risk: low — type-level only, aliases preserve compatibility, examples
  untouched. Main failure mode is docs drift; the inventory table above is
  the checklist.
- Phase 2 risk: standard semver-major communication; alias removal is a
  one-commit delete.

## Verification

- `npm test` + `npm run type:check` green after each phase.
- Tarball consumer check (both `import` and `require`) referencing one old
  alias (phase 1) and one new name.
- `grep -rn "Config(Service|Server|Layers|Application|Infrastructure|Domain|CLI|Desktop|Platforms|Localization)"`
  over docs/ returns nothing after phase 1 doc updates (aliases live only
  in source).

## Gate

plan-ready — awaiting owner approval of (a) the two-phase alias strategy,
(b) the `CliConfig` vs `CLIConfig` choice. Implementation should start
after 0.0.57 ships.

## Status Log

- 2026-07-15: Plan written from measured inventory (this session).

## Status Log (cont.)

- 2026-07-17: Phase 1 implemented in 0.0.57 (owner chose to squish into the
  unreleased version): all 10 types renamed to *Config (CliConfig chosen),
  @deprecated aliases at each declaration site + barrel re-exports, all
  src/test/docs usage migrated, tsconfig removeComments disabled so the
  deprecation JSDoc actually ships in .d.ts (this also restores ALL public
  API JSDoc for consumers — pre-existing DX bug). 639 tests green.
  Phase 2 (alias removal) tracked under the 0.1.0 milestone `e7a20d15`.
  Closed.
