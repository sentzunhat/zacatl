---
name: commit-many-small
description: Split uncommitted changes into multiple semantically grouped commits using the repo commit style
---

Review all uncommitted changes and split them into **semantic groups**—changes that belong together by purpose (feature area, doc type, provider, refactor theme, etc.).

- A group may span many files or few; size does not matter—**meaning** does.
- Do not default to one commit per file unless a file is truly its own logical unit.

For each semantic group:

1. Stage only the files in that group.
2. Write one plain-sentence message that summarizes that group.
3. Commit with **only** that single-line message—no body, description, or trailers.

Follow the commit message rules in [.hawp/kit/standards/guidelines/git-workflow.md](../../.hawp/kit/standards/guidelines/git-workflow.md) (Commit Message Format) for every commit.

Repeat until all uncommitted work is committed.
