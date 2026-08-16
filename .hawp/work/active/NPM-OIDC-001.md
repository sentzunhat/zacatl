# NPM-OIDC-001 — replace publish token with npm Trusted Publishing

**UUID:** `NPM-OIDC-001` · **Type:** security/release · **Priority:** P0 · **Reported:** 2026-08-15
**Status:** plan-ready · **Owner:** agent (unassigned)

## Goal

Remove the long-lived `NPM_TOKEN` publish credential from the Zacatl release
path and use npm Trusted Publishing through GitHub Actions OIDC, while keeping
release verification and provenance intact.

## Current evidence

- `.github/workflows/release.yml` already requests `id-token: write`.
- The release workflow publishes with `npm publish ./publish --provenance`.
- The actual publish step still receives `NODE_AUTH_TOKEN` from the
  `NPM_TOKEN` GitHub secret.
- The repository's existing workflow has separate CVE, verification, publish,
  and GitHub Release stages.

## Required implementation

1. Configure npm Trusted Publishing for `@sentzunhat/zacatl` using the exact
   GitHub owner, repository, workflow filename, and optional protected release
   environment.
2. Confirm the npm CLI version used by the release runner supports Trusted
   Publishing.
3. Remove the publish-time `NPM_TOKEN`/`NODE_AUTH_TOKEN` dependency from the
   release workflow.
4. Keep the publish job's least-privilege permissions, especially
   `contents: read` and `id-token: write`; use `contents: write` only where
   GitHub Release creation requires it.
5. Test the workflow through a safe release candidate or npm staged publish
   path before disabling the existing credential.
6. Revoke the legacy publish token after successful OIDC verification.
7. Document recovery and rotation procedures without recording credentials.

## Acceptance criteria

- A GitHub-hosted release run publishes successfully using OIDC without an
  npm publish token secret.
- npm shows a provenance attestation tied to the intended repository and
  workflow.
- A workflow or repository outside the configured trust relationship cannot
  publish the package.
- The old `NPM_TOKEN` secret is removed or is provably unused and then
  revoked at npm.
- CI, publish verification, Docker smoke, and GitHub Release creation remain
  green.
- The release workflow does not expose registry credentials to test, lint, or
  build steps.

## Non-goals

- Do not implement this migration as part of the current `0.0.60` preparation
  without owner approval.
- Do not print, copy, rotate, or delete any credential until the exact npm and
  GitHub targets have been verified.
- Do not weaken branch protection, tag controls, or release gates to make the
  migration pass.

## References

- npm Trusted Publishing: https://docs.npmjs.com/trusted-publishers/
- npm provenance: https://docs.npmjs.com/generating-provenance-statements/
- GitHub Actions OIDC: https://docs.github.com/en/actions/reference/security/oidc
