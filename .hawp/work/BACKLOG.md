# Backlog

Active index for current open work in this repository.
Closed history belongs under `.hawp/work/closed/YYYY/MM/DD/` and should not accumulate forever here.
Each row links to its plan file when one exists.

---

## Status Key

| Status        | Meaning                             |
| ------------- | ----------------------------------- |
| `inbox`       | Received, not yet analyzed          |
| `analyzing`   | Under investigation                 |
| `plan-ready`  | Plan written, awaiting review       |
| `approved`    | Plan approved, ready to implement   |
| `in-progress` | Being implemented                   |
| `parked`      | Deferred without closing            |
| `done`        | Implemented and verified            |
| `blocked`     | Blocked — reason noted in plan file |
| `wont-fix`    | Decided not to fix — reason noted   |

---

## Active Work

| ID           | Type        | Title                                                              | Status      | Plan                                                          |
| ------------ | ----------- | ------------------------------------------------------------------ | ----------- | ------------------------------------------------------------- |
| DEVX-001     | improvement | Add devcontainer configuration for local development setup         | parked      | `.hawp/work/parked/DEVX-001.md`                              |
| FEAT-001     | feature     | RequestContextHook: opt-in AsyncLocalStorage per-request context  | parked      | `.hawp/work/parked/FEAT-001-REQUEST-CONTEXT-HOOK.md`         |
| ESLINT-010   | tooling     | Upgrade ESLint from ^9.x to ^10.x                                 | parked      | `.hawp/work/parked/ESLINT-010.md`                            |

---

## Recently Closed

Keep this section short (last 5–10 items or last 14–30 days).

| ID         | Type          | Title                                                                                                                    | Closed     | Plan                                                                        |
| ---------- | ------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------- | --------------------------------------------------------------------------- |
| `STAB-029` | `bugfix`      | Unify API prefix across all 8 examples — add server.prefixes, fix frontends, tighten Vite proxy                         | 2026-07-10 | —                                                                           |
| `TWL-004`  | `tooling`     | Migrate all 8 example frontends from Tailwind CSS 3 to Tailwind CSS 4                                                   | 2026-07-10 | —                                                                           |
| `REFACTOR-001` | `refactoring` | Remove src/ index barrels and use direct path imports                                                            | 2026-07-09 | [closed/2026/07/09/REFACTOR-001.md](closed/2026/07/09/REFACTOR-001.md)         |
| `STAB-028` | `improvement` | Service.stop() + graceful shutdown + real DB disconnect                                                          | 2026-07-09 | [closed/2026/07/09/STAB-028.md](closed/2026/07/09/STAB-028.md)             |
| `AUDIT-002` | `audit`       | Pre-0.0.56 production readiness audit (branch review)                                                            | 2026-07-09 | [closed/2026/07/09/AUDIT-002.md](closed/2026/07/09/AUDIT-002.md)             |
| `STAB-025` | `improvement` | Add React/Svelte frontend packages as zacatl root devDependencies                                                        | 2026-07-09 | [closed/2026/07/09/STAB-025.md](closed/2026/07/09/STAB-025.md)             |
| `STAB-026` | `improvement` | Capture and document example UI screenshots (init + CRUD states)                                                         | 2026-07-09 | [closed/2026/07/09/STAB-026.md](closed/2026/07/09/STAB-026.md)             |
| `STAB-024` | `improvement` | Right-size example images without breaking ORM peer resolution                                                           | 2026-07-09 | [closed/2026/07/09/STAB-024.md](closed/2026/07/09/STAB-024.md)             |
| `STAB-023` | `improvement` | Unify the "exported abstract class" naming lint rule into one allowlist                                                  | 2026-07-09 | [closed/2026/07/09/STAB-023.md](closed/2026/07/09/STAB-023.md)             |
| `STAB-022` | `security`    | Harden examples/Dockerfile: run as non-root user                                                                         | 2026-07-08 | [closed/2026/07/08/STAB-022.md](closed/2026/07/08/STAB-022.md)             |
| `STAB-021` | `breaking`    | Path-based naming alignment for repositories and providers (BaseRepository, createApiAdapter/createPageAdapter)          | 2026-07-08 | [closed/2026/07/08/STAB-021.md](closed/2026/07/08/STAB-021.md)             |
| `STAB-020` | `improvement` | Optimize Docker images with alpine runtime and Node 26                                                                   | 2026-07-06 | [closed/2026/07/06/STAB-020.md](closed/2026/07/06/STAB-020.md)             |
| `STAB-018` | `improvement` | Remove dead duplicate server adapters and share prefix normalization                                                     | 2026-07-03 | [closed/2026/07/03/STAB-018.md](closed/2026/07/03/STAB-018.md)             |

---

## Archive

- Closed work: `.hawp/work/closed/`
- Status reports: `.hawp/work/status/`
- Evidence: `.hawp/work/evidence/`
- Decisions: `.hawp/work/decisions/`

---

## Notes

- Check this file before starting any new item.
- Each item gets one plan file under `.hawp/work/active/` - no two agents on the same ID.
- Deferred items can move to `.hawp/work/parked/` without being closed.
- On close, move the plan file to `.hawp/work/closed/YYYY/MM/DD/`.
- Keep Recently Closed capped; do not append completed history forever.
- Work started outside this loop should still get a row added for visibility.
