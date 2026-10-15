# Audit and refresh Zacatl dependencies after 0.0.64

**Backlog ID (Legacy):** — (UUID-native item)
**UUID:** `0b959aed-8edc-4173-a3da-cd23e61e5c3a`
**Type:** infrastructure
**Reported:** 2026-10-15
**Status:** plan-ready · **Priority:** P2

---

## Input (verbatim)

> Review the root runtime and development dependency graph plus all example lockfiles; reconcile current registry versions and advisories, prioritize security fixes, and apply compatible updates with full repository and consumer verification. Keep consumer-owned Tailwind findings separate.

## Intake Summary

This is a fresh maintenance pass after the 0.0.64 release and the completed
`DEPS-063` update. The supplied 2026-10-15 downstream consumer report says Zacatl
0.0.64 is still its consumer range/latest published version at report time and
its production dependency audit is clean. It also reports Tailwind-only
development advisories in that consumer; those belong to the consumer, not this item.
Re-check registry and advisories when implementation begins.

## Current Context

The previous Zacatl dependency pass deliberately deferred some newly published
or major-version candidates, including `pino`, `mongoose`, `@types/node`,
TypeScript 7, Vitest 5 and ESLint 10. Those are candidates to evaluate, not
automatic upgrade instructions. The project has nine examples and release
gates for tests, type checking, lint, build, optional peers, consumer smoke,
publish dry-run and Docker smoke.

## Initial Analysis

**Directly verified:**

- `.hawp/work/closed/2026/10/04/DEPS-063-minor-patch-dependency-updates.md`
  documents the previous root and example-lockfile refresh and its exclusions.
- `.hawp/work/evidence/2026/10/04/bacf99c4-236e-4bd1-ae54-8d96713b383a/evidence.md`
  records the 0.0.64 release and dependency verification.
- This task is planning only; no package manifest, lockfile, or runtime
  dependency has been changed.

**Inferred (not yet proven):**

- Candidates deferred in the prior pass may now have compatible patch/minor
  releases or advisories that justify action. Re-resolve this rather than
  carrying forward old version numbers.

**Likely scope:**

- Root runtime and development dependencies, all example manifests and
  lockfiles, peer/optional-peer compatibility, and direct/transitive audit
  results. Major upgrades remain separate decisions if compatibility risk or
  migration work is material.
- Do not include the downstream consumer's Tailwind toolchain findings unless a
  separate Zacatl dependency path is demonstrated.

## Risk + Review Gate

**Risk:** medium (dependency changes can affect published runtime behavior and
consumer installs).
**Gate:** review the candidate matrix before changing majors, peer ranges,
published API, or release configuration. Prefer compatible updates; do not use
`npm audit fix --force` or unsafe downgrades as a blanket remedy.

## Plan

1. Confirm current `dev`/`main` base, package version, Node/npm requirements,
   and registry latest/dist-tags. Record the checked date.
2. Inventory outdated direct dependencies and inspect transitive advisories
   with `npm outdated`, `npm ls`, `npm explain`, `npm audit` and
   `npm audit --omit=dev`; separate runtime from development-only findings.
3. Review each candidate's release notes/engine and peer constraints. Group
   compatible updates; split major migrations or unresolved vulnerabilities
   into follow-up work items rather than bundling blindly.
4. Update root dependencies and all nine example lockfiles where justified.
   Preserve package-manager consistency and avoid changing example app
   behavior unrelated to dependency compatibility.
5. Verify clean installs, tests, type-check, lint, build, optional-peer checks,
   packed-consumer smokes, all example builds and the eight-example Docker
   matrix. Re-run full and production-only audits.
6. Review the complete diff and changelog/release implications. Do not merge,
   tag, or publish without owner approval.

## Acceptance Criteria

- Current dependency and advisory state is evidenced and categorized by
  production/development and root/example ownership.
- Every applied bump has an explicit compatibility/security rationale; major
  changes are separately approved or split out.
- Root and example dependency trees install reproducibly, with required CI,
  consumer and Docker gates green.
- No consumer-only Tailwind advisory is misreported as a Zacatl finding.
- The final diff and release implications are reviewed; no merge or publish is
  performed by this work item without owner approval.

## Verification

Run `npm ci`, `npm test`, `npm run type:check`, `npm run lint:silent`,
`npm run build`, `npm run check:optional-peers`, consumer smoke, all example
builds, `npm audit`, and `npm audit --omit=dev`; run the PR publish dry-run and
Docker smoke workflows for the release candidate. Exact commands may be
adjusted to the then-current scripts after inspecting `package.json`.

## Backlog + Plan Link

**Status now:** plan-ready
**Plan file:** .hawp/work/active/0b959aed/plan.md

## Next Step

- [x] Investigation recorded above (initial evidence only; current versions
  must be re-resolved before implementation)
- [x] Write or update the plan file
- [x] Move backlog status to plan-ready
