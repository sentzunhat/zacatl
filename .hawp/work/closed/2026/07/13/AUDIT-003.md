# AUDIT-003 - Package security and Docker size audit

input: |
  Check the package for security issues and determine whether the Docker images
  can be reduced further.

context: |
  Zacatl 0.0.56 uses Node 26 Trixie Slim build stages and a distroless Node 26
  Debian 13 runtime. Current expanded image sizes are 404-426 MB.

mission: |
  Perform an evidence-first package, source, publication, and container audit,
  then rank confirmed security findings and practical image-size opportunities.

constraints: |
  Audit only; do not implement security or dependency-layout changes. Preserve
  unrelated worktree changes. Separate direct evidence from inference.

output: |
  A ranked audit report under `.hawp/work/status/2026/07/13/` with direct
  evidence, unknowns, non-findings, and recommended next work.

## Outcome

Completed on 2026-07-13. See
`.hawp/work/status/2026/07/13/package-security-and-docker-size-audit.md`.
