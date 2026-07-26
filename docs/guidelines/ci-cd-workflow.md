# CI/CD Workflow

Zacatl uses a centralized CI orchestrator to gate development, testing, and releases. This guide explains the flow, what runs where, and how to debug failures.

## Workflow Architecture

**Single orchestrator** — `.github/workflows/ci.yml` is the only workflow responding to branch/PR/schedule events. It invokes reusable component workflows:

- `cve-scan.yml` — Production dependency CVE audit (`npm audit --omit=dev --audit-level=high`)
- `peer-install-check.yml` — Verify peerDependencies can be installed and imported
- `publish-dry.yml` — Full verification chain: tests, type check, lint, build, consumer smoke tests, and `npm publish --dry-run`
- `docker-smoke.yml` — Build and smoke-test three example Docker images (sqlite, postgres, mongodb)

All component workflows are **`workflow_call`-only** with no direct triggers, eliminating duplicate runs.

## What Runs Where

### Pull Request → dev or main

**Default:** CVE scan, peer install check (fast, ~5–10 min)  
**Blocks merge:** cve or peers failure  
**Optional:** Add `docker-test` label to run docker-smoke before merge

```
  pull_request -> dev/main
      ↓
    [cve-scan]
      ↓
  [peer-install-check]
      ↓
  [docker-smoke] ← only if labeled 'docker-test'
      ↓
   Merge enabled
```

**Why not docker on all PRs?** Docker builds three images and boots Postgres/Mongo containers (~15 min). Too expensive for routine PRs.

**When to add the docker-test label:**
- Before merging to main if you changed dockerfile, examples, or deployment config
- To verify docker works before release
- Anytime you want manual confidence — just add the label, wait ~20 min, then remove it

### Push to dev (after merge)

**Gates:** CVE scan, peer install check (fast feedback for developers)  
**Does NOT gate:** Dry-run, docker (those run on push to main only)

```
  push -> dev
      ↓
    [cve-scan]
      ↓
  [peer-install-check]
      ↓
   Commit accepted
```

### Push to main (release candidate)

**Full verification.** All checks pass before the release tag is created and npm publish is dispatched.

```
  push -> main
      ↓
    [cve-scan]
      ↓
  [peer-install-check]
      ↓
  [publish-dry.yml] ← full verification: tests, type check, lint, build, smokes, dry-run
      ↓
  [docker-smoke.yml] ← three images built and smoke-tested
      ↓
    [tag job]
      ↓
    Create v<version> tag
      ↓
  Dispatch release.yml
      ↓
  release.yml: CVE check → npm publish → GitHub Release
```

### Weekly schedule

**Drift detection** — Same as push to dev (cve, peers), no dry-run or docker.

```
  schedule (Monday 03:17 UTC)
      ↓
    [cve-scan]
      ↓
  [peer-install-check]
      ↓
   Alerts on changes
```

## Concurrency

The orchestrator uses GitHub's concurrency group to supersede in-flight runs:

```yaml
concurrency:
  group: ci-${{ github.workflow }}-${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true
```

This prevents stacking of checks when you push again before the previous check finishes.

## Release Gate

The `tag` job inside `ci.yml` is the release gate:

```yaml
tag:
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  needs: [cve, peers, dry, docker]
  runs-on: ubuntu-latest
  # Creates v<version> tag and dispatches release.yml
```

**Key:** `tag` only runs on a push to main (not PRs), and it waits for all four checks. A red merge cannot publish.

The `release.yml` workflow then:
1. Runs the same `npm audit --omit=dev --audit-level=high` check (must match the gate)
2. Runs `npm publish ./publish --access public --tag latest --provenance`
3. Creates a GitHub Release with notes from `docs/changelog.md`

## Debugging Failures

### PR is blocked by CVE or peers

Check the workflow logs on the PR:
- **cve-scan failure** — Run `npm audit --omit=dev --audit-level=high` locally. Fix vulnerabilities or update overrides in `package.json` (via `npm pkg set overrides.<pkg>="version"`).
- **peer-install-check failure** — Run `npm ci && npx tsx scripts/dev/install-peers.ts && npx tsx scripts/dev/check-peers.ts` locally.

### Push to dev fails

Same as PR failures. Cve and peers are the only gates on dev.

### Push to main fails before release

Check which job failed:
- **cve, peers, dry, docker** — See debugging steps above. The push is accepted but release is blocked.
- **tag job failure** — The tag creation or dispatch failed. Check git permissions and GitHub API access (NPM_TOKEN must be present).

### Release workflow fails after tag is pushed

The tag is already created and public. Manual recovery:
1. Check `release.yml` logs for the specific failure (usually `npm audit` or `npm publish`).
2. Fix the issue locally (e.g., new high-severity CVE found after tagging).
3. Re-run the release workflow manually: GitHub Actions UI → `release.yml` → Re-run failed jobs.

## Environment Variables & Secrets

- **`NPM_TOKEN`** (GitHub secret) — Scoped npm automation token, used by `release.yml` only (not visible during tests/build).
- **`NODE_ENV=test`**, **`ENV=test`** — Set by publish-dry and release workflows to run test suites.

## Triggering Checks Manually

All workflows support manual trigger via GitHub Actions:

1. **GitHub UI:** Actions → [Workflow Name] → Run workflow → Choose branch
2. **CLI:** `gh workflow run <workflow-file.yml> -r <branch>`

### Manual docker-smoke

Useful for testing on any branch without a PR:

```bash
gh workflow run docker-smoke.yml -r dev
```

The docker-smoke workflow will run immediately in the background (~20 min).

## Adding New Checks

To add a new check (e.g., security linting, license audit):

1. Create `.github/workflows/new-check.yml` with `on: workflow_call:` only.
2. Call it from `ci.yml`:
   ```yaml
   new-check:
     name: New Check
     uses: ./.github/workflows/new-check.yml
   ```
3. Update the `tag` job's `needs:` clause if this should gate the release.

Example — adding a SPDX license audit:

```yaml
# .github/workflows/license-audit.yml
on:
  workflow_call: {}

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npx license-report check --fail-on unknown
```

Then in `ci.yml`:

```yaml
license:
  name: License audit
  uses: ./.github/workflows/license-audit.yml

tag:
  needs: [cve, peers, dry, docker, license]  # Add to release gate if needed
```

## Performance Notes

- **PR/dev checks (cve, peers):** ~5–10 minutes
- **Main full verification (cve, peers, dry, docker):** ~20–30 minutes
  - Tests, type check, lint: ~8 min
  - Build: ~3 min
  - Consumer smoke tests: ~5 min
  - Docker smoke tests (3 images): ~15 min
- **Weekly schedule:** Same as main (full drift detection)

Docker smoke is the slowest step. If you need faster feedback on main, docker can be moved to a nightly schedule and dry-run kept on main. Contact the maintainers to discuss.

## Rollback

If a release ships with a critical issue:

1. **Revert the tag locally:**
   ```bash
   git tag -d v<version>
   git push origin :refs/tags/v<version>
   ```
2. **Revert the commits to main** via a new PR (don't force-push main).
3. **File an issue** for the fix and merge as a new commit to main.
4. The next push to main will create a new tag and dispatch a new release.
