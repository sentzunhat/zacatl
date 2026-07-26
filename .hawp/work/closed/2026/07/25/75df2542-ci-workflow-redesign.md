# CI workflow redesign — orchestrator pattern, eliminate duplicate runs

**UUID:** `75df2542` · **Type:** tooling · **Priority:** P1 · **Reported:** 2026-07-16  
**Closed:** 2026-07-25

## Problem

- Multiple workflows had overlapping `push` and `pull_request` triggers, causing each commit to run checks twice (push event + PR event).
- Release gate was missing — `tag-release.yml` fired immediately on push to main without waiting for any checks to pass, so a red merge could publish to npm.
- `cve-scan.yml` tried to upload artifacts from a directory `npm audit` never creates, silently failing on every run.

## Solution

Restructured CI as a single orchestrator pattern:

1. **Single entry point** — `ci.yml` is the only workflow responding to branch/PR/schedule events
2. **Reusable components** — `cve-scan`, `peer-install-check`, `publish-dry`, `docker-smoke` are `workflow_call`-only with no branch triggers, invoked by the orchestrator
3. **Release gate** — `tag-release.yml` absorbed into `ci.yml`'s `tag` job with `needs: [cve, peers, dry, docker]`
4. **Efficient matrix** — expensive checks (dry-run, docker) only run on push to main before release; PRs and dev pushes get lightweight gates (cve, peers)

## What runs where (final design)

| Event | cve | peers | dry | docker | tag→publish |
|---|:--:|:--:|:--:|:--:|:--:|
| PR → dev/main | ✅ | ✅ | — | — | — |
| push → dev | ✅ | ✅ | — | — | — |
| push → main | ✅ | ✅ | ✅ | ✅ | ✅ |
| schedule (weekly) | ✅ | ✅ | — | — | — |

## Changes

- `.github/workflows/ci.yml` (new) — orchestrator with concurrency group to cancel in-flight runs
- `.github/workflows/cve-scan.yml` — converted to `workflow_call` reusable; removed artifact upload
- `.github/workflows/peer-install-check.yml` — converted to `workflow_call` reusable; scoped PR trigger
- `.github/workflows/publish-dry.yml` — converted to `workflow_call` reusable; removed direct triggers
- `.github/workflows/docker-smoke.yml` — converted to `workflow_call` reusable; removed direct triggers
- `.github/workflows/release.yml` — aligned CVE gate to `npm audit --omit=dev`; removed artifact upload
- `.github/workflows/tag-release.yml` (deleted) — logic moved to `ci.yml::tag` job

## Verification

- All YAML parses and validates
- No duplicate triggers (cve-scan and peer-install-check scoped to dev/main on PR)
- Release tag creation and `release.yml` dispatch only happens after all checks pass
- Weekly schedule only runs cve/peers (no dry-run, no docker)
- PRs get fast feedback (cve, peers in ~5–10 min)
- Pushes to dev get dev feedback (cve, peers in ~5–10 min)
- Pushes to main get full verification (all four, ~20–30 min) before release

## Outcome

✅ No more duplicate runs  
✅ Release cannot succeed with red checks  
✅ Fast dev/PR feedback loop  
✅ Full verification before npm publish  
✅ Cleaner, centralized orchestration
