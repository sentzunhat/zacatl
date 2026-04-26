# Git Workflow & Versioning Guide

Commit message format, branch naming, versioning strategy, and release procedure for all projects.

## Table of Contents

1. [Commit Message Format](#commit-message-format)
2. [Branch Naming](#branch-naming)
3. [Semantic Versioning](#semantic-versioning)
4. [Pre-PR Validation](#pre-pr-validation)
5. [PR Guidelines](#pr-guidelines)

---

## Commit Message Format

Use a **single plain sentence** per commit. PR titles should match the same style.

This is the canonical commit-message rule for HAWP projects. Provider packs implement it via `.github/instructions/commit-style.instructions.md` and the `hawp-commit-*` prompts.

### Rules

- Start with a **lowercase** letter
- Use a **present- or past-tense** verb
- **Do not** use Conventional Commit type prefixes (`feat:`, `fix:`, `chore:`, etc.) or scoped prefixes (`feat(scope):`)
- Clearly describe **what** changed
- Avoid implementation details unless essential
- Do **not** add a multi-line body unless explicitly requested

### Examples

```
implemented a feature flag for potato peeling drill speed control.
refactored the image upload process to improve performance.
fixed null handling in the service constructor.
```

### Avoid

```
feat(error): add ForbiddenError class
fix(service): handle null database connections
Added ForbiddenError class
```

### Single commit (one-big)

When the user wants one commit (default):

1. Review **all** uncommitted files semantically—what changed, why it hangs together.
2. Write **one** plain-sentence message that summarizes the whole diff (aggregate by meaning, not per file).
3. Stage everything and commit with **only** that subject line—no body, no description, no trailers.

### Multiple commits (many-small)

When the user asks for multiple commits, splits, or semantic groups:

1. Group changes by **semantic purpose** (e.g. commit-style docs, provider pack, librarian tooling)—not one commit per file unless a file is its own logical unit.
2. Each group can be small or large; size does not matter—coherence does.
3. For each group, write one plain-sentence message that summarizes that group.
4. Commit each group separately with **only** the subject line—no body or description.

Use semantic versioning (below) for release bumps; do not encode version impact in commit prefixes.

Provider workflows: `.github/instructions/commit-style.instructions.md`, `hawp-commit-one-big.prompt.md`, `hawp-commit-many-small.prompt.md`.

---

## Branch Naming

**Pattern:** `<type>/<scope>/<description>`

Keep branch names lowercase, kebab-case, and descriptive. Branch type prefixes are optional and separate from commit messages.

```
# ✅ Good
feat/error/forbidden-error-class
fix/service/handle-null-connections
docs/api/endpoint-documentation
refactor/di-container/auto-registration
chore/deps/upgrade-typescript

# ❌ Avoid
feature/my-new-thing         # Type too generic, scope missing
bugfix/error                 # "bugfix" instead of "fix"
WIP-service-changes          # All caps, vague
123-add-handler              # Issue number prefix only
```

### Branch Type Options

- `feat/` — Feature branch
- `fix/` — Bug fix branch
- `refactor/` — Code reorganization
- `docs/` — Documentation only
- `test/` — Test additions
- `chore/` — Dependencies, tooling
- `ci/` — CI/CD updates

### Scope & Description

- **Scope:** Area affected (same as commit scope)
- **Description:** Lowercase, kebab-case, concise (max 50 chars total)

```
feat/di-container/resolve-token-type
fix/repository/handle-null-models
docs/readme/add-examples
```

### Cleanup

Delete branches after merging:

```bash
# Locally
git branch -d feat/service/async-constructor

# On remote
git push origin --delete feat/service/async-constructor
```

---

## Semantic Versioning

Follow **[SemVer](https://semver.org/)**: `MAJOR.MINOR.PATCH`.

| Change                                       | Bump    |
| -------------------------------------------- | ------- |
| Breaking change (removes/renames public API) | MAJOR   |
| New feature (backwards-compatible)           | MINOR   |
| Bug fix, refactor, perf                      | PATCH   |
| Docs, tests, tooling only                    | No bump |

Start new projects at `0.1.0`. Promote to `1.0.0` when the public API is stable.

---

## Pre-PR Validation

Before opening any PR, pass:

```bash
npm run type:check && npm run lint && npm run test
```

Or the single alias if configured: `npm run validate`.

- Zero TypeScript errors.
- Zero lint errors (warnings are acceptable, review intent).
- All tests pass.
- Build succeeds for library/service projects.

---

## PR Guidelines

- **Scope**: one logical change per PR. Split unrelated changes.
- **Title**: plain sentence matching the final commit message style.
- **Description**: explain _why_, link to issue or backlog item, list any migrations or config changes.
- **Self-review**: review your own diff before requesting review from others.
- **No force-pushing** to shared branches after review has started.
- **Squash merge** for feature branches to keep `main` history clean (project-level decision — document it).
