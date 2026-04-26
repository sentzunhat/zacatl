## STAB-024 — Right-size example images without breaking ORM peer resolution

Status: inbox
Scope: `examples/Dockerfile`, root `package.json` (dependencies vs devDependencies)

### Direct evidence (2026-07-08)

While verifying containers actually run (not just build/type-check), found
the shared `examples/Dockerfile`'s final runtime stage never copied
`/app/node_modules` (the root zacatl dependency tree) — only the example's
own `node_modules`. Fixed in this session: added
`COPY --from=build-backend /app/node_modules /app/node_modules` to Stage 4.

That fix works, but reveals a structural cost: zacatl's compiled output
(`build-src-esm/**`) resolves its own runtime deps (`reflect-metadata`,
`tsyringe`) **and** the optional ORM peers (`sqlite3`, `mongoose`, `pg`,
`better-sqlite3`) by walking up from its own file location to
`/app/node_modules` — not from the consuming example's `node_modules`. Those
four ORM peers are listed **only** in root `package.json`'s
`devDependencies` (present there for zacatl's own test suite), not
`dependencies`. That means:

- Root `/app/node_modules` must be carried into the runtime image **fully
  un-pruned** (dev + prod) for any ORM peer to resolve, since
  `npm prune --omit=dev` at root strips them along with real devDependencies
  (confirmed: pruning broke `sqlite3` resolution in a fastify-sqlite-react
  test build this session).
- Every example image now ships root's full devDependency tree
  (typescript, eslint, vitest, tsx, etc.) it will never use at runtime.
- Measured image sizes are **~400-420MB** per example post-fix — the
  184-213MB figures previously documented in `docker.md` were from images
  that never actually started (missing `reflect-metadata` entirely), not
  real working measurements.

### Goal

Get back to a lean, correct image without the root-devDependency dependency:

1. Move the four ORM peer packages (`sqlite3`, `mongoose`, `pg`,
   `better-sqlite3`) from root `devDependencies` to `peerDependencies` +
   `optionalDependencies` (or similar) so they're real, prunable-safe
   dependencies rather than devDependency-only artifacts that happen to be
   present for zacatl's own tests.
2. Once moved, `npm prune --omit=dev` at root should preserve them, letting
   the Dockerfile prune both the example and root node_modules trees back
   down to production-only — re-measure and confirm image sizes drop close
   to the previously-assumed ~200MB range.
3. Alternative approach if (1) has unwanted effects on the published
   package's own dependency tree: explicitly `npm install --no-save
   <the-one-driver-the-example-needs>` at root right before the root prune
   in the Dockerfile, keyed off which `EXAMPLE` build-arg is active — more
   surgical, less invasive to root `package.json`, but couples the
   Dockerfile to knowing per-example driver requirements.
4. Whichever approach is chosen, re-verify with the same rebuild + container
   run + CRUD smoke test used in this session (not just `docker images`
   size or `tsc --noEmit` — those don't catch a container that fails at
   actual startup).

### Verification

- All 8 examples: `docker build` → `docker run` → actual HTTP CRUD round
  trip (create/read/delete) succeeds, not just a clean build.
- Image sizes re-measured and `docs/examples/docker.md` updated with real
  numbers, not build-time-only estimates.
- `npm audit` still clean at root and in all 8 examples after any
  dependency reclassification.
