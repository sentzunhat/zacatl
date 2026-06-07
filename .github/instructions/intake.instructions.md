---
applyTo: "**"
---

# Work Intake — Ambient Rules

These rules apply whenever the user reports a bug, describes a broken behavior, or requests a fix or task.

## Trigger Recognition

Treat any of these as a work intake:

- "I have a bug", "there's a bug", "something is broken"
- "X is not working / not loading / not showing"
- "can you fix / look at / check X"
- "X looks wrong", "X is missing", "X shows an error"
- "add X", "update X", "change X"

## Operating Rules

1. **Check the backlog first.** Read `BACKLOG.md` in `.hawp/work/` before starting any work.
   Assign the next sequential ID. Never start on an ID already marked `in-progress`.

2. **Write a plan file** for all non-trivial work before implementing.
   Use `.hawp/kit/templates/intake-plan.md`. Save to `.hawp/work/active/<id>.md`.

3. **Respect the review gate** defined in `.hawp/kit/usage/intake-workflow.md`.
   Do not implement medium or high risk changes without explicit user approval.

4. **Keep scope tight.** Fix the reported issue only. Do not refactor adjacent code unless it is the direct root cause.

5. **Update BACKLOG.md** at every status transition: `inbox → analyzing → plan-ready → in-progress`, and on close move the row to Recently Closed.

6. **Separate evidence from inference** in every plan. Never present an inference as a confirmed fact.

7. **For this repo, write project work to `.hawp/work/`.** Do not write repo work into `core/.hawp/work/`.

8. **Treat `core/.hawp/work/` as downstream scaffold source only.**

9. **Treat `core/.hawp/kit/` as reusable package source only.**

10. **Keep `BACKLOG.md` compact.** Do not append completed work endlessly; move closed work to `.hawp/work/closed/YYYY/MM/DD/`.

11. **When Done rows grow large, create a compaction item first.** Add a work item titled `Compact BACKLOG.md and archive closed work.` before adding more Done rows.

12. **Apply backlog alignment guardrails.** Follow `.github/instructions/hawp-backlog-alignment.instructions.md`; use `.github/prompts/hawp-backlog-alignment.prompt.md` for explicit review/compaction requests.

13. **Follow the loop in order.** Analyze before planning; plan before implementing; verify before closing. Do not jump to implementation before the plan is complete and the review gate has been applied.

14. **Verify after every implementation.** Complete Step 6 (Verify) before closing any item. Note unproven claims explicitly rather than omitting them.

15. **Use exact repo-relative paths in path-sensitive work.** In DA reports, plans, diffs, staging lists, commit summaries, evidence, and handoff notes, paths must be exact repo-relative paths from repository root.

16. **Do not use basenames as evidence in path-sensitive work.** Basenames alone are unsafe unless the file truly lives at repository root and this is stated explicitly.

17. **Capture repo-root proof before path-sensitive edits.** Record exact output from:

- `pwd`
- `git rev-parse --show-toplevel`
- `git rev-parse --show-prefix`
- `git status --short`

17a. **Do not persist machine-local absolute paths in artifacts.**

- Never store raw host paths like `<user-home>/...`, `<linux-home>/...`, or `<windows-user-home>\\...` in plans, evidence, status, or prompts.
- When recording repo-root proof outputs in artifacts, redact only the machine-local prefix using a placeholder (for example, `<repo-root-abs>`), while preserving command identity and all repo-relative paths.
- Keep terminal execution unchanged; only redact what gets written to files.

18. **Capture staged-path proof before commit.** Record exact output from:

- `git diff --name-status`
- `git diff --check`
- `git diff --cached --name-status`
- `git diff --cached --check`
- `git status --short`

19. **Treat basename/path-collapse reports as unsafe.** Do not proceed to commit until corrected.

20. **Loop-breaker for repeated path failures.** After two basename/path-collapse failures on the same task, stop and restart with a fresh path-locked pass.

21. **Respect parallel lanes.** Unrelated working-tree changes are lane boundaries and must remain untouched.

22. **Apply deterministic report-gate checks before emitting path-sensitive outputs.** Reject output if any path has no `/`, lacks a repo-root directory prefix, or is not marked as existing/planned-but-not-present.

23. **Classify path-gate failures explicitly.** Use: `INVALID_REPO_RELATIVE_PATH`, `BASENAME_ONLY_REFERENCE`, and `SELF_VALIDATION_FAILURE`.

24. **Do not implement from an unsafe report.** If the report fails path-lock checks, issue a correction pass first, then continue.

25. **For install/update requests, execute the generated branch command with mode preflight.**

- Treat each install or update run as a new execution work item.
- Install mode: if `.hawp/` already exists in the target repo, use update guidance for that branch.
- Update mode: if `.hawp/` is missing, run install first, then update.
- Do not finish with "already present" unless command execution proof is provided.

## Source Resolution

For full loop detail, read in order:

1. `.hawp/kit/usage/intake-workflow.md`
2. `.hawp/work/BACKLOG.md`
3. `.hawp/kit/templates/intake-plan.md`

Adapt paths to match the local layout: `.hawp/work/` in downstream projects, repo-root `.hawp/work/` in the HAWP source repo.
