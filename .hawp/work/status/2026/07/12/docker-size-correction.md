### Status Report

#### Intent

Correct current Docker documentation that presented stale Alpine architecture and image-size claims as current facts.

#### Current State

`examples/Dockerfile` uses `node:26-trixie-slim` build/install stages and `gcr.io/distroless/nodejs26-debian13:nonroot` at runtime.

#### What Was Inspected

The current Dockerfile, current deployment guide, Git history for the former Alpine Dockerfile, Docker image metadata, exported image archives, container state, and the Fastify SQLite API endpoint.

#### What Changed

`examples/DOCKER.md` now documents the implemented images, glibc ABI requirement, non-root uid 65532, current benchmark results, and the difference between expanded and compressed image sizes. Current active and parked HAWP plans no longer recommend Alpine or the stale 200-300 MB target.

#### What Was Directly Verified

- Docker Desktop 29.4.0 on Linux/ARM64.
- Distroless candidate: 426 MB expanded, 88.3 MB exported gzip, HTTP 200.
- Alpine candidate: 423 MB expanded, 93.0 MB exported gzip, HTTP 200.
- Node Trixie Slim runtime candidate: 547 MB expanded, 114.0 MB exported gzip, exited 1 under the tested non-root configuration.
- Current PostgreSQL examples: 404 MB expanded, 82.1 MB exported gzip each.
- Current MongoDB examples: 417 MB expanded, 83.9 MB exported gzip each.
- Current SQLite React examples: 426 MB expanded, 88.3 MB exported gzip each.
- Current SQLite Svelte examples: 426 MB expanded, 88.0 MB exported gzip each.
- All four SQLite images returned HTTP 200 from `/api/greetings`.
- Both MongoDB images remained running without database sidecars during the startup check.
- Both PostgreSQL images built successfully but exited without their required database sidecars.

#### What Remains Unproven

End-to-end CRUD was not rerun for MongoDB and PostgreSQL because this size pass did not launch database sidecars.

#### Constraints

Dated HAWP records retain their historical measurements. They are not current deployment guidance.

#### Help Wanted

None.

#### Suggested Next Step

Reduce duplicated or unnecessary runtime dependencies if a materially smaller expanded image is required.
