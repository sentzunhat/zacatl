# Production readiness stabilization audit for Zacatl

input: |
  Review and audit this repository from a development perspective, or add a new work item using HAWP to review and audit it, perform the work, and write a report on what needs to be done to stabilize this repository for a version that can be used in production.

context: |
  Repository uses HAWP as a lightweight workflow layer. Follow `.hawp/kit/start-here.md` for task shape and `.hawp/kit/usage/status-report.md` for status/report artifacts. Current worktree already contained unrelated modified and untracked files before this audit, including TASK-002 and TASK-003 active plan files and source changes around path generation and third-party database imports.

mission: |
  Audit the current repository state for production-readiness risks, using direct evidence from repository files and local verification commands, then produce a compact stabilization report with prioritized work needed before a production-usable release.

constraints: |
  Do not revert or rewrite unrelated in-progress changes. Separate direct evidence from inference. Keep findings decision-useful and focused on production stabilization. Prefer repository-local evidence over broad speculation. Do not treat HAWP as a runtime validator or invent extra HAWP field folders.

output: |
  Status report saved at `.hawp/work/status/2026/06/20/AUDIT-001-production-readiness.md`.

## Completion Notes

Direct verification commands run:

- `npm run type:check` failed.
- `npm run test` failed before test discovery; local Node version is below repository engine requirements.
- `npm run lint:silent` failed.
- `npm audit --audit-level=high` passed with zero vulnerabilities.
- `npm run prepublish:guard` failed due changelog/package version mismatch.

Primary report:

- `.hawp/work/status/2026/06/20/AUDIT-001-production-readiness.md`
