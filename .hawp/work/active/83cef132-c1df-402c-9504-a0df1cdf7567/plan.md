# 83cef132 — Update the `.hawp` folder to HAWP 0.0.24

**UUID:** `83cef132-c1df-402c-9504-a0df1cdf7567` · **Type:** tooling · **Priority:** P3 · **Reported:** 2026-10-03
**Status:** inbox · **Target:** after 0.0.64 (owner: "further down the line")

## Goal

Bring the repo-local HAWP kit (`.hawp/kit/`, `.claude/rules/hawp-*.md`,
`CLAUDE.md` / `AGENTS.md` pointers) up to HAWP 0.0.24, the version the owner
now runs. The last refresh came in with 0.0.63 (Codex provider, `main`).

## Plan

1. Owner runs the HAWP update for the Claude and Codex providers (the
   downloaded update scripts are run by the owner, not the agent;
   `.hawp/bin/` stays git-ignored).
2. Review the diff: kit docs and rules only; `.hawp/work/` content untouched.
3. Commit the refresh as one commit on its own branch; PR to `dev`.

## Out of scope

- Migrating existing work items to UUID folders — `ac0c4acf`.

## Verification

`git diff --stat` limited to kit/rules/pointer files; no machine-local
absolute paths in committed files; `work:validate` (if the 0.0.24 kit ships
it) passes on the current backlog.
