# Version Updates and Release Procedure

This document defines the versioning strategy and release procedure for Zacatl.

## Semantic Versioning

Zacatl follows [Semantic Versioning 2.0.0](https://semver.org/):

**Format:** `MAJOR.MINOR.PATCH` (e.g., `0.0.39`)

### Version 0.x.x (Pre-1.0 - Current Phase)

During pre-1.0 development:

- **PATCH** (`0.0.x`) - Bug fixes, documentation updates, minor improvements
- **MINOR** (`0.x.0`) - New features, breaking changes (allowed in 0.x)
- **MAJOR** (`x.0.0`) - Reserved for 1.0.0 stable release

### Version 1.x.x+ (Post-1.0 - Future)

After 1.0.0 release:

- **PATCH** (`x.x.1`) - Bug fixes, documentation, no breaking changes
- **MINOR** (`x.1.0`) - New features, backward compatible
- **MAJOR** (`1.0.0`) - Breaking changes, major architectural shifts

---

## When to Increment

### Patch Version (0.0.x → 0.0.x+1)

Increment for:

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

### Minor Version (0.x.0 → 0.x+1.0)

Increment for:

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

Ask:

- Are there breaking changes? → **Minor** (in 0.x) / **Major** (in 1.x+)
- Are there new features? → **Minor**
- Only fixes/docs? → **Patch**

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

### 4. Build and Test

Verify the package builds and tests pass:

```bash
npm run clean
npm run build
npm run type:check
npm run lint
npm test
```

### 5. Commit Changes

```bash
git add package.json docs/changelog.md
git commit -m "chore: release v0.0.40"
git tag v0.0.40
```

### 6. Publish to npm

```bash
npm publish
```

### 7. Push to GitHub

```bash
git push origin main
git push origin v0.0.40
```

---

## Pre-Publish Checklist

Before running `npm publish`:

- [ ] `package.json` version updated
- [ ] `docs/changelog.md` has new entry with correct date
- [ ] All tests pass (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] TypeScript checks pass (`npm run type:check`)
- [ ] Linting passes (`npm run lint`)
- [ ] Examples still work (spot-check at least one)
- [ ] README.md version badge matches (if applicable)

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
4. Run build + tests
5. Commit + tag
6. npm publish
7. Push to GitHub
```

---

**Related:**

- [Changelog](../changelog.md) - Full release history
- [Architecture](../guidelines/framework-overview.md) - System overview
