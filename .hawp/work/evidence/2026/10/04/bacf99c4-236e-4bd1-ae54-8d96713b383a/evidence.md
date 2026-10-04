# Release 0.0.64 — evidence (2026-10-04)

Closes `DEPS-063`.

| Check | Result |
| ----- | ------ |
| npm | `@sentzunhat/zacatl@0.0.64`, `dist-tags.latest = 0.0.64` |
| Provenance | npm attestation predicate `https://slsa.dev/provenance/v1` |
| Tag | `v0.0.64` → `8fa7a790` (squash merge of #124, `dev` → `main`) |
| CI on `main` | `ci.yml` push run for `8fa7a790`: success (2026-10-04T14:56:36Z) |
| Release tag | `release-tag.yml` (workflow_run): success (2026-10-04T14:58:27Z) |
| Release workflow | `release.yml`: success (started 2026-10-04T14:58:37Z) |
| GitHub Release | published 2026-10-04T15:01:05Z |
| Branch sync | `origin/main` and `origin/dev` both at `8fa7a790` |

Sources: `npm view @sentzunhat/zacatl@0.0.64`, `gh release view v0.0.64`,
`gh run list --commit 8fa7a790…`, `git ls-remote --heads origin dev main`.

Shipped content: PR #119 (in-major root updates, example lockfile audit
fixes, example lockfiles without `http-proxy-middleware`, 0.0.64 release
prep, LOG-001 close) via #124. Pre-merge audit on `dev`: `npm audit --omit=dev`
0; `npm audit --package-lock-only` 0 in all nine examples.

Note: merging #124 auto-deleted `dev` (repo setting `delete_branch_on_merge`);
the owner recreated it from `main`.
