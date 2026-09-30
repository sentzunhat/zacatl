# HAWP-First Session Workflow

Use HAWP context tools and work records as the starting point for project
questions and continuing tasks. Search narrows what to read; it does not replace
checking source files or the current worktree.

## Start with the repository and intent

1. Confirm the repository scope exposed by the connected HAWP MCP server. If it
   is absent or points elsewhere, use the CLI from the intended repository.
2. Search the backlog and existing plan for the user's project terms, known
   work ID, and likely files. Prefer an existing item when the intent matches.
3. Check the relevant source files and current Git state before editing or
   describing what is present.

For indexed context, prefer `hawp_search` when it is available. The CLI fallback
is `hawp search <query>`; add `--context` and a suitable `--max-tokens` budget
when a compact context block helps. See [search.md](search.md) for indexing,
lexical, semantic, and hybrid search details.

## Use search as a map

- Search by concrete topic, work ID, or distinctive file/feature name.
- Read the returned source paths and line ranges; open the full file or exact
  section when the question depends on complete wording or code behavior.
- Search results can be stale, partial, or absent. Re-index with `hawp search
  index` after kit or work documents change; embed again only when semantic or
  hybrid search needs fresh vectors.
- Search does not cover implementation code. Inspect source code, tests, and
  configuration directly when they determine the answer.

## Continue existing work

1. Match the intent against `.hawp/work/BACKLOG.md` and its active plan.
2. Keep the existing UUID, plan, constraints, and evidence when the intent is
   unchanged. Add new facts and changed assumptions to that item.
3. Create a new item only after checking that no existing item owns the same
   intent or paths.
4. Before writing, confirm file ownership and unrelated worktree changes.
5. Record direct evidence, inference, and remaining unknowns separately.

Use the [intake workflow](intake-workflow.md) for a new bug or task, the
[status-report guide](status-report.md) for a context handoff, and the
[workflow loop](workflow-loop.md) for multi-pass work.

## When direct reads should come first

Read directly when the request names an exact short file, the answer depends on
the whole document, the search index is unavailable, or the target is source
code/configuration. Do not delay a necessary safety or correctness check just
to force a search-first interaction.

## Quick reference

| Need | Start with |
| --- | --- |
| Project or kit context | `hawp_search` or `hawp search <query>` |
| Existing task | Backlog and matching active plan |
| New task | [intake workflow](intake-workflow.md) |
| Handoff | [status report](status-report.md) |
| Multiple sessions | [workflow loop](workflow-loop.md) |
| Parallel code slices | [parallel worktrees](parallel-agent-worktrees.md) |
