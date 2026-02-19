# Git Workflow & Versioning Guide

This guide covers commit message formats, branch naming, versioning strategy, and release procedures.

## Table of Contents

1. [Commit Message Format](#commit-message-format)
2. [Branch Naming](#branch-naming)
3. [Semantic Versioning](#semantic-versioning)
4. [Release Procedure](#release-procedure)
5. [PR Guidelines](#pr-guidelines)
6. [Git Hooks](#git-hooks)

---

## Commit Message Format

### Conventional Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type Classification

Use one of these types:

| Type       | Meaning                                  | Release Impact  |
| ---------- | ---------------------------------------- | --------------- |
| `feat`     | New feature                              | Minor bump      |
| `fix`      | Bug fix                                  | Patch bump      |
| `refactor` | Code reorganization (no behavior change) | Patch bump      |
| `perf`     | Performance improvement                  | Patch bump      |
| `docs`     | Documentation only                       | No version bump |
| `test`     | Test additions/modifications             | No version bump |
| `chore`    | Build, deps, tooling                     | No version bump |
| `ci`       | CI/CD configuration                      | No version bump |
| `style`    | Formatting (no logic change)             | No version bump |

### Scope (Optional)

Scope should reference the area affected:

```
feat(error): add ForbiddenError class
fix(service): handle null database connections
docs(api): update endpoint documentation
refactor(di-container): simplify auto-registration logic
```

Common scopes:

- `service`, `handler`, `repository`, `adapter`
- `error`, `validation`, `logging`
- `config`, `di-container`, `types`
- `tests`, `ci`, `docs`

### Subject Line

- Start with lowercase (after type/scope)
- Use imperative mood ("add" not "added" or "adds")
- No trailing period (.)
- Max 50 characters

```
# ✅ Good
feat(error): add ForbiddenError class
fix(service): handle null database connections
docs(api): update endpoint documentation

# ❌ Avoid
feat(error): Added ForbiddenError class  # Wrong case, past tense
fix(service): Fixes null database connections  # Wrong mood
docs(api): updated endpoint documentation  # Wrong case
```

### Body (Optional but Recommended for Substantive Changes)

Include body for non-trivial commits:

```
feat(error): add ForbiddenError class

Introduces new ForbiddenError for 403 Forbidden responses.
Used when a user is authenticated but lacks permissions for the resource.

- Extends CustomError with code 403
- Supports metadata for additional context
- Aligns with existing error hierarchy
```

**Guidelines:**

- Explain **what** changed and **why**
- Use imperative mood ("refactor" not "refactored")
- Wrap at 72 characters
- Separate from subject with blank line

### Footer (Optional)

Use for breaking changes or issue references:

```
feat(service)!: make Service constructor async

BREAKING CHANGE: Service constructor is now async and requires await.
Before: const service = new Service(config);
After: const service = await new Service(config);

Fixes #42
Relates to #88
```

**Footer Keywords:**

- `BREAKING CHANGE:` — Signals breaking change (requires major version)
- `Fixes #<number>` — Closes issue
- `Relates to #<number>` — References related issue
- `Reviewed-by:` — Code reviewer(s)

### Full Commit Example

```
feat(handler): add support for DELETE requests in Express

Implements DeleteRouteHandler abstract class and concrete implementations
for Express framework, matching existing Fastify handler patterns.

- Extends AbstractRouteHandler with signature typed for DELETE
- Supports optional request body and dynamic URL parameters
- Includes type-safe response handling

BREAKING CHANGE: Handler interface now requires explicit HTTP method type.

Fixes #42
Reviewed-by: @team
```

---

## Branch Naming

### Format & Conventions

**Pattern:** `<type>/<scope>/<description>`

```
# ✅ Good
feat/service/async-service-constructor
fix/error/forbidden-error-class
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

Use commit types for consistency:

- `feat/` — Feature branch
- `fix/` — Bug fix branch
- `refactor/` — Code reorganization
- `docs/` — Documentation only
- `test/` — Test additions
- `chore/` — Dependencies, tooling
- `ci/` — CI/CD updates

### Scope & Description

- **Scope:** Area affected (same as commit scope)
- **Description:** Lowercase, kebab-case, concise (max 50 chars)

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

Zacatl (and projects following this guide) use [Semantic Versioning 2.0.0](https://semver.org/).

### Version Format

```
MAJOR.MINOR.PATCH[-prerelease][+build]

0.0.1           # Initial release
0.1.0           # New feature
0.1.1           # Bug fix
1.0.0           # Stable release
1.1.0           # New feature (post-1.0)
2.0.0           # Breaking change
1.0.0-beta.1    # Pre-release
1.0.0+build.1   # Build metadata (ignored for precedence)
```

### When to Increment

#### Patch (`0.0.x` → `0.0.x+1`)

**Increment for:**

- Bug fixes (no API changes)
- Documentation improvements
- Internal refactoring (no public API impact)
- Performance improvements
- Type definition fixes
- Test additions

**DOES NOT trigger major/minor increment:**

- No new features
- No API changes
- No breaking changes

**Example commits triggering patch:**

```
fix(service): handle null database connections  # Fix
docs(api): update endpoint docs                  # Docs
perf(handler): optimize request parsing         # Perf
refactor(di): simplify auto-registration        # Internal
```

#### Minor (`0.x.0` → `0.x+1.0`)

**Increment for (0.x phase only):**

- New features (backward compatible)
- New public APIs
- New framework adapters
- New platform support
- **Breaking changes** (allowed in 0.x; becomes major in 1.0+)

**MUST reset patch to 0:**

- `0.1.0` NOT `0.1` (always three numbers)
- `0.2.0` NOT `0.20` (minor, not patch)

**Example commits triggering minor:**

```
feat(handler): add Express framework support    # New feature
feat(service): add CLI platform support         # New platform
feat(error): add ForbiddenError class           # New API
```

#### Major (`0.x.x` → `1.0.0` or `1.x.x` → `2.0.0`)

**Increment for (post-1.0 only):**

- Breaking API changes
- Removal of deprecated features
- Major architectural shifts

**In 0.x phase:**

- Breaking changes are **minor** bumps (allowed)
- Migration from 0.x to 1.0.0 is major (stability marker)

**Example commits triggering major (post-1.0):**

```
feat(service)!: make Service constructor async  # Breaking (!= breaking)
```

---

## Release Procedure

### 1. Determine Version Bump

Review commits since last release:

```bash
# Check commits since last tag
git log v0.0.39..HEAD --oneline
```

Ask:

- **Breaking changes?** → Major (post-1.0 only) or Minor (0.x)
- **New features?** → Minor
- **Only fixes/docs/tests?** → Patch

### 2. Update package.json

Edit `package.json` and increment version:

```json
{
  "version": "0.0.40"
}
```

Or use npm CLI:

```bash
npm version patch   # 0.0.39 → 0.0.40
npm version minor   # 0.0.39 → 0.1.0
npm version major   # 0.0.39 → 1.0.0
```

### 3. Update docs/changelog.md

Add entry at the top, right after the first `---`:

```markdown
# Release Notes

---

## [0.0.40] - 2026-02-18

**Status**: Current release

### ✨ Improvements

- Feature or improvement description
- Another improvement

### 🐛 Fixes

- Bug fix description
- Another fix

### 🔧 Architecture

- Architecture refactoring

### 📚 Documentation

- Documentation update

### ⚠️ Breaking Changes

(Include if applicable, with migration guide)

---

## [0.0.39] - 2026-02-17

(Previous release...)
```

**Emoji Categories:**

```
✨ Improvements     (new features, enhancements)
🐛 Fixes            (bug fixes, corrections)
⚠️ Breaking Changes (API changes, removals — post-1.0 only)
🔧 Architecture     (refactoring, internals)
📚 Documentation    (docs, guides, examples)
🗺️ Roadmap          (in-progress work, future plans)
🚀 Performance      (optimizations, speed improvements)
🎉 Milestones       (major releases — v1.0.0, etc.)
```

### 4. Commit Version Bump

```bash
git add package.json docs/changelog.md
git commit -m "chore(release): bump to v0.0.40"
```

### 5. Tag Release

```bash
git tag v0.0.40
git push origin main
git push origin v0.0.40
```

### 6. Publish to Registry (if applicable)

```bash
npm publish
```

Or with scope:

```bash
npm publish --scope=@sentzunhat
```

### Changelog Entry Checklist

- [ ] Version number matches package.json
- [ ] Date in YYYY-MM-DD format
- [ ] Status noted (Current release, Stable, Deprecated)
- [ ] All changes categorized with appropriate emoji
- [ ] Entries written in past tense (past participle)
- [ ] Breaking changes clearly marked with ⚠️
- [ ] Migration guide included for breaking changes
- [ ] Links to PR/commits if applicable

---

## PR Guidelines

### PR Title

Use same format as commit messages (without body):

```
feat(error): add ForbiddenError class
fix(service): handle null database connections
docs(api): update endpoint documentation
```

Benefits:

- Squash commits maintained in history
- Auto-generates changelog if using commit hooks
- Clear at a glance

### PR Description Template

```markdown
## Description

Brief description of changes.

## Type of Change

- [ ] Feature (new functionality)
- [ ] Fix (bug fix)
- [ ] Breaking change
- [ ] Documentation
- [ ] Refactoring

## Related Issues

Fixes #42
Relates to #88

## Testing

- [ ] Added tests
- [ ] All tests pass locally
- [ ] Coverage maintained

## Checklist

- [ ] Code follows style guide (see docs/guidelines/code-style.md)
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or documented in description)
- [ ] Changelog entry added (if required)
```

### Review Checklist

Reviewers should verify:

- ✅ Commit messages follow Conventional Commits
- ✅ Branch follows naming convention
- ✅ Code follows style guide
- ✅ Tests added for new features/fixes
- ✅ No new console logs or debug code
- ✅ Documentation updated
- ✅ Breaking changes documented
- ✅ Architecture patterns followed

---

## Git Hooks

### Pre-commit Hook

Validate code before committing:

```bash
#!/bin/sh
# .git/hooks/pre-commit

npm run type:check || exit 1
npm run lint || exit 1
npm test || exit 1
```

### Prepare-commit-msg Hook

Auto-insert branch name in commit message:

```bash
#!/bin/sh
# .git/hooks/prepare-commit-msg

BRANCH_NAME=$(git rev-parse --abbrev-ref HEAD)
[[ $BRANCH_NAME -eq "main" ]] && exit 0

BRANCH_NAME=$(echo $BRANCH_NAME | tr '/' '/')
sed -i.bak -e "1s/^/$BRANCH_NAME: /" $1
rm $1.bak
```

### Setup Hooks

```bash
# Copy hooks to git directory
cp ./scripts/*.sh .git/hooks/
chmod +x .git/hooks/*

# Or use a tool like husky
npm install husky --save-dev
npx husky install
npx husky add .husky/pre-commit "npm run validate"
```

---

## Summary

| Aspect     | Rule                                                    |
| ---------- | ------------------------------------------------------- |
| Commits    | Conventional Commits format                             |
| Types      | feat, fix, refactor, docs, test, chore, ci, style, perf |
| Branches   | `<type>/<scope>/<description>`                          |
| Versioning | Semantic Versioning 2.0.0                               |
| Patch      | Bug fixes, docs, internal refactoring                   |
| Minor      | New features (breaking in 0.x)                          |
| Major      | Breaking changes (post-1.0) or v1.0.0 release           |
| Changelog  | Keep a Changelog format with emojis                     |
| PRs        | Clear title, description, checklist                     |
