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

| ID | Type | Title | Status | Plan |
| --- | --- | --- | --- | --- |
| `task-005` | `task` | Create pull request for update-dependencies branch | `in-progress` | [.hawp/work/active/task-005.md](active/task-005.md) |

---

## Recently Closed

Keep this section short (for example last 5-10 items or last 14-30 days).

| ID | Type | Title | Closed | Plan |
| --- | --- | --- | --- | --- |
| `CVE-001` | `improvement` | Add CVE-Lite CLI GitHub workflow | 2026-06-17 | [.hawp/work/closed/2026/06/17/CVE-001.md](closed/2026/06/17/CVE-001.md) |
| `task-004` | Review and create pull request for update-hawp | `done` | | PR #19 created and approved |

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
