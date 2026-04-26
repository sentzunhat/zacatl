# Docs Drift Audit Evidence (2026-05-11)

## Scope

- Reviewed docs/ and core implementation areas in src/.
- Verified command examples against root package.json scripts.
- Renamed docs files to lowercase kebab-case and repaired links.

## Direct evidence

- Runtime platform status verified from src/service/service.ts, src/service/platforms/cli/cli.ts, and src/service/platforms/desktop/desktop.ts.
- Command mismatch verified in docs/service/dependency-exports.md (`npm run backend:start` not present in root package.json scripts).
- Filename convention mismatch verified from docs markdown inventory.

## Changes performed

- Renamed non-kebab docs files (README.md/START_HERE.md/QUICK_REFERENCE.md variants) to lowercase kebab-case.
- Updated markdown links in README.md, docs/**, and examples/** that referenced renamed docs files.
- Updated docs/service/dependency-exports.md to use a real runnable example command.
- Added docs/documentation-guidelines.md with naming and drift-prevention rules.

## Deferred items

- Historical import examples in docs/changelog.md still include legacy paths. Not updated because changelog history should not be rewritten unless explicitly requested.
