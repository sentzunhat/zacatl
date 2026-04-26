# `.hawp/work/` — Downstream Work Scaffold

This folder is the clean scaffold source copied into a target repository's `.hawp/work/` during install/update seeding.
In this source repository, live project work state is tracked at repo-root `.hawp/work/`.

## Layout

```
work/
  STATUS.md           — current state dashboard
  BACKLOG.md          — compact active index (not permanent history)
  active/             — open bugs and tasks (flat, easy to find)
  parked/             — deferred or icebox items (not active, not closed)
  closed/YYYY/MM/DD/  — archived closed work, filed by date
  decisions/YYYY/MM/DD/ — ADRs and significant project decisions
  evidence/YYYY/MM/DD/  — verification artifacts (only when real)
  status/YYYY/MM/DD/  — checkpoint summaries and manager reviews
  notes/YYYY/MM/DD/   — session notes, scratch pads, migration records
```

The reusable workflow guides (operating loop, status report shape, repo-local init) live with the kit:

- `../kit/usage/init.md`
- `../kit/usage/intake-workflow.md`
- `../kit/usage/status-report.md`

## Core Rule

```
Read from kit.
Write to work.
Archive by date.
Never overwrite project truth.
```

## Distinction from `kit/`

- `kit/` is reusable HAWP material (protocol, templates, patterns, reviews, examples, types, and reusable workflow usage guides) that downstream installs copy.
- `work/` here is scaffold source only. In installed repos, `.hawp/work/` becomes project-owned operating memory and must not be overwritten by updates.
