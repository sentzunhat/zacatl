---
name: hawp-backlog-alignment
description: Review or compact a HAWP backlog using active-index rules
---

# HAWP Backlog Alignment Prompt

Use this prompt to review or compact a HAWP project backlog.

Mode (choose one):

- review only
- compact with edits

Mission:

Check whether `.hawp/work/BACKLOG.md` follows compact active-index rules.

Reference:

- `.hawp/kit/references/backlog-alignment.md` (canonical policy)

## Review checks

- `BACKLOG.md` is treated as an active index, not permanent history.
- Active Work contains only current items.
- Closed work is archived under `.hawp/work/closed/YYYY/MM/DD/`.
- Recently Closed is capped.
- Archive links exist.
- Evidence/status/decision links are kept outside the main backlog.
- Repeated maintenance tasks are not duplicated endlessly.
- Missing archive links are identified.
- Missing active detail files are identified.

Review mode behavior:

- Inspect and report only.
- Do not move files unless explicitly asked.

## Compaction workflow

1. Identify done/closed rows.
2. Verify detail files exist.
3. Move closed detail files to `.hawp/work/closed/YYYY/MM/DD/`.
4. Preserve IDs and history.
5. Replace long Done sections with a capped Recently Closed section.
6. Add archive links.
7. Report missing detail files or uncertain close dates.

## Hard constraints

- Do not delete history.
- Do not renumber IDs.
- Do not mark incomplete work as closed.
- Do not overwrite project-owned files.
- Do not add CLI, database, or runtime automation behavior.

## Output

- Summary
- Findings
- Changes made (if any)
- Missing records
- Follow-up items
- Verification commands run
