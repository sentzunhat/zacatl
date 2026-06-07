---
name: commit-one-big
description: Stage all uncommitted changes and create a single commit using the repo commit style
---

Review **all** uncommitted changes in the repository semantically (read the diff by meaning, not file-by-file).

Write **one** concise plain-sentence commit message that aggregates and summarizes the whole change set.

Follow the commit message rules in [.hawp/kit/standards/guidelines/git-workflow.md](../../.hawp/kit/standards/guidelines/git-workflow.md) (Commit Message Format).

Stage all changes and commit with **only** that single-line message. Do not add a body, description, or trailers unless the user explicitly asks.
