# Parallel Agent Worktrees

Use parallel worktrees only when work can be split into independent slices with
clear file ownership. Worktrees provide separate checkouts; they do not resolve
overlapping edits or choose the correct base branch for you.

## Before creating a worktree

1. Check the backlog and active plans for existing owners.
2. Split the work into independently reviewable slices.
3. Record each owner's exact repo-relative files in the plan. Avoid overlapping
   files; if overlap is necessary, sequence the work or get explicit approval.
4. Choose the intended base ref explicitly. A worktree created from the wrong
   branch can produce stale work and hard-to-review merges.

See [parallel-work-guardrails](../standards/patterns/parallel-work-guardrails.md)
and [file tracking](../references/work-item-file-tracking.md) for ownership.

## Create and verify a worktree

```bash
git worktree add <path> -b <branch> <base-ref>
git -C <path> status --short --branch
git -C <path> log -1 --oneline
```

Use a distinct branch and worktree path for each slice. Verify the new branch
starts at the selected `<base-ref>` before implementation. Do not assume an
agent tool or GUI chose the current feature branch as its base.

## Integrate completed slices

1. Review each slice's diff and verification against its plan.
2. Integrate in dependency order, one slice at a time.
3. Resolve conflicts deliberately; do not overwrite another owner's changes.
4. Re-run checks affected by the combined changes and update the work record.
5. Remove a worktree only after confirming it has no uncommitted or untracked
   work that needs preservation.

```bash
git worktree list
git -C <path> status --short
git worktree remove <path>
```

Do not use forced removal as routine cleanup. Preserve or explicitly recover
uncommitted work first. Delete a local or remote branch only after confirming
the work is integrated and that branch deletion is intended.

## Keep coordination lightweight

- Use the plan and backlog as the coordination record; do not invent lock
  services or new HAWP schema fields.
- Keep one owner per active plan and one owner per overlapping file at a time.
- Leave unrelated dirty files in their original checkout.
- Treat parallel execution as optional; sequential work is simpler for tightly
  coupled changes.

For a long-lived HAWP coordination checkout separated from product branches,
see the optional [manager-branch pattern](manager-branch.md).
