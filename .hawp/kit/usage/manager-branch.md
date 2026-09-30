# Optional Manager-Branch Pattern

Use a manager branch when a project has a product integration branch and you
want HAWP coordination records to stay separate from product changes. This is
an organizational choice; HAWP does not require a manager branch.

## When it helps

- Product work merges through a stable integration branch.
- One checkout should own `.hawp/kit/`, `.hawp/work/**`, and task dispatch.
- Product work needs separate worktrees cut from the actual integration ref.

## Ownership

**Manager checkout:** HAWP kit refreshes, backlog and active plans, evidence,
status reports, and coordination notes.

**Product worktrees:** product source changes, focused verification, and
branches intended for the product integration target.

Do not open a product PR from the manager branch just because it contains the
latest coordination files. Create product worktrees from the branch the product
will actually merge into.

## Example

```text
manager branch: chore/hawp-manager
product integration branch: origin/development
product slice: feature/<slice> based on origin/development
```

## Guardrails

- Keep the manager branch optional and focused on coordination.
- Do not treat it as an agent runtime or control plane.
- If product changes also modify `.hawp/`, define ownership before work begins
  to avoid merge conflicts.
- Preserve `.hawp/work/**` when refreshing installed kit/provider files.
- Keep saved paths repo-relative and portable.

Related: [parallel agent worktrees](parallel-agent-worktrees.md),
[workflow loop](workflow-loop.md), and
[backlog alignment](../references/backlog-alignment.md).
