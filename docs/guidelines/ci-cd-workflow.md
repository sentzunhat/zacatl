# CI/CD Workflow

Zacatl uses a centralized CI orchestrator to gate development, testing, and releases. This guide explains the flow, what runs where, and how to debug failures.

## Workflow Architecture

**Single orchestrator** — `.github/workflows/ci.yml` is the only workflow responding to branch/PR events. It invokes reusable component workflows:

- `cve-scan.yml` — Production dependency CVE audit (`npm audit --omit=dev --audit-level=high`)
- `peer-install-check.yml` — Verify peerDependencies can be installed and imported
- `publish-dry.yml` — Full verification chain: tests, type check, lint, build, consumer smoke tests, and `npm publish --dry-run`; opt in on a PR with the `publish-dry-run` label
- `docker-smoke.yml` — Build and smoke-test three example Docker images (sqlite, postgres, mongodb)

All component workflows are **`workflow_call`-only** with no direct `push`/`pull_request` triggers, eliminating duplicate runs on those events.

**Deliberate exception**: `cve-scan.yml` also carries its own weekly `schedule` trigger (same cron as `ci.yml`'s). `workflow_call` invocations never register as a top-level run of the *called* file, so without this, `cve-scan.yml`'s own badge/run-history would freeze on stale history regardless of how often the check itself runs inside `ci.yml`. This means the Monday 03:17 UTC scan genuinely runs twice — once as `ci.yml`'s scheduled `cve` job, once as `cve-scan.yml`'s own direct trigger. Accepted tradeoff: one extra ~15s job per week for a CVE Scan badge that's actually live (see the root README's badge section).

## What Runs Where

### Pull Request → dev or main

**Default:** CVE scan, peer install check (fast, ~5–10 min)  
**Blocks merge:** cve or peers failure  
**Optional:** Add `docker-smoke` to run Docker smoke before merge, or
`publish-dry-run` to run the full package verification and npm dry-run.

```
  pull_request -> dev/main
      ↓
    [cve-scan]
      ↓
  [peer-install-check]
      ↓
  [docker-smoke] ← only if labeled 'docker-smoke'
      ↓
  [publish-dry-run] ← only if labeled 'publish-dry-run'
      ↓
   Merge enabled
```

**Why not docker on all PRs?** Docker builds three images and boots Postgres/Mongo containers (~15 min). Too expensive for routine PRs.

**When to add the docker-smoke label:**
- Before merging to main if you changed dockerfile, examples, or deployment config
- To verify docker works before release
- Anytime you want manual confidence — just add the label, wait ~20 min, then remove it

**When to add the publish-dry-run label:**

- Before merging a release candidate
- After changing package metadata, exports, dependencies, or publish scripts
- To verify the packed consumer fixtures and `npm publish --dry-run`

Adding either label emits a new `pull_request:labeled` event and starts a new
orchestrator run. Removing a label does not cancel an already-running job; it
only prevents that label from selecting the next run.

### Push to dev (after merge)

**Gates:** nothing directly — covered by the open PR's `pull_request:synchronize` run.

Pushing to `dev` while a PR from `dev` is open fires two events for the same
commit: `push` and `pull_request:synchronize`. Running cve/peers on both was
pure duplicate work, so `push -> dev` is a no-op; the PR's `pull_request` run
is the one that actually gates the commit.

```
  push -> dev
      ↓
  (no jobs — see the PR's pull_request run for cve/peers)
```

If you push to `dev` with **no open PR**, no CI runs until you open one (or
until the weekly schedule catches drift). Open a PR to get immediate feedback.

### Push to main (release candidate)

**`should-release` runs first** — a cheap, unconditional job that checks whether `package.json`'s
version is already tagged (`git rev-parse -q --verify refs/tags/v<version>`). This answers "is there
actually a release pending?" before anything expensive runs, so a push to `main` that doesn't bump
the version (e.g. a docs-only follow-up commit right after a release) doesn't waste CI time — or fail
loudly inside `prepublish-guard.ts` with "already published" — on a run that could never publish
anyway.

**If a release is pending:** full verification completes first. A separate merge-only
`release-tag.yml` workflow then verifies the commit came from a merged PR and is still the current
tip of `main` before creating the release tag and dispatching npm publish.

```
  push -> main
      ↓
  [should-release] ← is package.json's version already tagged?
      ↓
    [cve-scan]
      ↓
  [peer-install-check]
      ↓
  [publish-dry.yml] ← full verification: tests, type check, lint, build, smokes, dry-run
      ↓                 (skipped if should-release says nothing is pending)
  [docker-smoke.yml] ← three images built and smoke-tested
      ↓                 (skipped if should-release says nothing is pending)
    CI completes successfully
      ↓
  [release-tag.yml] ← merged PR + current main tip guard
      ↓
    Create v<version> tag
      ↓
  Dispatch release.yml
      ↓
  release.yml: CVE check → npm publish → GitHub Release
```

**If no release is pending:** `cve` and `peers` still run (cheap, always useful drift checks);
`dry` and `docker` skip cleanly, and `release-tag.yml` exits without creating a duplicate tag.

### Weekly schedule

**Drift detection** — Same as push to dev (cve, peers), no dry-run or docker. Two separate schedule
triggers fire at the same cron: `ci.yml`'s own (running `cve` + `peers` as jobs) and
`cve-scan.yml`'s standalone one (badge freshness — see the exception noted above). `peers` only
runs once, via `ci.yml`.

```
  schedule (Monday 03:17 UTC)
      ↓                              ↓
    [cve-scan] (via ci.yml)     [cve-scan.yml] (standalone, badge only)
      ↓
  [peer-install-check]
      ↓
   Alerts on changes
```

## Concurrency

The orchestrator uses GitHub's concurrency group to supersede in-flight runs:

```yaml
concurrency:
  group: ci-${{ github.event.pull_request.number || github.head_ref || github.ref_name }}
  cancel-in-progress: true
```

Keying by PR number (falling back to branch) avoids cross-PR/fork collisions when two PRs
happen to share a source branch name, while still superseding in-flight runs when you push
again before the previous check finishes.

## Release Gate

The `should-release` job inside `ci.yml` runs first and decides whether there's anything to release:

```yaml
should-release:
  runs-on: ubuntu-latest
  outputs:
    pending: ${{ steps.check.outputs.pending }}
  # Checks git tags for v<package.json version>; sets pending=false if it already exists
```

`dry` and `docker` only run when `needs.should-release.outputs.pending == 'true'` (in addition to
being a push to main). After the CI workflow completes successfully, `release-tag.yml` is the
merge-only release gate:

```yaml
on:
  workflow_run:
    workflows: ['CI']
    types: [completed]
    branches: [main]

jobs:
  tag:
    if: >
      github.event.workflow_run.conclusion == 'success' &&
      github.event.workflow_run.event == 'push' &&
      github.event.workflow_run.head_branch == 'main'
    # The job also checks that head_sha belongs to a merged PR into main and is
    # still the current main tip immediately before tagging.
    # Creates v<version> and dispatches release.yml.
```

**Key:** `release-tag.yml` is not part of PR CI. It only considers successful CI runs for `main`,
requires the CI commit to belong to a merged PR targeting `main`, and fails closed if `main` has
advanced since that CI run. A red merge cannot publish, and a repeat version exits without creating
a duplicate tag.

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
- **cve, peers, dry, docker** — See debugging steps above. The merge is accepted but release is blocked.
- **release-tag workflow failure** — Check the merged-PR and current-main guards first. A stale CI run
  is intentionally rejected so a newer `main` commit can complete its own release gate. For tag
  creation or dispatch failures, check GitHub API permissions; `NPM_TOKEN` is only used later by
  `release.yml` during npm publication.

**`dry` failing with "Version X is already published to npm"** — this shouldn't happen anymore on a
normal push to main; `should-release` is supposed to skip `dry` entirely once the current version is
tagged. If you see it, either `should-release` mis-detected the tag (check `git fetch --tags` locally
and confirm `v<version>` exists), or you triggered `publish-dry.yml` directly via manual dispatch
(bypassing `should-release` — expected there, since a manual dry-run check on an already-published
version is a legitimate thing to want to confirm).

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
