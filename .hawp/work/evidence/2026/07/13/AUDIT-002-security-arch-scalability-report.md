# zacatl Framework — Final Audit Report

**Date:** 2026-07-13 · **Scope:** 7 dimensions (crypto/exec, web surface, SQL/ORM, layering, scalability, supply chain, Docker runtime), each adversarially verified.

---

## 1. Executive summary

zacatl's core data-access code is injection-safe where it builds SQL itself (node:sqlite identifier gating + bound parameters, Sequelize ORM parameterization both verified safe), `npm audit` is clean across 777 packages, and the distroless Node 26 / Debian 13 migration has **already landed correctly** in the working tree — four of the five Docker findings were stale against the new Dockerfile. The real exposure is architectural: ORM instances are keyed by vendor (two same-vendor databases silently collide, high), the documented node:sqlite flow throws at Service construction before `connect()` ever runs (high), and every `findMany` across all three adapters is unbounded — the node:sqlite variant materializes the entire table in memory per call on the event-loop thread (high). Secondary themes are error-swallowing (Mongoose blanket catches, fire-and-forget init) and a phantom native-dependency surface (better-sqlite3/sqlite3 declared and native-compiled but never used). **Single most important action:** fix the P0 data-layer trio — vendor-keyed ORM collision, the broken sqlite lazy-init ordering, and bounded/pushed-down `findMany` — since all three sit on the framework's primary persistence path.

---

## 2. Confirmed findings, ranked by severity

**Rejected / false-positives (checked, dropped):** command-runner permissive defaults (fixed in working tree — now fails closed without an allowlist); http-proxy-middleware "ahead of latest" (4.2.0 *is* the `latest` dist-tag); and four Docker findings (musl/glibc ABI, npm/shell in runtime, shell-form CMD, `USER node`/chown) — all stale, already fixed by the distroless migration in commit 41d9a5f4 + working tree.

### Security

| Sev | Finding | Location | Impact | Fix |
|---|---|---|---|---|
| MED | JSONC comment-strip regex corrupts strings | `src/configuration/json.ts:11-15` | Config values containing `//` (any URL) break startup; `/* */` inside strings is **silently altered** and parses successfully | Use `jsonc-parser` or a string-literal-aware tokenizer |
| MED | Mongoose `findMany` forwards raw filter — NoSQL operator/`$where` injection | `orm/mongoose/adapter.ts:91-95` | Untrusted filter objects reach the driver unsanitized (`{$ne:null}` auth-bypass, `$where` JS eval) | Enable `sanitizeFilter` in the adapter; reject top-level `$` keys |
| LOW | No `verifyHmac` timing-safe comparison helper | `src/utils/hmac.ts:32-43` | Consumers naturally use `===`, enabling timing side-channel on signature checks | Ship `verifyHmac` using `crypto.timingSafeEqual` |
| LOW | `md5`/`sha1` first-class HMAC options | `src/utils/hmac.ts:3` | Normalizes non-compliant weak configurations | Restrict union to sha256/384/512 |
| LOW | `CustomError.toJSON()` emits stacks + internal metadata | `src/error/custom.ts:91-146` | Any user code that `reply.send(err)` leaks stack traces/paths (default framework handler is safe) | Add `toClientJSON()`; strip `stack`/`metadata` from `toJSON` or gate on env |
| LOW | Mongoose `update` forwards operator keys | `orm/mongoose/adapter.ts:119-124` | Untrusted payload can `$unset`/`$rename` fields | Wrap as `{ $set: update }` in the adapter |
| LOW | No security headers / CORS / rate-limit layer | `api/api-server.ts:39-53` | Services are insecure-by-default (no HSTS/CSP/rate limit); users must hand-roll | Register helmet-equivalent by default; expose opt-in CORS/rate-limit config |
| LOW | Host hardcoded to `0.0.0.0`, not configurable | `fastify/api-adapter.ts:54`, `express/api-adapter.ts:125` | Cannot bind loopback-only; overrides Fastify's safer default | Add optional `host` to `HttpServerConfig`/`listen()` |
| LOW | Express proxy `pathRewrite` regex built from unescaped prefix | `express/api-adapter.ts:114-118` | Config metacharacters broaden matching / pathological regex (config-driven only) | Regex-escape the prefix |
| LOW | Fastify SPA fallback passes raw undecoded URL to `sendFile` | `fastify/page-adapter.ts:22-32` | Query string becomes part of filename (`app.js?v=1` 404s); traversal guard rests entirely on @fastify/static | Parse pathname, drop query, reject `..` explicitly |

### Architecture

| Sev | Finding | Location | Impact | Fix |
|---|---|---|---|---|
| **HIGH** | ORM instances keyed by vendor only — same-vendor DBs collide | `database/orm-instance.ts:42-55`, `database-server.ts:43` | Second Sequelize/Mongo DB silently overwrites the first; connection leaked on `disconnect()` | Key instances/adapters by per-database name, not vendor enum |
| **HIGH** | Eager repo resolution breaks the documented lazy-SQLite path | `service.ts:43-51`, `infrastructure.ts:40` | node:sqlite repos throw at Service construction, before `connect()` can register the instance | Resolve ORM model lazily on first query, or open SQLite before Layers construction |
| MED | Global tsyringe container — Service non-reentrant | `dependency-injection/container.ts:3,61-79` | Two Services per process share/overwrite registrations; `clearContainer()` is global | Per-Service child container (`createChildContainer()`), or document single-Service constraint |
| MED | Adapters service-locate DB instance in constructors | `nodesqlite/adapter.ts:30,37` (+ mongoose:44, sequelize:43) | Hidden temporal coupling on global registration order; untestable without global container mutation | Constructor-inject the resolved instance |
| MED | `void this.initialize().catch(console.error)` in all adapter ctors | `mongoose/adapter.ts:27` (+ sequelize:26, nodesqlite:32) | Index/table creation failures swallowed; queries race index builds; no readiness signal | Expose awaitable `ready()`; await in `start()` and fail fast |
| MED | Mongoose blanket `catch { return null/false }` | `mongoose/adapter.ts:85,127,141,148` | Connection loss/timeouts indistinguishable from "not found" — masks outages, defeats retries/circuit-breakers | Narrow catch to CastError; rethrow the rest |
| MED | Inconsistent `isRegistered` guard across layers | `domain.ts:24,33`, `infrastructure.ts:37` vs `application.ts:39,47` | `@singleton()` classes get clobbered in Domain/Infrastructure but not Application | Apply the guard uniformly |
| LOW | HTTP vendors hardcoded in `Server` (no factory seam) | `server.ts:1-15,61-88` | Both Express and Fastify pulled into module graph; new providers require core edits | Extract a server-adapter factory mirroring `database/adapters/factory.ts` |
| LOW | Five passthrough getters leak internals | `server.ts:124-155` | Consumers can bypass port boundaries | Minimize to narrow port interfaces |
| LOW | Duplicated error paths in `resolveDependencies` | `container.ts:115-127` | Two diverging error shapes for one failure mode; untested branch | Consolidate; add constructor-throw test |

### Scalability

| Sev | Finding | Location | Impact | Fix |
|---|---|---|---|---|
| **HIGH** | node:sqlite `findMany`: full-table `SELECT`, no WHERE/LIMIT, JS-side filter | `nodesqlite/adapter.ts:137-159` | O(table) memory + synchronous event-loop-blocking scan per call — OOM/latency blowup at scale; JSON blob column means no index can ever help | Push filters into parameterized WHERE; mandatory default LIMIT |
| MED | Prepared statements re-created per query | `nodesqlite/adapter.ts:113,137,176,211,240,258` | SQL re-parsed/compiled on every CRUD call despite the docstring's claim | Cache `StatementSync` handles per statement shape |
| MED | Synchronous node:sqlite blocks the event loop | same file | Every query freezes all concurrent requests for its duration (acceptable for indexed point reads; fatal combined with the full scan above) | Keep sync work bounded; worker pool for heavy workloads |
| MED | Mongoose/Sequelize `findMany` unbounded | `mongoose/adapter.ts:91-100`, `sequelize/adapter.ts:68-72` | Broad filter buffers entire collection into heap; zero pagination surface exists in the infra layer | Add default max limit + cursor/offset pagination |
| LOW | Sync `readFileSync` config/locale loaders, no async variants | `json.ts:9`, `yml.ts:11`, `localization/node/helpers.ts:51` | Event-loop stall if ever used per-request (bootstrap-only in repo today) | Add `fs.promises` variants; document sync as bootstrap-only |

### Dependencies & supply chain

| Sev | Finding | Location | Impact | Fix |
|---|---|---|---|---|
| MED | better-sqlite3 phantom dep: peer+optional+types+allowScripts, zero imports | `package.json:177,183,189-191,1035` | Consumers native-compile (with install scripts enabled) code that is never executed | Remove all five references |
| MED | No digest pinning on base images; `mongo:latest` in compose | `examples/Dockerfile:30,60,108`; mongodb compose files | Non-reproducible builds; tag mutation / silent major jumps | Pin every `FROM` and compose image `@sha256:`; Renovate for bumps |
| LOW | Live npm publish token in plaintext `~/.npmrc`; `.npmrc` not gitignored | `~/.npmrc`, `.gitignore` | Future project-level `.npmrc` could leak publish rights to @sentzunhat/zacatl | Rotate token; add `.npmrc` to `.gitignore`; CI-injected `NODE_AUTH_TOKEN` |
| LOW | sqlite3 declared+native-compiled solely to back a re-export barrel | `package.json:180,186,1039`; `src/third-party/databases/sqlite3.ts` | Same phantom native-build surface as better-sqlite3 | Drop the re-export and manifest entries |
| LOW | DB drivers in both optionalDependencies AND peerDependencies, mismatched ranges | `package.json:176-204` | optional auto-install defeats peer opt-in; ambiguous constraints | Optional peers only (`peerDependenciesMeta`); align ranges |
| LOW | Inert `peerDependenciesMeta.sequelize` while sequelize is a hard dep | `package.json:171,198-200` | Heavy ORM force-installed on all consumers; manifest contradicts intent | Decide core vs optional; fix manifest |
| LOW | `engines: node >=26` unenforced, and 26 is pre-LTS | `package.json:12-15` | Older Node fails at runtime (`node:sqlite`) rather than install | `engine-strict=true` in committed `.npmrc`; reconsider LTS floor |
| LOW | i18n `^0.15.3` pre-1.0 hard runtime dep | `package.json:166` | 0.x semver + slow cadence in the localization path | Pin exact; consider optional peer |
| LOW | Pinned majors exceed publicly-known latest (js-yaml 5.x, uuid 14.x, …) | `package.json:159-181` | Dependency-confusion smell if built against a different registry (mitigated by lockfile integrity hashes) | Cross-check against canonical registry before publish; `npm ci` in CI |
| LOW | Compose healthcheck: bare `node`, no fetch timeout, no status check | `examples/*/docker-compose.yml` | HTTP 500 counts as healthy; implicit PATH dependency | See hardened healthcheck in §3 |
| LOW | Stale `.dockerignore` un-ignores (`backend/dist` — layout is now `apps/backend/`) | `.dockerignore:14-19` | Dead rules; broad `!build/**` widens context | Prune to actual builder inputs |
| LOW | SQLite compose: DB writes to WORKDIR while `./data:/app/data` volume goes unused | `examples/fastify-sqlite-react/docker-compose.yml:19-21` | Data lost on container recreation | `DATABASE_URL=sqlite:/app/data/database.sqlite`, volume writable by uid 65532 |

**Positive verified-safe results:** node:sqlite identifier gating (`/^[A-Za-z_][A-Za-z0-9_]*$/` at every interpolation site) + fully bound values; Sequelize ORM-parameterized queries with no hand-built SQL; clean `npm audit` (0/777).

---

## 3. Distroless Node 26 / Debian 13 migration

**Status: substantially complete.** Commit `41d9a5f4` plus working-tree edits already implement the correct design. Remaining gaps: digest pinning, in-image HEALTHCHECK, and the SQLite volume/DB-path mismatch.

**Resolved facts (assumptions stated):**

- **(a) Image availability — CONFIRMED, no fallback needed.** `gcr.io/distroless/nodejs26-debian13` exists (verified 2026-07-12 against the upstream GoogleContainerTools/distroless nodejs README, which lists nodejs22/24/26-debian13 with `latest`, `nonroot`, `debug`, `debug-nonroot` tags; debian13/trixie is the current default base). *Assumption: that upstream listing is current.* Fallback, only if a future Node major ever lacks a tag: `gcr.io/distroless/cc-debian13` + node binary copied from `node:<major>-trixie`.
- **(b) musl vs glibc.** node-gyp compiles native addons (sqlite3 is genuinely loaded at runtime — `dialectModule: sqlite3` in the sqlite examples' backends) against the builder's libc. A musl-linked `.node` from an alpine builder fails to `dlopen` in the glibc distroless runtime (`symbol not found` / missing `libc.musl-x86_64.so.1`). The builder **must** be Debian glibc — and the *same Debian release* (trixie/13) as the runtime to avoid glibc symbol-version skew. The repo correctly uses `node:26-trixie-slim` with `apt-get python3 make g++`.
- **(c) nonroot + SQLite write path.** Distroless has no `node` user, no shell, no `RUN`. Use the `:nonroot` tag (uid/gid **65532**), `--chown=65532:65532` on every final-stage COPY, and any needed `chown -R` in the *builder* stage. SQLite must write to a mounted volume writable by 65532 — not the WORKDIR (this is the one piece still wrong in compose).
- **(d) Healthcheck.** No curl/wget/shell exists; the healthcheck must be **exec-form** invoking node by absolute path `/nodejs/bin/node`, with a fetch timeout and an `r.ok` status assertion.

**Complete reference Dockerfile:**

```dockerfile
# syntax=docker/dockerfile:1.7
# Runtime: Node.js 26 / Debian 13 distroless (glibc). VERIFIED published upstream.
# CRITICAL: builder must be Debian 13 glibc (node:26-trixie-slim) so native addons
# (sqlite3) are ABI-compatible with the distroless runtime. NEVER node:26-alpine (musl).

ARG EXAMPLE=fastify-sqlite-react
ARG PORT=8080

# ── Stage 1: build zacatl ────────────────────────────────────────────
FROM node:26-trixie-slim@sha256:<PIN_ME> AS builder
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY tsconfig*.json ./
COPY src ./src
COPY scripts ./scripts
COPY build-scripts-esm ./build-scripts-esm
RUN npm run build && npm prune --omit=dev

# ── Stage 2: install example deps (native modules built vs glibc) ────
FROM node:26-trixie-slim@sha256:<PIN_ME> AS example-install
ARG EXAMPLE
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/package.json             ./package.json
COPY --from=builder /app/build-src-esm            ./build-src-esm
COPY --from=builder /app/build-src-cjs            ./build-src-cjs
COPY --from=builder /app/node_modules             ./node_modules
COPY --from=builder /app/build-scripts-esm        ./build-scripts-esm
COPY --from=builder /app/scripts                  ./scripts
COPY --from=builder /app/src/localization/locales ./src/localization/locales
COPY --from=builder /app/src/eslint               ./src/eslint
COPY examples/${EXAMPLE} ./examples/${EXAMPLE}
WORKDIR /app/examples/${EXAMPLE}
RUN --mount=type=cache,target=/root/.npm npm install

# ── Stage 3a: build backend (chown here — no RUN exists in distroless) ─
FROM example-install AS build-backend
ARG EXAMPLE
WORKDIR /app/examples/${EXAMPLE}
RUN npm run backend:build && npm prune --omit=dev \
 && chown -R 65532:65532 /app

# ── Stage 3b: build frontend ─────────────────────────────────────────
FROM example-install AS build-frontend
ARG EXAMPLE
WORKDIR /app/examples/${EXAMPLE}
RUN npm run frontend:build

# ── Stage 4: distroless runtime (no shell, no npm, no apt, uid 65532) ─
FROM gcr.io/distroless/nodejs26-debian13:nonroot@sha256:<PIN_ME>
ARG EXAMPLE
ARG PORT
ENV NODE_ENV=production
WORKDIR /app/examples/${EXAMPLE}
COPY --from=build-backend  --chown=65532:65532 /app/package.json             /app/package.json
COPY --from=build-backend  --chown=65532:65532 /app/node_modules             /app/node_modules
COPY --from=build-backend  --chown=65532:65532 /app/build-src-esm            /app/build-src-esm
COPY --from=build-backend  --chown=65532:65532 /app/src/localization/locales /app/src/localization/locales
COPY --from=build-backend  --chown=65532:65532 /app/src/eslint               /app/src/eslint
COPY --from=build-backend  --chown=65532:65532 /app/examples/${EXAMPLE}/node_modules       ./node_modules
COPY --from=build-backend  --chown=65532:65532 /app/examples/${EXAMPLE}/apps/backend/dist  ./apps/backend/dist
COPY --from=build-frontend --chown=65532:65532 /app/examples/${EXAMPLE}/apps/frontend/dist ./apps/frontend/dist
EXPOSE ${PORT}
# Exec form only (no /bin/sh). Absolute node path; assert HTTP status; bounded fetch.
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
  CMD ["/nodejs/bin/node","-e","fetch('http://localhost:'+(process.env.PORT||8080)+'/api/greetings',{signal:AbortSignal.timeout(4000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
# Node is PID 1 (clean SIGTERM). Path is constant: BACKEND is apps/backend in every example.
# Build ARGs cannot be interpolated into exec-form JSON — override CMD at run time if needed.
ENTRYPOINT ["/nodejs/bin/node"]
CMD ["apps/backend/dist/index.js"]
```

**Companion compose change (SQLite examples):**

```yaml
environment:
  - PORT=8081
  - DATABASE_URL=sqlite:/app/data/database.sqlite   # NOT workdir-relative
read_only: true
tmpfs: [/tmp]
volumes:
  - app-data:/app/data    # named volume; must be writable by uid 65532
healthcheck:
  test: ['CMD','/nodejs/bin/node','-e',"fetch('http://localhost:8081/api/greetings',{signal:AbortSignal.timeout(4000)}).then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
```

---

## 4. Prioritized remediation roadmap

**P0 — correctness/availability on the primary path**
1. Fix eager-sqlite construction break (`service.ts:43-51` / lazy model resolution) — the documented node:sqlite flow currently cannot start.
2. Key ORM instances/adapters by database name, not vendor (`orm-instance.ts`, `database-server.ts`) — silent collision + connection leak.
3. Bound `findMany` in all three adapters (WHERE pushdown + default LIMIT); fixes both the node:sqlite full-table scan and the ORM unbounded queries.
4. Replace the JSONC regex stripper with a real parser — silent config corruption.

**P1 — error handling, injection hardening, supply-chain hygiene**
5. Narrow Mongoose blanket catches to CastError; make adapter `initialize()` awaitable and fail-fast at `start()`.
6. Enable `sanitizeFilter` and `{ $set: … }` wrapping in the Mongoose adapter.
7. Remove better-sqlite3 and sqlite3 phantom deps (manifest + allowScripts + re-export barrel); resolve the optional-vs-peer duplication and the inert sequelize meta entry.
8. Rotate the npm publish token; add `.npmrc` to `.gitignore`; `engine-strict=true`.
9. Digest-pin all Docker base images; replace `mongo:latest`; add the in-image HEALTHCHECK and fix the SQLite volume/DB path in compose.

**P2 — hardening and design debt**
10. Ship `verifyHmac` (timingSafeEqual); drop md5/sha1 from the HMAC union; add `toClientJSON()` on CustomError.
11. Default security headers + opt-in CORS/rate-limit; configurable `host` in `HttpServerConfig`.
12. Per-Service child DI containers; uniform `isRegistered` guards; constructor-inject ORM instances; server-adapter factory seam.
13. Cache node:sqlite prepared statements; escape the Express proxy prefix regex; normalize the Fastify SPA fallback path; prune stale `.dockerignore` rules.