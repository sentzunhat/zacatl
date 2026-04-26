# Audit & Publish — @sentzunhat/zacatl 0.0.57

Self-contained instruction set for a digital agent on the publishing machine.
Run every step in order. Do not skip to publish until all audit gates pass.

**Package:** `@sentzunhat/zacatl`  
**Current version:** `0.0.56` → publish as `0.0.57`  
**Branch to audit:** `dev`  
**Merge target:** `main`

---

## Prerequisites

```bash
node --version    # 26+
npm --version     # 10+
docker --version  # any recent
git --version
npm whoami        # must show the @sentzunhat org account
```

---

## Step 1 — Get the branch

```bash
git clone <repo-url> zacatl
cd zacatl
git checkout dev
git pull origin dev
git log --oneline -12    # confirm these commits are present (most recent first):
```

Expected commits (order may vary slightly):

```
ebcc716 Update handoff and backlog for 0.0.57 release readiness
33206e1 Docs: update examples README and add frontend/backend gotchas reference
742fe29 Remove redundant page.prefixes from all backend configs
ef49ffa Tighten Vite dev proxy to ^/api in all 7 example frontends
77ef102 Update frontend fetch paths to /api/greetings in 6 examples
c3f5b20 Fix API_PREFIX in all 6 example backend configs
4b0c6fc Add publish handoff document for 0.0.57 release
dc2739f Fix docs drift: correct stale barrel import paths and folder tree
4d07948 Remove active plan stubs for parked items (FEAT-001, DEVX-001)
ec017c0 Untangle publish scripts, fix Tailwind 4 migration, clean up stale docs
```

```bash
npm ci
```

---

## Step 2 — Code audit: what changed

### 2a. API prefix — all 8 examples unified

Every backend now serves at `/api`. Verify the constant and `server.prefixes`:

```bash
grep -r "API_PREFIX\|server.prefixes\|prefixes:" examples/*/apps/backend/src/config.ts \
  | grep -v "page\|//\|import"
```

Expected: every example shows `API_PREFIX = '/api'` and
`prefixes: { api: API_PREFIX }` on the `server:` block.
No `page.prefixes` entries — the framework defaults to `{ api: '/api' }`.

Verify frontends fetch `/api/greetings`:

```bash
grep -r "greetings" examples/*/apps/frontend/src/app.tsx \
                    examples/*/apps/frontend/src/App.svelte \
                    examples/*/apps/frontend/src/api.ts \
  2>/dev/null | grep "request\|fetch" | grep -v "//\|import"
```

Expected: every line contains `/api/greetings` — no bare `/greetings`.

Verify Vite proxies:

```bash
grep -r "proxy" examples/*/apps/frontend/vite.config.ts -A2 | grep "'\^\|\"^\""
```

Expected: every proxy key is `'^/api'`. No `(api|greetings)` alternation.

### 2b. Tailwind 4 migration — all 8 frontends

```bash
grep -r "tailwind\|postcss\|@theme\|font-family" \
  examples/*/apps/frontend/src/styles.css \
  examples/*/apps/frontend/package.json \
  2>/dev/null | grep -v "//\|node_modules"
```

Expected:
- `@import "tailwindcss"` in every `styles.css`
- `@tailwindcss/vite` in every `package.json` devDeps
- No `tailwindcss/base` or `tailwindcss/components` references
- No `--font-family-*` tokens (must be `--font-*`)
- No `postcss.config.cjs` entries (deleted)
- No `tailwind.config.ts` entries (deleted)

### 2c. React @theme block — all 6 React frontends identical

```bash
for EX in fastify-sqlite-react fastify-mongodb-react fastify-postgres-react \
           express-sqlite-react express-mongodb-react express-postgres-react; do
  echo "=== $EX ===" && sed -n '/@theme/,/^}/p' \
    examples/$EX/apps/frontend/src/styles.css | head -10
done
```

Expected tokens in every React `@theme` block:
`--font-display`, `--font-body`, `--font-sans`, `--shadow-soft`,
`--animate-fade-in-up`, `--animate-pulse-gentle`.

Svelte examples have no `@theme` block — that is correct.

### 2d. Barrel removal — no nested index.ts in src/

```bash
find src -name "index.ts" | sort
```

Expected exactly two files:
```
src/service/index.ts     ← thin re-export of service.ts; required as package entry
src/third-party/index.ts ← if present, also intentional
```

Any other `index.ts` under `src/` is a regression.

### 2e. Publish pipeline

```bash
grep -n "from.*utils" scripts/publish/prepare-publish.ts | head -5
# Must show: /from\s+['"]\.\.\/utils\//g  (not just index.js)

# Confirm dead allowlist is gone
grep "nestedIndexAllowlist" scripts/publish/export-policy.ts
# Must return nothing
```

### 2f. README — endpoint spec matches /api

```bash
grep "/greetings" examples/README.md | grep -v "/api/greetings\|#\|docs\|random\|changelog"
```

Expected: no results. All endpoint references must include `/api/`.

### 2g. New docs exist

```bash
ls docs/examples/frontend-backend-gotchas.md   # must exist
grep "server.prefixes" docs/examples/frontend-backend-gotchas.md | head -2
```

---

## Step 3 — Full verification suite

All 4 commands must exit 0. Fix before proceeding.

```bash
npm run type:check
# Expected: failures: 0 / 3

npm test
# Expected: Tests 556 passed (556)

npm run lint:silent
# Expected: failures: 0 / 3  (console warnings are OK, errors are not)

npm run check:peers
# Expected: OK for better-sqlite3, mongoose, pg, sqlite3
```

---

## Step 4 — Build and inspect publish package

```bash
npm run build
# Expected: postbuild runs sync-local-exports + prune-barrels cleanly

npm run prepare-publish
# Expected: "Wrote .../publish/package.json"
```

Verify publish contents:

```bash
node --input-type=module <<'EOF'
import { existsSync, readFileSync } from 'fs'
const ok = p => { const e = existsSync(p); console.log(e ? '✅' : '❌', p); return e }
ok('publish/build/esm/service/index.js')
ok('publish/build/esm/service/service.js')
ok('publish/build/cjs/service/index.js')
ok('publish/build/bin/fix-esm.js')
ok('publish/build/bin/utils/measure-time.js')
const content = readFileSync('publish/build/bin/fix-esm.js','utf-8')
const good = content.includes("from './utils/") && !content.includes("from '../utils/")
console.log(good ? '✅' : '❌', "fix-esm.js import rewrite (./utils/ not ../utils/)")
const pkg = JSON.parse(readFileSync('publish/package.json','utf-8'))
const hasEsm = Object.values(pkg.exports ?? {}).some(e => JSON.stringify(e).includes('esm'))
const hasCjs = Object.values(pkg.exports ?? {}).some(e => JSON.stringify(e).includes('cjs'))
console.log(hasEsm ? '✅' : '❌', 'exports map has esm entries')
console.log(hasCjs ? '✅' : '❌', 'exports map has cjs entries')
console.log('version in publish/package.json:', pkg.version)
EOF
```

All lines must show ✅. The version will still show `0.0.56` here — that is expected; you bump it in Step 6.

---

## Step 5 — Docker build: all 8 images

Run from **repo root**:

```bash
for EX in fastify-sqlite-react fastify-mongodb-react fastify-postgres-react \
           fastify-sqlite-svelte express-sqlite-react express-mongodb-react \
           express-postgres-react express-sqlite-svelte; do
  echo -n "Building $EX ... "
  docker build -f examples/Dockerfile --build-arg EXAMPLE=$EX \
    -t zacatl-$EX . 2>&1 | tail -1
done
```

Expected: all 8 lines end with `DONE 0.0s`.

Check sizes:

```bash
docker images --format "{{.Repository}}\t{{.Size}}" | grep "^zacatl-" | sort
```

Expected (±5 MB):

```
zacatl-fastify-sqlite-react    ~282 MB
zacatl-fastify-sqlite-svelte   ~280 MB
zacatl-fastify-mongodb-react   ~278 MB
zacatl-fastify-postgres-react  ~269 MB
zacatl-express-sqlite-react    ~282 MB
zacatl-express-sqlite-svelte   ~280 MB
zacatl-express-mongodb-react   ~278 MB
zacatl-express-postgres-react  ~269 MB
```

---

## Step 6 — Smoke test: full CRUD on all 4 SQLite containers

SQLite examples run without an external database — test them first.

```bash
docker run -d --rm --name t-f-react  -p 8081:8081 zacatl-fastify-sqlite-react
docker run -d --rm --name t-f-svelte -p 8082:8081 zacatl-fastify-sqlite-svelte
docker run -d --rm --name t-e-react  -p 8181:8181 zacatl-express-sqlite-react
docker run -d --rm --name t-e-svelte -p 8182:8181 zacatl-express-sqlite-svelte
sleep 4
```

Run the full CRUD loop on each:

```bash
for NAME_PORT in "fastify-react:8081" "fastify-svelte:8082" "express-react:8181" "express-svelte:8182"; do
  NAME=${NAME_PORT%%:*}; PORT=${NAME_PORT##*:}
  echo "=== $NAME ==="
  CREATED=$(curl -sf -X POST http://localhost:$PORT/api/greetings \
    -H "Content-Type: application/json" -d '{"message":"audit test","language":"en"}')
  echo "  POST  → $CREATED"
  ID=$(echo "$CREATED" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
  LIST=$(curl -sf http://localhost:$PORT/api/greetings)
  echo "  GET   → $(echo $LIST | python3 -c "import sys,json; print(len(json.load(sys.stdin)),'items')")"
  FILT=$(curl -sf "http://localhost:$PORT/api/greetings?language=en")
  echo "  FILT  → $(echo $FILT | python3 -c "import sys,json; print(len(json.load(sys.stdin)),'items (lang=en)')")"
  RND=$(curl -sf "http://localhost:$PORT/api/greetings/random/en")
  echo "  RND   → $RND"
  BYID=$(curl -sf "http://localhost:$PORT/api/greetings/$ID")
  echo "  BYID  → $BYID"
  curl -sf -X DELETE "http://localhost:$PORT/api/greetings/$ID" > /dev/null
  AFTER=$(curl -sf http://localhost:$PORT/api/greetings | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")
  echo "  DEL   → list now $AFTER items"
  echo "  ✅ $NAME ok"
done
```

Expected: every example completes POST → GET → filter → random → GET-by-id → DELETE with matching JSON and 0 items at the end.

```bash
docker stop t-f-react t-f-svelte t-e-react t-e-svelte
```

---

## Step 7 — Screenshots

Regenerate Playwright screenshots so they reflect the current Tailwind 4 UI:

```bash
npm run screenshots:examples:capture
# Requires Docker and a display (headless Chrome is embedded in the script)
# Saves: examples/screenshots/{name}/01-initial.png
#        examples/screenshots/{name}/02-after-create.png
#        examples/screenshots/{name}/03-after-delete.png
```

**Visually verify each screenshot:**
- Header: gradient blue, correct framework/DB badge (`ZACATL • FASTIFY • SQLITE` etc.)
- `Greetings Dashboard` h1
- Three cards: Create greeting, Filter greetings, Random greeting
- React examples: Inter body font, soft card shadow, animated fade-in
- Svelte examples: plain Tailwind styling, no custom font tokens
- No broken layout, missing fonts, or grey placeholder boxes

If screenshots changed, stage and commit them before publishing:

```bash
git add examples/screenshots/
git commit -m "Regenerate example screenshots after Tailwind 4 and API prefix updates

Co-Authored-By: <your-name>"
```

---

## Step 8 — Changelog and version bump

The prepublish guard checks that `docs/changelog.md` top entry matches
`package.json` version — so update both atomically.

Add a new entry at the top of `docs/changelog.md`:

```markdown
## [0.0.57] - YYYY-MM-DD

### Changed
- Unified API prefix across all 8 examples — routes now served at `/api/greetings`
  on both Fastify and Express via `server.prefixes: { api: '/api' }`
- Migrated all 8 example frontends from Tailwind CSS 3 to Tailwind CSS 4
  (`@import "tailwindcss"`, `@theme {}` block, `@tailwindcss/vite` plugin)

### Fixed
- `prepare-publish.ts`: fixed `fix-esm.js` import rewrite (was only rewriting
  `../utils/index.js`; now rewrites all `../utils/*` paths including `measure-time.js`)
- Removed dead `nestedIndexAllowlist` in `export-policy.ts`

### Refactored
- Removed all nested `index.ts` barrel files from `src/`; modules now export
  via sibling facade files (`src/error.ts` etc.)

### Docs
- Updated architecture, framework-overview, handler-best-practices, code-style,
  rest-handlers, project-context to reflect no-barrel policy
- Added `docs/examples/frontend-backend-gotchas.md`
- Updated `examples/README.md` endpoint spec to `/api/greetings`
```

Then bump the version:

```bash
npm version patch --no-git-tag-version
# package.json version → 0.0.57
```

Verify alignment:

```bash
node -e "
const p = JSON.parse(require('fs').readFileSync('package.json','utf-8'))
const cl = require('fs').readFileSync('docs/changelog.md','utf-8')
const top = cl.match(/## \[(\d+\.\d+\.\d+)\]/)?.[1]
console.log('package.json:', p.version)
console.log('changelog top:', top)
console.log(p.version === top ? '✅ aligned' : '❌ MISMATCH')
"
```

Commit:

```bash
git add package.json docs/changelog.md
git commit -m "Bump version to 0.0.57

Co-Authored-By: <your-name>"
```

---

## Step 9 — Dry run

```bash
npm run publish:dry
```

This runs the full prepublish guard (tests + lint + type-check + version
alignment + npm registry check) then does a `--dry-run` publish from
`./publish`.

Confirm the tarball listing includes:
- `build/esm/**`
- `build/cjs/**`
- `build/bin/fix-esm.js`
- `build/bin/utils/measure-time.js`
- `package.json`
- `README.md`
- `LICENSE`

No `src/`, no `test/`, no `examples/`, no `node_modules/`.

---

## Step 10 — Merge dev → main and publish

```bash
git push origin dev

# Open PR on GitHub: dev → main
# Title: "Release 0.0.57 — barrel removal, Tailwind 4, API prefix unification"
# Merge (squash or merge commit — both fine)

git checkout main
git pull origin main

npm run publish:otp
# Runs prepublish guard, assembles publish/, publishes ./publish to npm
# You will be prompted for npm OTP

# Verify on npm
npm view @sentzunhat/zacatl version
# Must show 0.0.57
```

---

## Step 11 — Clean up

```bash
# Remove local Docker images
docker rmi $(docker images --format "{{.Repository}}:{{.Tag}}" | grep "^zacatl-") 2>/dev/null

# Tag the release commit
git tag v0.0.57
git push origin v0.0.57
```

---

## Audit gate summary

Before running Step 10, all of the following must be true:

| Gate | Verified by |
|---|---|
| `server.prefixes: { api: '/api' }` present in all 8 backends | Step 2a grep |
| All frontends fetch `/api/greetings` | Step 2a grep |
| All Vite proxies use `'^/api'` | Step 2a grep |
| No `--font-family-*` tokens in any `@theme` | Step 2b grep |
| No nested `index.ts` in `src/` except `service/` | Step 2d find |
| Import rewrite regex covers all `../utils/*` | Step 2e grep |
| `examples/README.md` uses `/api/greetings` | Step 2f grep |
| 556 / 556 tests pass | Step 3 |
| 0 lint errors | Step 3 |
| 0 type errors | Step 3 |
| All 4 peers importable | Step 3 |
| `publish/build/bin/fix-esm.js` uses `./utils/` not `../utils/` | Step 4 node script |
| All 8 Docker images build | Step 5 |
| All 4 SQLite containers pass full CRUD (POST/GET/filter/random/byid/DELETE) | Step 6 |
| Screenshots regenerated and visually correct | Step 7 |
| `package.json` version = `docs/changelog.md` top entry = `0.0.57` | Step 8 |
| Dry run completes cleanly | Step 9 |

---

## Version lock — do not upgrade these in this release

```
typescript    ^6.0.3   # TS 7 breaks @typescript-eslint/parser@8.x
eslint        ^9.x     # ESLint 10 blocked by eslint-plugin-import peer
tailwindcss   ^4.x     # already migrated; do not downgrade
```

---

## Parked — nothing blocks publish

| ID | Title | Reason |
|---|---|---|
| DEVX-001 | Devcontainer config | No contributor has requested it |
| FEAT-001 | RequestContextHook | Consuming services use JWT middleware |
| ESLINT-010 | ESLint 10 upgrade | `eslint-plugin-import` peer only covers `eslint: '^2...^9'` |

---

## Reference docs written in this sprint

| Doc | Purpose |
|---|---|
| `docs/examples/frontend-backend-gotchas.md` | API prefix wiring, React vs Svelte CSS, port table, DELETE gotcha, common mistakes |
| `examples/README.md` — Endpoint Specification | Updated to `/api/greetings` |
| `docs/guidelines/architecture.md` | Barrel-free folder tree, facade pattern |
| `docs/guidelines/framework-overview.md` | No-barrel guidance removed |
| `docs/service/handler-best-practices.md` | Correct subpath import examples |
| `docs/service/rest-handlers.md` | Fixed import paths and folder tree |

---

*Prepared 2026-07-10 · dev branch · all local checks green · ready for final audit and publish*
