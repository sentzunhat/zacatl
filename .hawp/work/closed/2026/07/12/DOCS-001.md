# DOCS-001 - Correct Docker runtime and image-size guidance

input: |
  Remove stale Alpine guidance and publish current measured Docker results.

context: |
  examples/Dockerfile uses node:26-trixie-slim build stages and a distroless
  Node 26 Debian 13 non-root runtime. examples/DOCKER.md still claimed Alpine
  and 269-282 MB images.

mission: |
  Align the current Docker deployment guide with the implemented runtime and
  reproducible measurements.

constraints: |
  Preserve dated historical reports as historical evidence. Separate Docker
  Desktop expanded size from exported compressed size. Report only candidates
  that were directly built and smoke-tested.

output: |
  Current documentation names the real images, explains native-module ABI
  matching, records the benchmark conditions, and supersedes stale size claims.

## Directly verified

- Docker Desktop 29.4.0, Linux/ARM64, 2026-07-12.
- `fastify-sqlite-react` with distroless: 426 MB expanded, 88.3 MB exported gzip, HTTP 200.
- `fastify-sqlite-react` with Alpine: 423 MB expanded, 93.0 MB exported gzip, HTTP 200.
- `fastify-sqlite-react` with Node Trixie Slim runtime: 547 MB expanded, 114.0 MB exported gzip; non-root candidate exited 1.
- Distroless plus `node:26-trixie-slim` remains the selected Dockerfile design.
- Updated the parked devcontainer plan to match the Debian 13 glibc build environment.
- Marked the stale Docker section in the active comprehensive audit as superseded.
- Rebuilt and measured all eight current example images:
  - PostgreSQL: 404 MB expanded, 82.1 MB exported gzip.
  - MongoDB: 417 MB expanded, 83.9 MB exported gzip.
  - SQLite React: 426 MB expanded, 88.3 MB exported gzip.
  - SQLite Svelte: 426 MB expanded, 88.0 MB exported gzip.
- All four SQLite variants returned HTTP 200 from `/api/greetings`.
- MongoDB variants remained running without sidecars; PostgreSQL variants require their sidecars to start successfully.
