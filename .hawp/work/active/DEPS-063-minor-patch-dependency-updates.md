# DEPS-063 — Minor/patch dependency updates and example lockfile refresh

**UUID:** `DEPS-063` · **Type:** maintenance/security · **Priority:** P2 · **Reported:** 2026-10-01
**Status:** in-progress · **Branch:** `fix/dependency-updates` (PR #119 → `dev`) · **Target:** 0.0.64

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
4. Changelog entry and release prep: `[0.0.64]`, `package.json` 0.0.64.

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
- 2026-10-01: Example lockfiles: in-range `npm audit fix` in all eight framework examples -> 0 advisories each (node-sqlite-store already clean); every example backend builds from `npm ci`.
- 2026-10-03: New high advisory `braces` ≤ 3.0.3 (GHSA-vfj7-8cjw-p6xm, no fixed release) reached production via `http-proxy-middleware` → `micromatch`. Owner decision: make `http-proxy-middleware` an optional peer (lazy-loaded by the Express adapter only when a gateway proxy is configured; removed from the `third-party` barrel). `npm audit --omit=dev`: 0. pino 10.4.0 / @types/node 26.6.4 (published 2026-10-02) deliberately not adopted yet.
- 2026-10-03: 0.0.63 released without these updates (#121). Branch rebased onto `dev` (= `main`, `8e832b7c`); retargeted to the next patch: `package.json` 0.0.64, changelog `[Unreleased]` → `[0.0.64]`. `npm outdated` lists only the excluded majors plus `pino` 10.4.0, `mongoose` 9.10.4 and `@types/node` 26.6.4 (published 2026-10-01 → 2026-10-03; no security fix; left for the next round). `npm audit --omit=dev`: 0; full audit: 7 high, all the dev-only `braces` chain (via `tsc-alias` and the `http-proxy-middleware` devDependency), no fixed release.
