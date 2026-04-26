## STAB-017 — Remove `src/` index barrels and verify example Docker startup
Status: in-progress
Scope: `src/**`, `examples/fastify-sqlite-react`, shared `examples/Dockerfile`
Why it matters:
The `src/` tree still exposes many `index.ts` barrel entrypoints. That makes package internals easier to leak into published subpaths and keeps import resolution coupled to directory barrels.
Direct evidence:
- `rg --files src | rg '/index\\.ts$'` still finds many barrel files in `src/`.
- The example Docker setup reuses the shared `examples/Dockerfile`, so the fastify-sqlite-react flow should be verified against that shared path.
Goal:
Move source exports off `index.ts` files where practical, keep package imports stable or intentionally updated, and verify the example image can at least start cleanly.
Verification:
- Re-run source typecheck/lint as needed.
- Build and start the fastify-sqlite-react example container path.
