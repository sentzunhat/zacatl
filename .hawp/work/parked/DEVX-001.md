# DEVX-001 — Devcontainer: library + examples with hot-reload

**Backlog ID:** DEVX-001
**Type:** improvement
**Reported:** 2026-07-06
**Updated:** 2026-07-09

---

## Goal

A single devcontainer that lets a developer:

1. Edit zacatl source (`src/`) and see the rebuild reflect immediately in
   any example running inside the same container.
2. Run any example with full hot-reload (backend via `tsx --watch` /
   `nodemon`, frontend via Vite dev server).
3. Run the full test suite, lint, and build without any host-side tooling.

This is "library-in-container + examples-live" — not just a static build
environment.

---

## Context

- Node ≥ 26.3.0, npm ≥ 11, TypeScript 6 (must pin — TS7 removes `baseUrl`)
- 8 examples: 4 SQLite (standalone), 2 MongoDB, 2 Postgres
- Examples reference zacatl via `file:../../` workspace link in their own
  `package.json` — the devcontainer must mount the repo root so this
  symlink resolves correctly inside the container.
- ORM peer drivers are now `optionalDependencies` on root (`sqlite3`,
  `mongoose`, `pg`, `better-sqlite3`) — `npm ci` at root installs them.
- MongoDB and Postgres examples need sidecar containers.

---

## Architecture

```
.devcontainer/
├── devcontainer.json          # Main config (VSCode / Codespaces)
├── docker-compose.yml         # Orchestrates app container + DB sidecars
└── scripts/
    └── post-create.sh         # npm ci + npm run build after container start
```

The app container:
- Image: `node:26-alpine` + python3/make/g++ (for native module rebuilds)
- Mounts repo root to `/workspace`
- Exposes ports 8081-8084, 8181-8184 (one per example backend)
- Sidecars: MongoDB (27017) + Postgres (5432) always-up for DB examples

---

## Dev workflows the container enables

### Library watch + example hot-reload
```bash
# Terminal 1: watch zacatl src rebuild
npm run build:watch

# Terminal 2: run any example backend with hot reload
cd examples/fastify-sqlite-react/apps/backend
npx tsx --watch src/index.ts

# Terminal 3: Vite dev server for the frontend
cd examples/fastify-sqlite-react/apps/frontend
npx vite
```

### Run tests
```bash
npm test
npm run test:watch
```

### Build full library
```bash
npm run build
```

---

## Implementation plan

### Phase 1: Base devcontainer (no hot reload yet)
- `devcontainer.json` pointing at `docker-compose.yml`
- `docker-compose.yml`: `app` service (node:26-alpine + build tools) + mongodb + postgres sidecars
- `post-create.sh`: `npm ci && npm run build`
- VSCode extensions: ESLint, Prettier, TypeScript, Svelte, REST Client

### Phase 2: Hot-reload dev scripts per example
- Add `dev` scripts to each example backend/frontend `package.json` if not present
- Backend: `tsx --watch src/index.ts` (uses `tsx` already in root devDeps)
- Frontend: `vite` (already in frontend `package.json`)
- Document workflow in `examples/docker.md` and `docs/guidelines/dev-setup.md`

### Phase 3: Optional docker-compose profile for MongoDB/Postgres examples
- Sidecars use same creds as the dev-env compose already in the repo (`local/local`)
- `depends_on` + healthchecks on sidecar start
- .env per example wires DB connection string to container hostnames

### Phase 4: Test and document
- Verify `npm run build`, `npm test`, all 8 examples can start in-container
- Test rebuild of `sqlite3` native module inside alpine container
- Add "Quick start with devcontainer" section to root README
- Add `docs/guidelines/dev-setup.md` (devcontainer + local-machine paths)

---

## Open questions (discuss before Phase 1)

1. Should the devcontainer use `node:26` (Debian) for broader tooling compatibility,
   or `node:26-alpine` to match the Docker build images?
2. Should the DB sidecars always start, or be behind a Docker Compose profile
   so SQLite-only contributors don't pull MongoDB/Postgres images?
3. Should `npm run build:watch` run automatically on `post-create`, or on demand?
4. Do we want a VS Code task.json with pre-configured launch configs for each example?

---

## Status

`plan-ready` — discuss open questions with user before implementing Phase 1.

---

## Parked — 2026-07-09

**Reason:** Devcontainer setup is useful but not blocking any active development or publish path. No active contributor has requested it. Re-open when onboarding a new contributor who needs containerized dev or when the project moves to a hosted CI environment that benefits from a devcontainer definition.
