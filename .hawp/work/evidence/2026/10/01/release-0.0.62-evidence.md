# Release 0.0.62 — evidence (2026-10-01)

Closes `RUNTIME-FIX-001`.

| Check | Result |
| ----- | ------ |
| npm | `@sentzunhat/zacatl@0.0.62`, `dist-tags.latest = 0.0.62`, published 2026-09-30T20:19:00Z |
| Provenance | npm attestation predicate `https://slsa.dev/provenance/v1` |
| Tag | `v0.0.62` → `0fb701e8` (merge of #116, `dev` → `main`) |
| Release workflow | `release.yml` on `v0.0.62`: success (2026-09-30T20:14:22Z) |
| GitHub Release | published 2026-09-30T20:16:38Z |
| CI on `main` | `ci.yml` push run for `0fb701e8`: success (release gate incl. dry-run + Docker smoke) |
| CVE badge | `cve-scan.yml` re-run on `main` via workflow_dispatch: success |

Sources: `npm view @sentzunhat/zacatl@0.0.62`, `gh release view v0.0.62`,
`gh run list --workflow release.yml|ci.yml|cve-scan.yml`.

Shipped content: PR #115 (optional-peer import fixes, barrel polyfill fix,
Fastify double-send fix, production audit fixes, `check:optional-peers`,
badge script fix) and the CI de-duplication + HAWP kit update commits on
`dev` before #116.
