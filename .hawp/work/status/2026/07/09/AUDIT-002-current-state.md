# AUDIT-002 — Pre-0.0.56 Current-State Review

**Date:** 2026-07-09  
**Branch:** `dev` (41 commits ahead of `main`)  
**Node:** v26.3.0 | **npm:** 11.17.0 | **TypeScript:** ^6.0.3  

---

## Verification (all green)

| Check | Result |
| ----- | ------ |
| `npm run type:check` | ✅ Pass — 0 failures / 3 |
| `npm run lint:silent` | ✅ Pass — 0 errors, 12 warnings (no-console only) |
| `npm test` | ✅ 556 tests passed (74 files) |
| `npm run build` | ✅ Pass — 0 failures / 2; 40 barrel files pruned |
| `npm run publish:dry:ci` | ✅ `@sentzunhat/zacatl@0.0.56` dry-run — 439 files, 80 kB |
| Docker base image | ✅ `node:26-alpine` across all 3 stages |
| TypeScript version | ✅ `^6.0.3` everywhere (root + all 8 examples) |
| CI Node version | ✅ `26.3.0` in `.github/workflows/cve-scan.yml` |

---

## P0 — All resolved ✅

1. **Export map drift** — `local:exports` wired into `postbuild`. 152 exports, 0 missing.
2. **Breaking import path changes** — documented in changelog + third-party shim files in place.
3. **Version strategy** — consolidated at `0.0.56`; npm registry still at `0.0.55`.

---

## P1 — Production gaps (status as of 2026-07-09)

### 4. Graceful shutdown — `Service.stop()` missing
**Evidence:** `server.ts` has `start()` only; no `stop()`, no SIGTERM/SIGINT handler.  
`DatabaseServer.disconnect()` IS wired and calls all adapter `disconnect()` methods.  
**Gap:** `stop()` never gets called; containers rely on Docker kill with no clean DB disconnect.  
**Severity:** Acceptable for 0.0.56 (Docker examples handle it); flag for 0.0.57.

### 5. Mongoose and Sequelize `disconnect()` are stubs
**Evidence:**
```typescript
// mongoose.ts:42
async disconnect(): Promise<void> {
  // Implement disconnect if needed
}
// sequelize.ts:30
async disconnect(): Promise<void> {
  // Implement disconnect if needed
}
```
SQLite disconnect IS implemented (calls `this.db.close()`).  
**Gap:** Mongoose/Sequelize connections never closed cleanly.  
**Severity:** Low for 0.0.56 — no graceful shutdown exists anyway, so stubs are consistent with current behavior.

### 6. `correlationId` not surfaced in API responses
**Evidence:** `handleError()` returns `{ message, statusCode }` only. `CustomError.correlationId` exists and is set but never included in HTTP response body. Both Express and Fastify handlers have the same gap.  
**Gap:** Consumers cannot correlate client-side errors with server logs.  
**Severity:** Acceptable for 0.0.56; document as known limitation.

### 7. Request context not wired per-request
**Evidence:** No `requestContext` population found in provider adapters (`providers/express/`, `providers/fastify/`).  
**Severity:** Same as #6 — no change since June audit.

### 8. Legacy adapter concern — resolved ✅
**Evidence:** Only `src/third-party/express.ts` exists (re-export shim). The previously flagged `api/express-adapter.ts` path is gone. No duplicate adapter files found.

---

## P2 — Follow-through

| Item | Status |
| ---- | ------ |
| STAB-025 (React/Svelte devDeps) | ✅ Closed 2026-07-09 |
| STAB-026 (screenshots) | ✅ Closed 2026-07-09 |
| STAB-024 (Docker right-sizing) | ✅ Closed 2026-07-09 |
| STAB-022 (non-root Docker) | ✅ Closed 2026-07-08 |
| STAB-021 (naming alignment) | ✅ Closed 2026-07-08 |
| STAB-001 (CI Node 26) | ✅ Already at `26.3.0` |
| Tailwind 4 migration | 🟡 Deferred — breaking migration, flag as STAB-027 |
| ESLint 10 upgrade | 🟡 Deferred — `eslint-plugin-import` peer conflict; stay on 9.x |
| TypeScript 7 upgrade | 🔴 Blocked — `@typescript-eslint@8.x` only supports TS <6.1; lock at ^6.0.3 |
| Dep updates (root) | ✅ prettier ^3.9.5, vite ^8.1.4, npm 12 — all safe bumps landed |
| Example dep updates | ✅ vite ^8.1.4 across all 8 frontends |
| DEVX-001 (devcontainer) | 🟡 plan-ready, post-publish |
| REFACTOR-001 (barrel removal) | 🟡 plan-ready, post-publish |
| AUDIT-002 | ✅ This report |

---

## Publish readiness verdict

**Go for 0.0.56.** All gates pass. P1 gaps are documented known limitations consistent with 0.0.55 behaviour — none are regressions introduced in this branch. The publish tarball is clean (80 kB / 439 files).

**Recommended pre-publish step:** commit all pending changes on `dev`, open a PR to `main`, merge, then `npm publish`.

**Post-0.0.56 backlog:**
- STAB-027: Tailwind 4 migration (breaking; all 8 examples)
- Implement `Service.stop()` + SIGTERM wiring
- Implement real Mongoose + Sequelize `disconnect()`
- Surface `correlationId` in `handleError()` response body
