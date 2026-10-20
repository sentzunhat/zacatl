# 2026-09-30 → 2026-10-04 — Releases 0.0.62–0.0.64: runtime fixes, shared logger, dependency maintenance

**Work dates:** 2026-09-30 → 2026-10-04 · **Archived:** 2026-10-12
**Scope:** public-repository technical context only.

Continues [2026-09-29 release review checkpoint](../../../09/2026-09-29-zacatl-release-review-parallel-stabilization-continuation.md).

## Before (2026-09-30)

- Published version: 0.0.61. Two runtime bugs reported against it:
  1. The `node:sqlite` adapter imported `uuidv4` from the `third-party` barrel,
     which also re-exported `sqlite3`, so `node:sqlite` users needed `sqlite3`.
  2. `AbstractRouteHandler.execute()` sent the reply and returned the result,
     so Fastify tried to send it a second time.
- The Service had no configurable logger. Internal logs used a module-global
  pino logger, and all four Fastify examples ran with `logger: false`.
- `http-proxy-middleware` was a hard dependency of the package.
- Release flow already in place: `dev` → PR to `main` → CI → `release-tag.yml`
  → `release.yml` (CVE gate, `npm publish --provenance`, GitHub Release).

## During

### 0.0.62 — runtime fixes (released 2026-09-30, PRs #115 → `dev`, #116 → `main`)

- `node:sqlite` adapter imports `third-party/uuid` directly. The `sqlite3`
  re-export left the `third-party` barrel (subpath import still available).
- The tsyringe re-export loads `reflect-metadata` first, so the barrel can be
  the first import.
- The Fastify adapter returns `reply` when the handler already sent it, and
  logs handled errors instead of re-throwing after a send.
- New `check:optional-peers` script: blocks the optional peers, then loads
  every published entry point in a fresh process (301 ESM/CJS builds).
- CI: duplicate workflow runs removed (labels `publish-dry-run` and
  `docker-smoke` opt a PR into the full pipeline).
- Badge script rewrites only the badge numbers and the test-count sentence.

### 0.0.63 — one shared logger (released 2026-10-03, PRs #118 → `dev`, #121 → `main`)

Final design, reached after several owner reviews:

- `toFastifyLogger(adapter)` in `@sentzunhat/zacatl/logs`:
  - A `PinoLoggerAdapter` returns its real pino instance.
  - Console or custom `LoggerPort` adapters get a bridge with `level`,
    `child()` and pino call styles.
  - The bridge never throws into Fastify. A failing adapter drops the entry
    and emits one `ZACATL_LOGGER_ADAPTER_FAILED` warning.
- `ServiceConfig.logger` (optional, defaults to the Zacatl logger) is
  registered once under `LoggerToken` in the Service's own DI child container.
  That container is shared by `Layers` and `Platforms`.
  - Classes can `@inject(LoggerToken)`, including `@singleton()` ones.
  - Each Service keeps its own logger.
- Fastify keeps its native `request.log` / `reply.log`. Apps point it at the
  same adapter with `loggerInstance: toFastifyLogger(adapter)`.
- Express gets a request-scoped, pino-style `req.log` / `reply.log` that
  writes through the Service logger. Its `reqId` is generated server-side and
  never taken from request headers.
- Fastify examples build one shared logger; `createServiceConfig()` returns
  it inside the config.
- Security: `braces` ≤ 3.0.3 (GHSA-vfj7-8cjw-p6xm, no fixed release) reached
  production installs through `http-proxy-middleware` → `micromatch`.
  - Owner decision: `http-proxy-middleware` becomes an optional peer,
    lazy-loaded only when an Express gateway proxy is configured.
  - It left the `third-party` barrel.
  - Result: `npm audit --omit=dev` reports 0.

Approaches rejected along the way (do not reintroduce without new evidence):

| Rejected approach                                                 | Replaced by                               |
| ----------------------------------------------------------------- | ----------------------------------------- |
| A hidden Symbol link from `createLogger()` to its adapter         | An explicit adapter argument              |
| Spreading the logger into constructors                            | The logger in `ServiceConfig`             |
| Logger fields on `PlatformsConfig` / `ServerConfig`               | One registration in the Service container |
| Swapping Fastify's `request.log` / `reply.log` during the handler | Fastify's native `reply.log`              |

The swap was rejected because `reply.send()` completes inside the handler,
which moved Fastify's own "request completed" log and dropped its
serializers.

### 0.0.64 — dependency maintenance (released 2026-10-04, PRs #119 → `dev`, #124 → `main`)

- Root package:
  - 26 in-major updates plus `vitest` / `@vitest/coverage-istanbul` 4.1.11.
  - `i18n` 0.15.4 stays an exact pin (vetted before the move).
  - The three `typescript-eslint` packages were resolved together, without
    `--force`.
- Examples: in-range `npm audit fix` in every example. All nine examples
  audit at 0, and their lockfiles no longer carry `http-proxy-middleware`.
- Deliberately excluded:
  - Majors: ESLint 10 (`ESLINT-010`), vitest 5, TypeScript 7.
  - Releases under two days old with no security fix: `pino` 10.4.0,
    `mongoose` 9.10.4, `@types/node` 26.6.4.
- HAWP: `RUNTIME-FIX-001`, `LOG-001` and `DEPS-063` closed with release
  evidence under `.hawp/work/evidence/2026/10/{01,03,04}/`.

### Lessons and process facts

- **Release PRs:**
  - The title carries no version number.
  - The PR needs the `publish-dry-run` and `docker-smoke` labels.
  - The top changelog heading must equal the `package.json` version, or the
    Publish dry-run fails.
- **Stacked PRs** (base other than `dev`/`main`) get no CI. Run the
  workflows by hand with `gh workflow run <workflow> --ref <branch>`.
- **`dev` gets deleted on release merges.** The repo has
  `delete_branch_on_merge = true`, so merging the `dev` → `main` PR deletes
  `dev`.
  - The owner recreates it from `main`, which is safe because the squash
    merge leaves identical trees.
  - Seen after #124. This setting is still on as of 2026-10-12.
- **Node:** use Node 26.3.0 (`.nvmrc`). Older shells lack `node:sqlite` and
  `module.registerHooks`, and their npm rewrites lockfile `libc` lines.
- **Clean reinstalls:** after switching branches with lockfile changes, run
  `rm -rf node_modules && npm ci`.
- **Paths:** `npm run paths:generate` drifts unrelated aliases. Use
  `npm run local:exports` for export maps.

## After (state at 2026-10-04, re-checked 2026-10-12)

- npm `latest` = **0.0.64** with provenance. Tag `v0.0.64` points at `8fa7a790`.
- `main` = `8fa7a790`. `dev` = `0e6ce17c` (`main` plus the DEPS-063 close
  commit).
- Active backlog (`.hawp/work/BACKLOG.md`):

  | Item                                               | Status         | Notes                                                                       |
  | -------------------------------------------------- | -------------- | --------------------------------------------------------------------------- |
  | `EXPRESS-400`                                      | inbox          | Express answers Zod validation errors with 500 instead of 400. Separate PR. |
  | `83cef132`                                         | inbox          | Update `.hawp` to HAWP 0.0.24. The owner runs the update scripts.           |
  | `ac0c4acf`                                         | inbox          | UUID IDs and folder-per-item work items. Runs after `83cef132`.             |
  | `NPM-OIDC-001`                                     | plan-ready, P0 | npm Trusted Publishing.                                                     |
  | `b4f0c8a1`, `e7a20d15`, `f2a96e04`, `PLATFORM-001` | unchanged      | See the backlog.                                                            |

- Dependabot (observed 2026-10-12):
  - Several `main`-targeted PRs closed on their own once 0.0.64 merged
    (#109, #110, #117, #122, #123, plus #120 on 2026-10-05).
  - Still open against `main`: #86–#95 and #106–#108, mostly superseded by
    0.0.64. Closing them needs owner approval.
  - New PRs against `dev` (#125–#136) include `mongoose` 9.11.0, `pino`
    10.4.0, `typescript-eslint` 8.71.1, `vite` 8.3.3, and majors
    (ESLint 10, vitest 5, coverage 5).
  - `.github/dependabot.yml` has two root npm entries, one for `dev` and one
    for `main`. That is why the same bump arrives as two PRs.

## Unresolved

- Whether to turn off `delete_branch_on_merge`, or keep recreating `dev`
  after each release.
- Whether to drop the `main` target in `.github/dependabot.yml`, so updates
  land only on `dev`.
- Known follow-ups:
  - After Express sends a reply, a re-thrown error still reaches `next(err)`.
  - `tsconfig.base.json` drift from `paths:generate`.
- Not verified: the dev-only `braces` advisory has no fixed release as of
  2026-10-04. Re-check before the next dependency round.

## Resume from

The next dependency round on a `fix/` branch to `dev`:

1. Triage the `dev` Dependabot PRs (#125–#136). Take the in-major bumps that
   are now more than a few days old, and leave the majors to their own work
   items.
2. Then pick one of these:
   - `EXPRESS-400` as a separate bug-fix PR, or
   - `83cef132` (HAWP 0.0.24 kit update) followed by `ac0c4acf`.
