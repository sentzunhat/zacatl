## STAB-022 — Harden examples/Dockerfile: run as non-root user

Status: done (2026-07-08)
Scope: `examples/Dockerfile`, `examples/docker.md`

### Completion notes (2026-07-08)

Implemented exactly as planned: `--chown=node:node` on every `COPY` in the
final runtime stage, plus an explicit `RUN chown node:node
/app/examples/${EXAMPLE}` for the WORKDIR itself (Docker creates WORKDIR
before the COPYs run and it stays root-owned regardless of `--chown` on
individual copies — needed since the SQLite examples write
`database.sqlite` directly into this directory at runtime). `USER node`
set right before `CMD`.

Verified across all 8 examples: fresh `docker build`, `docker run --rm
<image> id` → `uid=1000(node) gid=1000(node) groups=1000(node)` for every
one. Then full functional verification, not just build success — actual
`docker-compose.yml` stacks for one example per ORM (SQLite via direct
`docker run`, MongoDB and PostgreSQL via their real compose stacks) with a
complete create/display/delete CRUD round trip confirmed as the non-root
user, including the SQLite write path (the one operation `--chown` had to
get right). Image sizes unchanged (`chown` only rewrites ownership
metadata in a layer, not content) — 417/413/415/404 MB depending on
example, same as pre-STAB-022.

Added a "Security: Non-Root Runtime User" section to `examples/docker.md`
documenting the rationale and the `docker run --rm <image> id` verification
command. Did not add a `HEALTHCHECK` (listed as optional/nice-to-have in
the original plan, not the driver) — several examples' `docker-compose.yml`
files already define their own `healthcheck:` blocks at the compose level.

### Direct evidence (2026-07-08 security audit)

`grep -n "USER" examples/Dockerfile` → no matches. The consolidated runtime
stage (node:26-alpine) never drops privileges, so every example container
runs its Node process as **root**. The base image already ships a `node`
user (uid 1000) for exactly this purpose.

Alpine's lack of a default shell reduces exploit surface, but a
container-escape or dependency-RCE scenario is strictly worse as root.
Docker/K8s hardening baselines (and `docker scout` / trivy policy checks)
flag this.

### Goal

1. In the runtime stage, `chown` the app directory to `node:node` during
   COPY (`COPY --chown=node:node ...`) and add `USER node` before `CMD`.
2. Verify all 8 examples still build and start (port binding is 8080+, no
   privileged ports, so no root requirement exists).
3. Optionally add a `HEALTHCHECK` while touching the file (nice-to-have,
   not the driver).
4. Note the non-root user in `examples/docker.md`'s security section.

### Verification

- `docker build` all 8 examples via the consolidated Dockerfile.
- `docker run --rm <img> id` shows uid=1000(node).
- One representative example per server vendor starts and serves a request.
