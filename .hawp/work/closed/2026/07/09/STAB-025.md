# STAB-025 — Add frontend packages as zacatl optional peers

**Backlog ID:** STAB-025
**Type:** improvement
**Reported:** 2026-07-09

---

## Goal

Declare React, Svelte, and Vite (and their type packages) as `peerDependencies`
+ `optionalDependencies` on the root `package.json`, exactly the same pattern
used for ORM drivers after STAB-024. This lets examples (and future consumers)
pull frontend packages from zacatl's own install rather than declaring their
own independent versions.

---

## Motivation

- ORM drivers are now in `optionalDependencies` + `peerDependencies` on root.
- Frontend packages (React, React-DOM, Svelte, Vite, @vitejs/plugin-react,
  @sveltejs/vite-plugin-svelte) are still independently declared per-example
  in each `apps/frontend/package.json`.
- Centralizing versions in zacatl means one version bump propagates to all
  8 examples, and consumers can rely on the same frontend versions zacatl
  itself was tested against.

---

## Packages to centralize

| Package | Current location | Target |
|---------|-----------------|--------|
| `react` | `examples/*/apps/frontend/package.json` | root `optionalDependencies` + `peerDependencies` |
| `react-dom` | same | same |
| `@types/react` | same | root `devDependencies` (types are dev-only) |
| `@types/react-dom` | same | root `devDependencies` |
| `svelte` | same | root `optionalDependencies` + `peerDependencies` |
| `@vitejs/plugin-react` | same | root `optionalDependencies` + `peerDependencies` |
| `@sveltejs/vite-plugin-svelte` | same | root `optionalDependencies` + `peerDependencies` |
| `vite` | root `devDependencies` (already) | add to `peerDependencies` too |

---

## Implementation steps

1. Audit current versions across all 8 example frontends — confirm they're
   already aligned (or align them first).
2. Add packages to root `optionalDependencies` + `peerDependencies` with
   matching version ranges.
3. Remove redundant declarations from each `apps/frontend/package.json`
   (they'll resolve from root via workspace symlink).
4. Run `npm install` at root to update `package-lock.json`.
5. Verify: `npm test` passes; each example frontend still builds (`npm run build`)
   and dev server starts (`npm run dev`).
6. Update `docker.md` and `docs/guidelines/architecture.md` if sizes change.

---

## Risk

- Frontend packages pulled from root will only work when the example's
  `apps/frontend` is installed as part of the zacatl workspace. Standalone
  consumers of an example who `npm install` inside `apps/frontend/` alone
  will need the packages declared there. Mitigation: keep them in both places
  (root for version governance, example for standalone install support), or
  document the workspace requirement.

---

## Status

`inbox` — no plan review yet; implement after DEVX-001 Phase 1 is agreed.

## Implementation notes (2026-07-09)

All 8 example frontends were already aligned on identical versions. Added to
root `devDependencies` (not `optionalDependencies` — those survive
`npm prune --omit=dev` and would bloat the final Docker image since frontend
packages are not needed at runtime). Individual frontend `package.json` files
kept unchanged for standalone copy-paste use and Docker build compatibility.
Pattern mirrors how `vite` was already handled before this work.

## Status

`done` — 2026-07-09
