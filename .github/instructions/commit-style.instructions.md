---
applyTo: "**"
description: Apply the repo commit style whenever the user asks to commit changes
---

# Commit Style — Ambient Rules

Apply these rules whenever the user asks to commit, e.g.:

- "commit the changes"
- "commit this"
- "please commit"
- "stage and commit"
- "multiple commits" / "semantic groups" / "split commits"
- any similar phrasing requesting a Git commit

## Canonical commit message rules

Follow **[.hawp/kit/standards/guidelines/git-workflow.md](../../.hawp/kit/standards/guidelines/git-workflow.md)** — Commit Message Format section.

- One **plain sentence** per commit (lowercase start, no `feat:` / `fix:` prefixes).
- **No** commit body, PR-style description, or trailers unless the user explicitly asks.

## Default Behavior

Unless the user explicitly asks for multiple commits or a multi-line body,
follow [.github/prompts/hawp-commit-one-big.prompt.md](../prompts/hawp-commit-one-big.prompt.md):

- Semantically review the full diff, aggregate by meaning, one summary sentence, one commit.

## Multiple commits (many-small)

When the user asks for multiple commits, splits, grouped commits, or semantic grouping,
follow [.github/prompts/hawp-commit-many-small.prompt.md](../prompts/hawp-commit-many-small.prompt.md):

- Group by **semantic purpose**, not by file count.
- One plain-sentence message per group; no body or description.

## Method Selection

### Trigger Rules

**Use one-big (default):**

- "commit the changes" / "commit this" / "stage and commit"
- No explicit split, multiple, or grouped mention

**Use many-small:**

- "multiple commits" / "many commits" / "split commits"
- "semantic groups" / "grouped commits" / "group those commits"
- "small commits" / "separate commits" / "logically coherent chunks"

## Workflow References

| User Request                                        | Method     | Prompt File                      |
| --------------------------------------------------- | ---------- | -------------------------------- |
| "commit the changes" / "commit this"                | one-big    | hawp-commit-one-big.prompt.md    |
| "multiple commits" / "semantic groups" / "split"    | many-small | hawp-commit-many-small.prompt.md |
| "group those commits" / "break it up"               | many-small | hawp-commit-many-small.prompt.md |

For ambiguous requests, default to one-big. Clarify with the user if needed.
