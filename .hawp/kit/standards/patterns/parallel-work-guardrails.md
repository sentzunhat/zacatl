# Parallel Work Guardrails

Use this pattern when multiple humans or AI agents may run in parallel on the same project.

Goal: reduce conflicting edits and unclear ownership while keeping coordination lightweight.

## Guardrails

1. Check active work first in `.hawp/work/BACKLOG.md` (or equivalent backlog) before planning or implementing.
2. Use one work ID and one plan file per item.
3. Record owner and overlapping files in the plan before implementation.
4. If overlap touches the same file as another in-progress item, default to hold.
5. Only proceed with overlapping edits when explicitly approved.
6. Keep coordination notes in the plan file, not in a separate lock system.
7. Treat unrelated working-tree changes as lane boundaries and leave them untouched.
8. In path-sensitive work, list overlapping files as exact repo-relative paths from repository root; basename-only lists are unsafe.

## Minimal Coordination Block

```md
### Work Coordination

**Owner:** human | agent | unassigned
**Implementation status:** not-started | in-progress | blocked | done
**Overlapping files:**

- path/to/file.ts

**Parallel work risk:** low | medium | high
**Can implement now:** yes | no | only after approval

**Coordination note:**
Explain whether another active item touches the same files.
```

## Quick Example

- Task A is `in-progress` and edits `src/auth/session.ts`.
- Task B also needs `src/auth/session.ts`.
- Set `Can implement now: only after approval` in Task B plan and wait.

This pattern is markdown-first and file-first. It does not add runtime locking, tooling, or schema changes.

## Path Safety Rules

- Always use exact repo-relative paths, not basenames.
- If basename/path collapse happens twice on the same task, stop and restart with a fresh path-locked pass.
- Treat all path-sensitive work with care: list exact paths, verify overlaps, and document decisions.
