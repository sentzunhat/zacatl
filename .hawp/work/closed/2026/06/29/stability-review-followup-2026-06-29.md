# Stabilization Review Follow-up

## Current Branch and PR State

- Branch: `stability/review-20260628-2340`
- Base branch: `main`
- PR: [#35](https://github.com/sentzunhat/zacatl/pull/35)
- PR state from GitHub API: open, draft, mergeable, mergeable_state `clean`, no review comments
- Local worktree state: `git status --short` shows unrelated local changes outside the branch delta: modified `examples/README.md` and untracked `examples/neutralino-react-transformers-webgpu/`
- Branch tip evidence is mixed:
  - local `HEAD` and `origin/stability/review-20260628-2340` resolve to `c9083fcaee1b06fecda7273dacace098c7146701`
  - GitHub API `head_sha` for PR #35 returned `d93d22a80e9430f30613c69013f02ced56f7cc96`
  - I treated that as an evidence mismatch, not a conclusion about branch correctness

## CI Evidence Table

| Check | Evidence | Result |
| --- | --- | --- |
| Peer install check | https://github.com/sentzunhat/zacatl/actions/runs/28345130593 | success |
| OWASP CVE-Lite Dependency Scan | https://github.com/sentzunhat/zacatl/actions/runs/28345130616 | success |
| Publish (dry-run) | https://github.com/sentzunhat/zacatl/actions/runs/28345130596 | success |
| Earlier PR run set on prior head | https://github.com/sentzunhat/zacatl/actions/runs/28345128894, https://github.com/sentzunhat/zacatl/actions/runs/28345128879, https://github.com/sentzunhat/zacatl/actions/runs/28345128878 | success |
| Earlier PR run set on prior head with action_required | https://github.com/sentzunhat/zacatl/actions/runs/28343254563, https://github.com/sentzunhat/zacatl/actions/runs/28343254523, https://github.com/sentzunhat/zacatl/actions/runs/28343254552 | action_required |

## Verified Strengths

- Root package now declares Node `>=26.3.0` and npm `>=11.0.0`.
- The current branch tip is mergeable and the PR has no review comments.
- The two gated PR workflows and the publish dry-run are currently passing on the latest successful PR run set.
- The branch contains the expected barrel/export pruning direction, with scripts and package exports aligned around `build-src-*` output.

## Findings

### P1

1. The CVE-Lite workflow claims a stronger reporting posture than the file currently implements.
   - Directly verified: `.github/workflows/cve-scan.yml` runs `npx cve-lite-cli` over each lockfile and fails on high severity, but it does not upload per-lockfile logs or any artifact.
   - Why it matters: the branch summary says per-lockfile scan logs are uploaded as `cve-lite-reports`, but the workflow file does not contain an `upload-artifact` step, so the evidence trail is weaker than advertised.
   - Confidence: Confirmed.

2. The CI security scan baseline is still on Node 24 while the repo baseline has moved to Node 26.
   - Directly verified: `.github/workflows/cve-scan.yml` uses `node-version: '24.14.0'`; `package.json` requires Node `>=26.3.0`.
   - Why it matters: this is a branch-level consistency gap that can hide Node-26-only dependency or runtime behavior differences in the security scan job.
   - Confidence: Likely.

### P2

1. The local tree contains unrelated worktree noise during review.
   - Directly verified: `git status --short` showed modified `examples/README.md` and untracked `examples/neutralino-react-transformers-webgpu/`.
   - Why it matters: this adds review ambiguity and makes it harder to separate branch delta from local experimental changes.
   - Confidence: Confirmed.

2. The PR head SHA reported by GitHub API does not match the local branch tip fetched from origin in this session.
   - Directly verified: GitHub API returned PR `head_sha` `d93d22a...`; local `HEAD` and fetched remote tip resolved to `c9083fc...`.
   - Why it matters: either the API response lagged or the remote branch moved after the fetch; either way, any follow-up implementation should re-check the live PR head before editing.
   - Confidence: Unclear.

## Compoundable Work-Item Backlog

### STAB-013 — Add CVE-Lite artifact logging
Priority: P1
Status: proposed
Scope: `.github/workflows/cve-scan.yml`
Why it matters:
The branch claims per-lockfile scan logs are saved as a `cve-lite-reports` artifact, but the workflow file currently only prints to the log and exits.
Direct evidence:
- `.github/workflows/cve-scan.yml` has no artifact upload step.
- The latest successful workflow run exists at `https://github.com/sentzunhat/zacatl/actions/runs/28345130616`.
Risk:
Low-to-medium. It is workflow-only, but it affects the security evidence trail.
Dependencies/overlap:
Potential overlap with any future CVE workflow normalization or Node-version alignment work.
Smallest safe change:
Add an explicit artifact collection step for the per-lockfile CVE output and keep the existing pass/fail behavior unchanged.
Validation:
- `sed -n '1,240p' .github/workflows/cve-scan.yml`
- `gh`-less fallback: re-run the workflow via GitHub Actions and confirm the artifact exists for a passing run
Acceptance criteria:
- Workflow uploads a `cve-lite-reports` artifact on each run.
- The job still fails when high-severity findings are present.
- The artifact name and contents are documented in the report.
Commit boundary:
One workflow file only.

### STAB-014 — Align CVE scan runtime with the Node 26 baseline
Priority: P2
Status: proposed
Scope: `.github/workflows/cve-scan.yml`, optionally related workflow docs
Why it matters:
The repo baseline is Node 26.3.0, but the CVE scan job still runs on Node 24.14.0.
Direct evidence:
- `package.json` requires Node `>=26.3.0`.
- `.github/workflows/cve-scan.yml` installs Node `24.14.0`.
Risk:
Low. This is a CI-runtime change, but it may surface version-specific dependency warnings.
Dependencies/overlap:
Overlaps with any broader CI baseline cleanup, but not with source code changes.
Smallest safe change:
Switch the scan job to the same Node 26 baseline used by peer-install and publish-dry jobs.
Validation:
- `sed -n '1,220p' .github/workflows/cve-scan.yml`
- Re-run the CVE workflow and confirm it still succeeds under Node 26.
Acceptance criteria:
- All three PR workflows use the same Node baseline unless there is a documented exception.
- The scan still passes.
Commit boundary:
One workflow file only.

## Notes

- This review only inspected the branch delta and live PR metadata; no source code was modified.
- The strongest direct evidence came from the GitHub API, the local `git` state, and the workflow files under `.github/workflows/`.
