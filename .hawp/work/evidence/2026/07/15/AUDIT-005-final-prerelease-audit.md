# AUDIT-005 — Final pre-release security & dependency audit (0.0.57)

**Date:** 2026-07-15
**Method:** 5 parallel audit lenses (npm deps, secrets, GitHub Actions,
publish surface, code-security regression) with adversarial verification;
several verifiers and follow-ups completed inline after the agent budget
was exhausted. Direct evidence unless marked inference.

## Verdict

**Release-ready after the fixes below (all applied and verified this
session).** npm audit: 0 vulnerabilities across 776 packages. No secrets
in the tracked tree; `.npmrc` ignored and never committed. Tarball hygiene
confirmed (no test/, .hawp/, examples/, .github/ leakage; LICENSE+README
included; no absolute local paths). All prior security fixes verified
intact on current code (HMAC timing-safety, SQLite LRU cap + guarded table
names, Mongoose sanitization + $set, command-runner fail-closed, no
eval/Function/string-built SQL).

## Findings fixed this session

| Sev | Finding | Fix |
| --- | ------- | --- |
| P0 | Every `require()` subpath broken for CJS consumers — `publish/build/cjs/*.js` is CommonJS under a `"type": "module"` root with no scope marker | `prepare-publish.ts` now writes `build/cjs/package.json` with `{"type":"commonjs"}`. Verified end-to-end: packed the staged tarball, installed it in a scratch consumer, `require('@sentzunhat/zacatl/error')` and `/utils` work; ESM imports unaffected |
| P2 | `verifyHmac` throws `RangeError` instead of returning false when a same-string-length signature contains multi-byte UTF-8 | Byte-length guard on Buffers before `timingSafeEqual`; regression test added (624 tests) |
| P1 | `NPM_TOKEN` exposed to the entire verification chain (tests/lint/build run project code with the token in env) | Split `publish:ci` into `publish:ci:verify` (no token) + a token-scoped publish step in release.yml |
| P1 | `npx --yes cve-lite-cli` fetched unpinned at latest on every scheduled run (supply-chain execution) | Pinned to `cve-lite-cli@1.27.0` |
| P2 | `peer-install-check.yml` had no `permissions` block | Added `permissions: contents: read` |
| P2 | `.gitignore` env patterns missed non-`.local` variants (`.env.production`, `.env.staging`) | Replaced enumeration with `.env` + `.env.*` + `!.env.example` |

## Confirmed advisories (not blockers — tracked, not fixed)

- **@fastify/static one major behind** (9.3.0 vs 10.1.0; no advisories on
  9.x). Verify fastify@5 compat before bumping.
- **`overrides.uuid ^14`** forces sequelize (declares uuid ^8) six majors
  ahead locally only — dev/consumer graph divergence; consumers resolve
  sequelize's own uuid@8. Consider removing the override or documenting it.
- **express + fastify both hard dependencies** — every consumer installs
  both HTTP stacks (199 prod packages). Candidate for optional-peer
  treatment in a future minor/major, like the DB drivers.
- **Publish-script latent risks:** prune-barrels whitelist never matches in
  the publish tree (dead code today, deletion risk if paths change);
  exports map rewritten without target-existence validation (a stale entry
  would ship silently broken). Worth a validation step that stats every
  rewritten export target.
- **No environment gate on the release job** — merge to main publishes
  immediately once NPM_TOKEN exists. Optional: GitHub environment with
  required reviewers on the Publish step (owner settings, not repo files).
- **Tag name interpolated into awk in release.yml** — currently unreachable
  as an exploit (tag is CI-created from package.json version), noted as
  defense-in-depth.
- Dev tooling majors pending: eslint 10 (parked as ESLINT-010),
  typescript 7.

## Info notes

- `i18n` is the only exact-pinned prod dep (0.15.3 == latest; looks
  accidental, harmless).
- `pino-pretty` has no static import but is loaded by name as a pino
  transport (`src/logs/pino/config.ts:52`) — must stay in dependencies.
- First-party GitHub actions pinned by major tag only; zero third-party
  actions in use.
- Release-flow security confirmed: dispatched run checks out the tag ref;
  publish without NPM_TOKEN is impossible.
