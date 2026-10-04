# Version Updates and Release Procedure

This document defines the versioning strategy and release procedure for Zacatl.

## Semantic Versioning

Zacatl uses a three-part version number, with an explicit `0.0.x` initial
development policy before the usual pre-1.0 version rules below:

**Format:** `MAJOR.MINOR.PATCH` (e.g., `0.0.39`)

### Version 0.x.x (Pre-1.0 - Current Phase)

Before the first `0.1.0` release, Zacatl is in the `0.0.x` initial
development series. The public API is not yet stable, and a `0.0.x` patch
release may include breaking changes, new features, bug fixes, documentation,
or other improvements. Increment the patch number for each published
development release; do not treat a `0.0.x` increment as a compatibility
promise.

Starting with `0.1.0`, use these rules for later pre-1.0 releases:

- **PATCH** (`0.x.y`) - Bug fixes, documentation updates, minor improvements
- **MINOR** (`0.(x+1).0`) - New features and breaking changes
- **MAJOR** (`x.0.0`) - Reserved for 1.0.0 stable release

### Version 1.x.x+ (Post-1.0 - Future)

After 1.0.0 release:

- **PATCH** (`x.x.1`) - Bug fixes, documentation, no breaking changes
- **MINOR** (`x.1.0`) - New features, backward compatible
- **MAJOR** (`1.0.0`) - Breaking changes, major architectural shifts

---

## When to Increment

### Patch Version (for example, 0.1.0 → 0.1.1)

Before `0.1.0`, increment for each development publication. This series may
contain breaking changes and improvements because the API is still evolving.
From `0.1.0` onward, increment for:

- ✅ Bug fixes (no API changes)
- ✅ Documentation improvements
- ✅ Internal refactoring (no public API impact)
- ✅ Performance improvements
- ✅ Test additions/improvements
- ✅ Dependency updates (non-breaking)
- ✅ Type definition fixes

**Examples:**

- Fixing a broken import path
- Correcting documentation errors
- Optimizing internal algorithms
- Adding missing JSDoc comments

### Minor Version (from 0.1.0: 0.x.0 → 0.(x+1).0)

From `0.1.0` onward, increment for:

- ✅ New features or modules
- ✅ New public APIs
- ✅ New framework adapters (Express, Fastify, etc.)
- ✅ Breaking changes (allowed in 0.x)
- ✅ New platform support (CLI, Desktop)
- ✅ Significant architectural changes

**Examples:**

- Adding Express adapter support
- Introducing new Service configuration options
- Adding new error classes
- Changing repository API (in 0.x this is minor, not major)

### Major Version (1.0.0+)

Increment for:

- ✅ First stable release (0.x.x → 1.0.0)
- ✅ Breaking API changes (post-1.0 only)
- ✅ Removal of deprecated features
- ✅ Complete architectural rewrites

**Examples:**

- Releasing 1.0.0 stable
- Removing deprecated APIs (post-1.0)
- Changing core Service API structure (post-1.0)

---

## Release Procedure

### 1. Determine Version Bump

Review changes since last release:

```bash
git log v0.0.39..HEAD --oneline
```

Ask (for releases from `0.1.0` onward):

- Are there breaking changes? → **Minor** (in 0.x) / **Major** (in 1.x+)
- Are there new features? → **Minor**
- Only fixes/docs? → **Patch**

For a release before `0.1.0`, use the next `0.0.x` patch version even when
the development changes include new features or breaking API changes. Call
out those changes clearly in the changelog and migration guidance. The first
`0.1.0` release establishes the point from which the pre-1.0 minor-bump rule
above applies.

### 2. Update package.json

```bash
# Manually edit package.json or use npm version
npm version patch   # 0.0.39 → 0.0.40
npm version minor   # 0.0.39 → 0.1.0
npm version major   # 0.0.39 → 1.0.0
```

### 3. Update docs/changelog.md

Add new entry at the top (right after first `---`):

```markdown
---

## [0.0.40] - 2026-02-XX

**Status**: Current release

### ✨ Improvements

- Feature or improvement description

### 🐛 Fixes

- Bug fix description

### 🔧 Architecture

- Architectural change description

### 📚 Documentation

- Documentation update description

### 🗺️ Roadmap

- Roadmap item or in-progress work

---

## [0.0.39] - 2026-02-17

...
```

**Emoji Categories:**

- `✨` - Improvements / New Features
- `🐛` - Fixes / Bug fixes
- `🔧` - Architecture / Maintenance / Refactoring
- `📚` - Documentation
- `🗺️` - Roadmap / In-progress work
- `⚠️` - Breaking Changes (rare in patch)

### 4. Verify with Dry Run

Run the full publish pipeline in dry-run mode — this runs every guard (version check, barrels,
tests, type-check, lint, build) and a `--dry-run` npm publish so you can inspect the tarball
contents before committing to release:

```bash
npm run publish:dry
```

All steps must pass before proceeding.

### 5. Commit Changes

```bash
git add package.json docs/changelog.md
git commit -m "bump version to 0.0.40 and update changelog"
git tag v0.0.40
```

### 6. Publish to npm

```bash
# Standard publish (prompts for OTP if 2FA enabled)
npm run publish:latest

# If OTP is required inline
npm run publish:otp
```

### 7. Push to GitHub

```bash
git push origin main
git push origin v0.0.40
```

---

## Pre-Publish Checklist

Before running `npm run publish:latest`:

- [ ] `package.json` version updated
- [ ] `docs/changelog.md` has new entry with correct date
- [ ] `npm run publish:dry` passes end-to-end (no errors, no npm warnings)
- [ ] Git is clean (all changes committed)
- [ ] Tag created (`git tag vX.Y.Z`)

---

## Examples Versioning

Examples in `/examples` folder:

- Use `workspace:*` to reference local `@sentzunhat/zacatl` during development
- Published examples use exact version from npm
- Update example `package.json` files when releasing major/minor versions

---

## Changelog Style Guide

### Entry Format

```markdown
## [VERSION] - YYYY-MM-DD

**Status**: Current release | Patch release | etc.

### ✨ Category

- **Feature Name**: Brief description of change
- One-liner changes without bold header
```

### Writing Style

- **Past tense**: "Added", "Fixed", "Improved" (not "Add", "Fix", "Improve")
- **Factual**: State what changed, not marketing language
- **Concise**: One line per change, expand only if needed
- **User-facing**: Focus on what users will notice, not internal refactors (unless significant)

### Example Entry

```markdown
## [0.0.39] - 2026-02-17

**Status**: Current release

### ✨ Improvements

- **Unified ESM Fix Script**: Consolidated fix scripts into single `fix-esm.mjs`
- **Express Framework Support**: Full Express.js handler implementation

### 🐛 Fixes

- Fixed repository DI auto-registration
- Corrected import paths for package exports

### 📚 Documentation

- Added REST handlers guide
- Updated service module documentation
```

---

## Version Workflow Summary

```
1. Check git log → Determine version bump (patch/minor/major)
2. Update package.json version
3. Add entry to docs/changelog.md (top, after first ---)
4. npm run publish:dry  → full verification + tarball preview (must pass)
5. Commit + tag
6. npm run publish:latest  → actual publish
7. Push to GitHub (branch + tag)
```

---

**Related:**

- [Changelog](../changelog.md) - Full release history
- [Architecture](../guidelines/framework-overview.md) - System overview
