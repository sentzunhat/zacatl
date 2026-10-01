# DEPS-063 — Minor/patch dependency updates and example lockfile refresh

**UUID:** `DEPS-063` · **Type:** maintenance/security · **Priority:** P2 · **Reported:** 2026-10-01
**Status:** in-progress · **Branch:** `fix/dependency-updates` (stacked on `feature/pluggable-service-logger`, PR #118) · **Target:** 0.0.63

## Goal

Bring root and example dependencies up to the latest versions inside their
current major lines, clear the dev-only audit advisories, and reduce the
Dependabot backlog — without any major-version migration.

## Scope

1. Root `package.json`: raise every outdated dependency/devDependency to its
   latest release within the same major (exact pins such as `i18n` stay exact).
   `peerDependencies` floors are not raised (consumers keep their ranges).
2. Root lockfile refreshed; `npm audit` (including dev) target: 0 findings.
3. Example lockfiles (`examples/*`): refresh within existing ranges and apply
   in-range audit fixes, to clear GitHub Dependabot alerts on `main`.
4. Changelog entry under `[Unreleased]`.

## Out of scope (separate work items)

- ESLint 10 + `@eslint/js` 10 — `ESLINT-010` (parked; blocked on
  `eslint-plugin-import` peer support).
- vitest 5 + `@vitest/coverage-istanbul` 5 — major migration.
- TypeScript 7 — major migration.
- HTTP frameworks as peers — `f2a96e04` / v0.1.0.
- Closing superseded Dependabot PRs — only after owner approval.

## Verification

`npm test`, `npm run type:check`, `npm run lint:silent`, `npm run build`,
`npm run prepare-publish && npm run check:optional-peers && npm run smoke:consumers`,
`npm audit` and `npm audit --omit=dev`, example builds, and the labeled
Publish dry-run + Docker smoke jobs on the PR.

## Log

- 2026-10-01: Opened at owner request; stacked on PR #118 to avoid lockfile conflicts.
- 2026-10-01: Root updates applied (26 in-major bumps + vitest 4.1.11); typescript-eslint trio re-resolved without --force; mongodb dev range kept at ^7.2.0 (mongoose 9.10 and mongodb-memory-server need different 7.x minors, dev-only duplicate copies, nothing imports mongodb directly). mongoose 9.10 typings required a test-only typing fix. Validation: 683 tests, type check, lint baseline, build, optional-peer check, consumer smokes, npm audit 0 (incl. dev). Example lockfiles: pending.
