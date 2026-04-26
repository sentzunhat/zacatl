# Publish Handoff — @sentzunhat/zacatl 0.0.57

**Date:** 2026-07-10  
**Branch:** `dev` — 10 commits ahead of `origin/dev`, not yet pushed  
**Target:** bump to `0.0.57`, PR dev → main, `npm publish`  
**Repository:** `git@github.com:sentzunhat/zacatl` (or https equivalent)

---

## What this sprint delivered

The `dev` branch contains the following completed work on top of the
published `0.0.56`:

### REFACTOR-001 — barrel removal
All nested `index.ts` barrel files removed from `src/`. Each module now
has a **sibling facade file** (`src/error.ts` next to `src/error/`) as
its sole public entry point. Consumers import from explicit subpaths.
`src/service/index.ts` kept as a thin one-line re-export for the
`./service` package export map entry — it is not a barrel.

### TWL-004 — Tailwind CSS 4 migration
All 8 example frontends migrated from Tailwind 3 to Tailwind 4:
- `@import "tailwindcss"` replaces `@tailwind base/components/utilities`
- `@theme {}` block in CSS replaces `tailwind.config.ts` (deleted)
- `@tailwindcss/vite` Vite plugin replaces PostCSS plugin
- `postcss.config.cjs` deleted from all 8 examples
- `--font-*` (not `--font-family-*`) in `@theme` for utility generation

### Script fixes
- `scripts/publish/export-policy.ts` — removed dead `nestedIndexAllowlist`
  entry (`service/layers/infrastructure/types` is now a named `.ts` file)
- `scripts/publish/prepare-publish.ts` — simplified 3-block bin copy to 1;
  fixed `../utils/` import rewrite regex (was only matching `index.js`,
  missing `measure-time.js` — latent broken import in published binary)

### Docs drift fixes
- `docs/guidelines/architecture.md` — folder tree, path aliases, exports
  example, summary table all updated to post-barrel reality
- `docs/guidelines/framework-overview.md` — removed barrel guidance
- `docs/guidelines/project-context.md` — regenerated `files_src` inventory
- `docs/service/rest-handlers.md` — fixed import path + folder tree
- `docs/service/handler-best-practices.md` — fixed 4 stale root-service
  import paths for `GetRouteHandler`, `PostRouteHandler`, `HookHandler`
- `docs/guidelines/code-style.md` — replaced barrel export example with
  sibling facade pattern

### API prefix unification — all 8 examples
All backends now serve routes under `/api` using the framework's
`server.prefixes: { api: '/api' }` field. Previously only 2 of 8 had
this set; the rest registered at bare `/greetings`. Also fixed:
- All 6 broken frontends updated to fetch `/api/greetings`
- All 7 vite dev proxies tightened from `'^/(api|greetings)'` → `'^/api'`
- `page.prefixes` removed from all configs — framework default `{ api: '/api' }` is sufficient
- New doc: `docs/examples/frontend-backend-gotchas.md`
- `examples/README.md` endpoint spec updated to `/api/greetings`

---

## Verification already run on this machine

| Check | Result |
|---|---|
| `npm test` | ✅ 556 / 556 passed |
| `npm run lint:silent` | ✅ 0 errors |
| `npm run type:check` | ✅ 0 errors |
| `npm run check:peers` | ✅ better-sqlite3, mongoose, pg, sqlite3 OK |
| `npm run build` | ✅ ESM + CJS clean, postbuild clean |
| `npm run prepare-publish` | ✅ publish/ assembled; fix-esm.js rewrite verified |
| All 8 Docker builds | ✅ rebuilt after API prefix fix |
| Smoke tests — fastify-sqlite-react | ✅ POST / GET list / GET filter / GET random / GET by ID / DELETE |
| Smoke tests — fastify-sqlite-svelte | ✅ POST / GET list / GET filter / GET random / GET by ID / DELETE |
| Smoke tests — express-sqlite-react | ✅ POST / GET list / GET filter / GET random / GET by ID / DELETE |
| Smoke tests — express-sqlite-svelte | ✅ POST / GET list / GET filter / GET random / GET by ID / DELETE |

---

## Your checklist as the publishing agent

### 1. Clone / pull the branch

```bash
git clone <repo-url> zacatl
cd zacatl
git checkout dev
git pull origin dev   # if already cloned
```

### 2. Install and build

```bash
npm ci
npm run build
```

Expected: both `build-src-esm/` and `build-src-cjs/` populate cleanly.
No errors. `postbuild` runs `sync-local-exports` and `prune-barrels`.

### 3. Full verification suite

```bash
npm run type:check     # must be 0 errors
npm test               # must be 556/556 passed
npm run lint:silent    # must be 0 errors (console warnings are OK)
npm run check:peers    # all 4 peers must be importable
```

### 4. Verify publish package

```bash
npm run prepare-publish
node --input-type=module <<'EOF'
import { existsSync } from 'fs'
const check = p => { const ok = existsSync(p); console.log(ok ? '✅' : '❌', p); return ok }
let pass = true
pass &= check('publish/build/esm/service/index.js')
pass &= check('publish/build/esm/service/service.js')
pass &= check('publish/build/cjs/service/index.js')
pass &= check('publish/build/bin/fix-esm.js')
pass &= check('publish/build/bin/utils/measure-time.js')
const content = (await import('fs')).readFileSync('publish/build/bin/fix-esm.js','utf-8')
const importOk = content.includes("from './utils/")
console.log(importOk ? '✅' : '❌', 'fix-esm.js import rewrite (./utils/ not ../utils/)')
EOF
```

All lines must show ✅.

### 5. Dry-run publish

```bash
npm run publish:dry
```

This runs the full prepublish guard (tests + build + lint) then a
`--dry-run` npm publish. The tarball list should include:
- `build/esm/**`
- `build/cjs/**`
- `build/bin/fix-esm.js`
- `build/bin/utils/`
- `package.json`
- `README.md`
- `LICENSE`

### 6. Verify Docker images and screenshots

Run all 8 Docker builds and smoke test + Playwright screenshots:

```bash
# Build all 8
for EX in fastify-sqlite-react fastify-mongodb-react fastify-postgres-react \
           fastify-sqlite-svelte express-sqlite-react express-mongodb-react \
           express-postgres-react express-sqlite-svelte; do
  echo -n "Building $EX ... "
  docker build -f examples/Dockerfile --build-arg EXAMPLE=$EX \
    -t zacatl-example-$EX . 2>&1 | grep -E "DONE|ERROR" | tail -1
done

# Check sizes (expected 269–282 MB)
docker images --format "{{.Repository}}\t{{.Size}}" | grep zacatl-example | sort

# Start 4 SQLite containers
docker run -d --rm --name f-react  -p 8081:8081 zacatl-example-fastify-sqlite-react
docker run -d --rm --name f-svelte -p 8082:8081 zacatl-example-fastify-sqlite-svelte
docker run -d --rm --name e-react  -p 8181:8181 zacatl-example-express-sqlite-react
docker run -d --rm --name e-svelte -p 8182:8181 zacatl-example-express-sqlite-svelte
sleep 4

# All examples now use /api/greetings — same prefix across Fastify and Express
curl -sf -X POST http://localhost:8081/api/greetings \
  -H "Content-Type: application/json" -d '{"message":"hello","language":"en"}' && echo " ✅ fastify-react POST"
curl -sf http://localhost:8081/api/greetings | python3 -c "import sys,json; d=json.load(sys.stdin); print('✅ fastify-react GET', len(d), 'items')"

curl -sf -X POST http://localhost:8082/api/greetings \
  -H "Content-Type: application/json" -d '{"message":"hola","language":"es"}' && echo " ✅ fastify-svelte POST"
curl -sf http://localhost:8082/api/greetings | python3 -c "import sys,json; d=json.load(sys.stdin); print('✅ fastify-svelte GET', len(d), 'items')"

curl -sf -X POST http://localhost:8181/api/greetings \
  -H "Content-Type: application/json" -d '{"message":"bonjour","language":"fr"}' && echo " ✅ express-react POST"
curl -sf http://localhost:8181/api/greetings | python3 -c "import sys,json; d=json.load(sys.stdin); print('✅ express-react GET', len(d), 'items')"

curl -sf -X POST http://localhost:8182/api/greetings \
  -H "Content-Type: application/json" -d '{"message":"ciao","language":"it"}' && echo " ✅ express-svelte POST"
curl -sf http://localhost:8182/api/greetings | python3 -c "import sys,json; d=json.load(sys.stdin); print('✅ express-svelte GET', len(d), 'items')"

docker stop f-react f-svelte e-react e-svelte
```

**Take Playwright screenshots** (requires Docker and display):

```bash
npm run screenshots:examples:capture
```

This script builds each image, boots it, performs create + delete, and
saves 3 PNGs per example under `examples/screenshots/{name}/`. If
screenshots change, commit them before publishing.

**Expected screenshot appearance:**
- Gradient blue header: `ZACATL • FASTIFY • SQLITE` (or EXPRESS)
- "Greetings Dashboard" h1
- Three cards: Create greeting / Filter greetings / Random greeting
- Tailwind 4 font: Inter body, rounded cards with soft shadow
- All 8 examples should look **identical** except for the framework badge
  in the header

**Verify Tailwind is consistent across all 8:**

```bash
# React examples — all should match this @theme block
for EX in fastify-sqlite-react fastify-mongodb-react fastify-postgres-react \
           express-sqlite-react express-mongodb-react express-postgres-react; do
  echo "=== $EX ===" && head -15 examples/$EX/apps/frontend/src/styles.css
done

# Svelte examples — simpler @layer base only
for EX in fastify-sqlite-svelte express-sqlite-svelte; do
  echo "=== $EX ===" && cat examples/$EX/apps/frontend/src/styles.css
done
```

React `@theme` must have: `--font-display`, `--font-body`, `--font-sans`,
`--shadow-soft`, `--animate-fade-in-up`, `--animate-pulse-gentle`.
No `--font-family-*` anywhere (Tailwind 4 breaking change).

### 7. Bump version

```bash
npm version patch   # 0.0.56 → 0.0.57
```

This updates `package.json`. Commit the bump:

```bash
git add package.json
git commit -m "Bump version to 0.0.57"
```

### 8. Push dev and open PR

```bash
git push origin dev
# Open PR: dev → main on GitHub
# PR title: "Release 0.0.57 — barrel removal, Tailwind 4, publish pipeline fix"
# Merge PR (squash or merge commit, both are fine)
```

### 9. Publish from main

```bash
git checkout main
git pull origin main
npm run publish:otp    # prompts for npm OTP
# or: npm run publish:latest  # if no OTP required
```

The `publish:otp` script runs full prepublish guard (tests + build + lint)
then assembles `publish/` and publishes `./publish` with `--access public`.

### 10. Clean up Docker images

```bash
docker rmi $(docker images --format "{{.Repository}}:{{.Tag}}" | grep zacatl-example) 2>/dev/null
```

---

## Key facts for the reviewing agent

### API routes — uniform `/api` prefix across all 8 examples

All backends register routes under `/api` via `server.prefixes: { api: '/api' }`.
All frontends fetch `/api/greetings`. All Vite dev proxies match `'^/api'`.

| Example | Backend port | API prefix | Example route |
|---|---|---|---|
| fastify-sqlite-react | 8081 | `/api` | `GET /api/greetings` |
| fastify-sqlite-svelte | 8081 | `/api` | `GET /api/greetings` |
| fastify-mongodb-react | 8082 | `/api` | `GET /api/greetings` |
| fastify-postgres-react | 8083 | `/api` | `GET /api/greetings` |
| express-sqlite-react | 8181 | `/api` | `GET /api/greetings` |
| express-sqlite-svelte | 8181 | `/api` | `GET /api/greetings` |
| express-mongodb-react | 8182 | `/api` | `GET /api/greetings` |
| express-postgres-react | 8183 | `/api` | `GET /api/greetings` |

**How the prefix is wired** — in each `config.ts`:
```typescript
export const API_PREFIX = '/api';

server: {
  vendor: ServerVendor.FASTIFY, // or EXPRESS
  instance: fastify,            // or app
  prefixes: { api: API_PREFIX },  // ← registers all routes under /api
},
page: {
  staticDir: join(rootDir, 'apps/frontend/dist'),
  // page.prefixes omitted — PageServer defaults to { api: '/api' }
  // so SPA fallback already excludes /api/* correctly
},
```

Dev Vite proxy (all 8 frontends):
```typescript
proxy: { '^/api': { target: 'http://localhost:<port>', changeOrigin: true } }
```

### Tailwind 4 differences between React and Svelte examples

**React** (6 examples) — rich `@theme {}` block with font, shadow, animation
tokens because the React UI uses `font-body`, `font-display`, `shadow-soft`,
and `animate-fade-in-up` utility classes in JSX.

**Svelte** (2 examples) — minimal `@layer base` only, no custom `@theme`
tokens, because the Svelte template uses standard Tailwind utilities only.

This is **correct and intentional** — not a bug or inconsistency.

### Examples are intentionally simple PoC starters

Every example implements the same domain: **greetings CRUD**
(message + language → id + createdAt). This is deliberate — the examples
are meant as copy-paste scaffolds for new server PoCs, not showcase apps.

Backend structure (same across all 8):
```
apps/backend/src/
├── application/route-handlers/greetings/
│   ├── create/handler.ts
│   ├── delete/handler.ts
│   ├── get-all/handler.ts
│   ├── get-by-id/handler.ts
│   └── get-random/handler.ts
├── domain/greetings/service/
├── infrastructure/greetings/{models,repositories}/
└── config.ts   ← wires everything into zacatl Service
```

Frontend (React or Svelte) has one page with 3 panels:
- Create greeting (POST)
- Filter by language (GET with query param)
- Get random greeting (GET /random/:lang)
- List with Delete buttons

### Docker image sizes (verified 2026-07-10)

```
fastify-sqlite-react    282 MB
fastify-sqlite-svelte   280 MB
fastify-mongodb-react   278 MB
fastify-postgres-react  269 MB
express-sqlite-react    282 MB
express-sqlite-svelte   280 MB
express-mongodb-react   278 MB
express-postgres-react  269 MB
```

All use `node:26-alpine` builder + runtime. ORM drivers in
`optionalDependencies` so root `npm prune --omit=dev` is safe.
Non-root user (`node`, uid 1000) for runtime security.

### Parked items — nothing blocks publish

| ID | Reason parked |
|---|---|
| FEAT-001 | RequestContextHook — consuming services handle context via JWT middleware already |
| DEVX-001 | Devcontainer — not blocking; no contributor has requested it |
| ESLINT-010 | ESLint 10 blocked by `eslint-plugin-import` peer declaring `eslint: '^2...^9'` only |

### Version lock constraints

```
typescript      ^6.0.3    # TS 7 breaks @typescript-eslint/parser@8.x peer
eslint          ^9.x      # ESLint 10 blocked by eslint-plugin-import
tailwindcss     ^4.x      # already migrated; do NOT downgrade
```

Do not upgrade `typescript` or `eslint` in the same release.

---

## File layout reference (post REFACTOR-001)

```
src/                            # Source (ESM TypeScript)
├── configuration.ts            # Facade for src/configuration/
├── dependency-injection.ts     # Facade for src/dependency-injection/
├── error.ts                    # Facade for src/error/
├── localization.ts             # Facade for src/localization/
├── logs.ts                     # Facade for src/logs/
├── third-party.ts              # Facade for src/third-party/
├── utils.ts                    # Facade for src/utils/
└── service/
    ├── index.ts                # Thin re-export of service.ts (package entry)
    └── service.ts              # Main Service class + public re-exports

scripts/publish/
├── prepare-publish.ts          # Assembles publish/ directory
├── export-policy.ts            # Governs which build artifacts get exported
├── prune-barrels.ts            # Removes nested index.* from build output
└── prepublish-guard.ts         # Blocks publish on wrong branch/version

publish/                        # Generated — what npm sees
├── build/esm/                  # ESM output (→ build-src-esm/)
├── build/cjs/                  # CJS output (→ build-src-cjs/)
├── build/bin/fix-esm.js        # CLI binary (imports rewritten to ./utils/)
├── build/bin/utils/            # measure-time.js etc.
├── package.json                # Rewritten for publish (no devDeps)
├── README.md
└── LICENSE
```

---

## If something fails

**Build fails:** Run `npm run clean:build && npm run build` to get a
clean build before retrying.

**Type errors after pull:** The barrel removal changed many import paths;
if you merged other branches into dev, check for `Cannot find module`
errors and update to direct subpath imports.

**Publish fails with prepublish-guard:** The guard checks you are on
`main` and the version matches. Switch to main, pull, and retry.

**Docker build fails:** Run from repo root (not from inside examples/):
`docker build -f examples/Dockerfile --build-arg EXAMPLE=<name> .`

**Smoke test returns 404 on `/api/greetings`:** All examples now use
`server.prefixes: { api: '/api' }`. If a container returns 404, the image
is stale — rebuild with the command in Step 5.

**Smoke test returns HTML instead of JSON:** Wrong port or wrong path.
All examples serve at `/api/greetings`; check the port table in Step 6.

**Screenshots look wrong (wrong font, no gradient):** Tailwind 4 `@theme`
must use `--font-*` not `--font-family-*`. Check
`apps/frontend/src/styles.css` for any `--font-family-` prefix and rename.

**`fix-esm.js` has `../utils/` in it after prepare-publish:** The import
rewrite in `prepare-publish.ts` failed. Regex must be
`/from\s+['"]\.\.\/utils\//g` — check line ~101.

---

*Updated 2026-07-10 · branch dev · 10 commits unpushed · all checks green*
*All 8 Docker images rebuilt · 4 SQLite containers full-CRUD smoke tested*
