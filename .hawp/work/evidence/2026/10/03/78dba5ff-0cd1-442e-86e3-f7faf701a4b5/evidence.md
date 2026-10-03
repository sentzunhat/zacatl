# Release 0.0.63 — evidence (2026-10-03)

Closes `LOG-001`.

| Check | Result |
| ----- | ------ |
| npm | `@sentzunhat/zacatl@0.0.63`, `dist-tags.latest = 0.0.63` |
| Provenance | npm attestation predicate `https://slsa.dev/provenance/v1` |
| Tag | `v0.0.63` → `8e832b7c` (squash merge of #121, `dev` → `main`) |
| CI on `main` | `ci.yml` push run for `8e832b7c`: success (release gate incl. dry-run + Docker smoke) |
| Release tag | `release-tag.yml` (workflow_run) for `8e832b7c`: success (2026-10-03T20:41:22Z) |
| Release workflow | `release.yml` for `8e832b7c`: success (2026-10-03T20:41:33Z) |
| GitHub Release | published 2026-10-03T20:44:03Z |
| Branch sync | `origin/main` and `origin/dev` both at `8e832b7c` (0 / 0 divergence) |

Sources: `npm view @sentzunhat/zacatl@0.0.63`, `gh release view v0.0.63`,
`gh run list --commit 8e832b7c…`, `git rev-list --left-right --count origin/main...origin/dev`.

Shipped content: PR #118 (shared logger — `toFastifyLogger(adapter)`,
`ServiceConfig.logger`, `LoggerToken` in the Service container, Express
`req.log` / `reply.log`, four Fastify examples on a shared logger;
`http-proxy-middleware` as an optional peer for GHSA-vfj7-8cjw-p6xm), the
HAWP kit refresh, and the 0.0.63 release prep, via #121.
