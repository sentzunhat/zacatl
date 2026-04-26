# HAWP Backlog Alignment

## Purpose

Define the official compact-backlog model for HAWP projects.

`BACKLOG.md` is an active index for current coordination. It is not the permanent history database.

## Why Compact Backlog Matters

- Keeps triage fast for humans.
- Keeps agent context small and relevant.
- Reduces noise from old completed rows.
- Prevents backlog files from growing into unsafe prompt payloads.
- Preserves history in archive files without polluting active intake.

## Folder Model

Use this structure as the default operating model:

- `.hawp/work/BACKLOG.md` - compact active index only
- `.hawp/work/active/` - open work item detail files (actively moving)
- `.hawp/work/parked/` - intentionally paused work item detail files (move back to `active/` to resume)
- `.hawp/work/closed/YYYY/MM/DD/` - completed work item detail files, archived by close date
- `.hawp/work/status/YYYY/MM/DD/` - daily or checkpoint status summaries
- `.hawp/work/evidence/YYYY/MM/DD/` - verification notes, command output summaries, screenshots, smoke-test notes, review evidence
- `.hawp/work/decisions/` - ADRs and project decisions

## Active Backlog Rules

`BACKLOG.md` should contain only:

1. Purpose
2. Status key
3. Active Work table
4. Blocked/Parked table (if needed)
5. Recently Closed table (capped)
6. Archive links

`BACKLOG.md` must not contain:

- Every completed item forever
- Full implementation notes
- Full verification notes
- Long historical changelogs
- Copied plan-file content
- Repeated update entries unless they are active or recent

Each active row stays short and operational:

- ID
- Type
- Title
- Status
- Detail file
- Updated date
- Next action

## Closed and Archive Rules

When work is completed:

1. Update the detail file with outcome, verification, evidence links, final status, and close date.
2. Move the detail file to `.hawp/work/closed/YYYY/MM/DD/`.
3. Remove the item from Active Work in `BACKLOG.md`.
4. Add a short row to Recently Closed only if useful.
5. Keep Recently Closed capped.
6. Never delete historical records only to shorten the backlog.
7. Prefer archive links over copying historical details into `BACKLOG.md`.

## Recently Closed Cap

Apply one of these caps:

- Last 5-10 closed items, or
- Last 14-30 days

Either cap is valid. Pick one and use it consistently per repository.

## Repeated Update Task Rule

For repeated maintenance items such as "Update HAWP from GitHub main":

- Keep the current active update task in Active Work.
- Move closed update tasks to `.hawp/work/closed/YYYY/MM/DD/`.
- Add monthly or daily summary files under `.hawp/work/status/` if useful.
- Keep only the latest few update entries in Recently Closed.

## Example Compact BACKLOG.md

```md
# Project Backlog

Active index for current work only. Closed work is archived under .hawp/work/closed/.

## Active Work

| ID  | Type | Title | Status | Detail | Updated | Next Action |
| --- | ---- | ----- | ------ | ------ | ------- | ----------- |

## Blocked / Parked

| ID  | Type | Title | Reason | Detail | Updated |
| --- | ---- | ----- | ------ | ------ | ------- |

## Recently Closed

Limited to the last 5-10 items or last 14-30 days.

| ID  | Type | Title | Closed | Detail |
| --- | ---- | ----- | ------ | ------ |

## Archive

- Closed work: .hawp/work/closed/
- Status reports: .hawp/work/status/
- Evidence: .hawp/work/evidence/
- Decisions: .hawp/work/decisions/
```

## Migration Guidance for Long Backlogs

Use this sequence when an existing backlog is long:

1. Identify all done rows in `BACKLOG.md`.
2. Ensure each done item has a detail file with outcome and verification.
3. Move detail files into `.hawp/work/closed/YYYY/MM/DD/` by close date.
4. Replace the large Done section with a capped Recently Closed table.
5. Add archive links to closed/status/evidence/decisions folders.
6. Preserve all history in archives; do not delete records.

If close dates are missing, place files under the best-known close date and capture uncertainty in the detail file.

## Agent Rules

- Treat `BACKLOG.md` as active coordination state, not full history storage.
- Do not append every completed item forever to the main backlog.
- On close, move detail files to `.hawp/work/closed/YYYY/MM/DD/`.
- Keep Recently Closed within the selected cap.
- Store proof and verification in `.hawp/work/evidence/YYYY/MM/DD/` and link to it.
- Store checkpoint summaries in `.hawp/work/status/YYYY/MM/DD/`.
- For repeated maintenance work, keep one active item and archive prior closures.

## Acceptance Checklist

- [ ] `BACKLOG.md` is treated as an active index, not permanent history.
- [ ] Active, closed, status, evidence, and decisions locations are defined.
- [ ] Compact backlog example is present and usable.
- [ ] Migration path for long backlogs is documented.
- [ ] Agent rules explicitly prevent endless Done table growth.
