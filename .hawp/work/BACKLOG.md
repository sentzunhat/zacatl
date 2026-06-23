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

_No active work._

---

## Plan-Ready

| ID       | Type        | Title                                                                | Status     | Plan                                       |
| -------- | ----------- | -------------------------------------------------------------------- | ---------- | ------------------------------------------ |
| STAB-010 | improvement | Verify examples and Docker builds under Node 26 and TypeScript 6     | plan-ready | `.hawp/work/active/STAB-010.md`           |
| STAB-012 | improvement | Simplify fastify-sqlite-react using Mawiltia starter and barrel pruning | plan-ready | `.hawp/work/active/STAB-012.md`           |
| STAB-009 | improvement | Audit dependency approvals and optionalize prunable runtime packages | plan-ready | `.hawp/work/active/STAB-009.md`           |
| STAB-008 | improvement | Audit import extensions and TypeScript resolution for code files     | plan-ready | `.hawp/work/active/STAB-008.md`           |
| STAB-007 | improvement | Review ESLint config hierarchy and import-order baseline             | plan-ready | `.hawp/work/active/STAB-007.md`           |
| STAB-006 | improvement | Audit type safety and lint suppressions for production readiness     | plan-ready | `.hawp/work/active/STAB-006.md`           |
| STAB-001 | improvement | Align CI Node version with package engine baseline                   | plan-ready | `.hawp/work/active/STAB-001.md`           |
| TASK-003 | improvement | Update unit tests to use new @zacatl/\* import paths                 | plan-ready | `.hawp/work/active/TASK-003.md`            |
| TASK-002 | improvement | Automate tsconfig path generation for @zacatl/\* package imports     | plan-ready | `.hawp/work/active/TASK-002.md`            |

---

## Recently Closed

Keep this section short (for example last 5-10 items or last 14-30 days).

| ID         | Type                                           | Title                            | Closed     | Plan                                                                    |
| ---------- | ---------------------------------------------- | -------------------------------- | ---------- | ----------------------------------------------------------------------- |
| `STAB-011` | `improvement`                                  | Integrate export-aware barrel pruning and local exports sync | 2026-06-21 | [.hawp/work/closed/2026/06/21/STAB-011.md](closed/2026/06/21/STAB-011.md) |
| `AUDIT-001` | `audit`                                      | Production readiness stabilization audit for Zacatl | 2026-06-20 | [.hawp/work/closed/2026/06/20/AUDIT-001.md](closed/2026/06/20/AUDIT-001.md) |
| `STAB-005` | `improvement`                                | Align database server port contract and adapter signatures | 2026-06-21 | [.hawp/work/closed/2026/06/21/STAB-005.md](closed/2026/06/21/STAB-005.md) |
| `STAB-004` | `improvement`                                | Repair CJS script tsconfig and moduleResolution mismatch | 2026-06-21 | [.hawp/work/closed/2026/06/21/STAB-004.md](closed/2026/06/21/STAB-004.md) |
| `STAB-003` | `improvement`                                | Fix immediate script lint drift in generate-tsconfig-paths tooling | 2026-06-21 | [.hawp/work/closed/2026/06/21/STAB-003.md](closed/2026/06/21/STAB-003.md) |
| `STAB-002` | `improvement`                                | Restore publish gate version alignment and changelog top entry | 2026-06-21 | [.hawp/work/closed/2026/06/21/STAB-002.md](closed/2026/06/21/STAB-002.md) |
| `CVE-001`  | `improvement`                                  | Add CVE-Lite CLI GitHub workflow | 2026-06-17 | [.hawp/work/closed/2026/06/17/CVE-001.md](closed/2026/06/17/CVE-001.md) |
| `TASK-001` | `improvement`                                  | Fix repository lifecycle typing and node:sqlite adapter type errors. | 2026-06-15 | [.hawp/work/closed/2026/06/15/TASK-001.md](closed/2026/06/15/TASK-001.md) |
| `task-004` | Review and create pull request for update-hawp | `done`                           |            | PR #19 created and approved                                             |

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
