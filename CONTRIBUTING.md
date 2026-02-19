# Contributing to Zacatl

Thank you for your interest in contributing! This guide will help you get started with development, testing, and submitting changes.

## Getting Started

### Prerequisites

- **Node.js**: 24+
- **npm**: 10.9.0+
- **Git**: latest stable

### Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/sentzunhat/zacatl.git
   cd zacatl
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Verify setup:**
   ```bash
   npm run type:check
   npm run lint
   npm test
   ```

### Development Workflow

```bash
# Watch mode for development
npm run build:watch    # TypeScript compilation
npm run test:watch     # Run tests and watch for changes

# In another terminal:
npm run lint          # ESLint check
npm run type:check    # TypeScript type checking
```

---

## Standards & Guidelines

All code must follow the standards documented in [docs/guidelines/](./docs/guidelines/):

- **Code Style**: [code-style.md](./docs/guidelines/code-style.md) — Formatting, naming, language rules
- **Architecture**: [architecture.md](./docs/guidelines/architecture.md) — Folder structure, layering, DI patterns
- **Testing**: [testing.md](./docs/guidelines/testing.md) — Test structure, naming, framework setup
- **Documentation**: [documentation.md](./docs/guidelines/documentation.md) — Comments, JSDoc, changelog
- **Git Workflow**: [git-workflow.md](./docs/guidelines/git-workflow.md) — Commits, versioning, PRs

### Quick Checklist

Before committing code:

- ✅ Naming follows conventions (PascalCase classes, camelCase functions, kebab-case files)
- ✅ Code passes linting: `npm run lint`
- ✅ TypeScript strict mode: `npm run type:check`
- ✅ All new features/fixes include tests
- ✅ Tests pass: `npm test`
- ✅ File organization matches architecture patterns
- ✅ JSDoc added for public APIs
- ✅ Commit message follows Conventional Commits format

---

## Making Changes

### 1. Create a Feature Branch

Follow the branch naming convention from [git-workflow.md](./docs/guidelines/git-workflow.md):

```bash
git checkout -b feat/<scope>/<description>
# Examples:
git checkout -b feat/error/add-forbidden-error
git checkout -b fix/service/handle-null-connections
git checkout -b docs/api/update-endpoints
```

### 2. Make Your Changes

**Keep changes focused:** One feature or bug fix per PR.

**Follow architecture patterns:**

- Domain logic stays in `src/service/layers/domain/`
- HTTP handlers in `src/service/layers/application/`
- Repositories in `src/service/layers/infrastructure/`
- External integrations as adapters

**Write tests first (TDD recommended):**

```bash
# Create test file matching source structure
test/unit/my-feature/my-feature.test.ts

# Write test, then implement
npm run test:watch
```

### 3. Validate Your Work

Run all checks locally:

```bash
npm run type:check      # Type checking
npm run lint            # Linting
npm run lint:fix        # Auto-fix lint issues
npm test                # All tests
npm run test:coverage   # Coverage report
npm run build           # Clean build
```

**Fix any issues before committing.**

### 4. Commit with Conventional Commits

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Examples:**

```bash
git commit -m "feat(error): add ForbiddenError class

Introduces 403 Forbidden error for permission-denied scenarios.
Extends CustomError with code 403 and provides metadata support.

Fixes #42"

git commit -m "fix(service): handle null database connections"

git commit -m "docs(readme): add examples section"

git commit -m "refactor(di-container): simplify auto-registration"
```

**Type options:** `feat`, `fix`, `refactor`, `perf`, `docs`, `test`, `chore`, `ci`, `style`

### 5. Submit a Pull Request

1. **Push your branch:**

   ```bash
   git push origin feat/error/add-forbidden-error
   ```

2. **Create PR on GitHub** with:
   - **Title:** Same format as commit message (e.g., "feat(error): add ForbiddenError class")
   - **Description:** Use the template below

3. **PR Description Template:**

   ```markdown
   ## Description

   Brief summary of changes.

   ## Type of Change

   - [ ] Feature (new functionality)
   - [ ] Fix (bug fix)
   - [ ] Breaking change
   - [ ] Documentation only
   - [ ] Refactoring

   ## Related Issues

   Fixes #42
   Relates to #88

   ## Testing

   - [ ] Added tests
   - [ ] All tests pass (`npm test`)
   - [ ] Coverage maintained or improved

   ## Checklist

   - [ ] Code follows style guide
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No breaking changes (or documented)
   - [ ] Changelog entry added (if required)
   ```

---

## Handling Different Change Types

### Adding a New Feature

1. Create branch: `feat/service/<feature-name>`
2. Add to appropriate layer (domain, application, infrastructure)
3. Add tests covering happy path and error cases
4. Update JSDoc with `@example` if public API
5. Update changelog if significant

**Example:** Adding a new error type

```typescript
// src/error/forbidden.ts
export interface ForbiddenErrorArgs extends CustomErrorsArgs {}

export class ForbiddenError extends CustomError {
  constructor({ message, reason, metadata, error }: ForbiddenErrorArgs) {
    super({
      message,
      code: 403,
      reason,
      metadata,
      error,
    });
  }
}
```

```typescript
// test/unit/error/forbidden.test.ts
describe("ForbiddenError", () => {
  it("should set code to 403", () => {
    const error = new ForbiddenError({ message: "Access denied" });
    expect(error.code).toBe(403);
  });
});
```

### Fixing a Bug

1. Create branch: `fix/<scope>/<bug-description>`
2. Add regression test that fails before fix, passes after
3. Keep fix minimal and focused
4. Update changelog with fix entry

### Updating Documentation

1. Create branch: `docs/<area>/<change>`
2. No code changes needed (usually)
3. Update affected `.md` files
4. Check links work and examples are correct

### Refactoring Code

1. Create branch: `refactor/<area>/<description>`
2. Ensure **all tests still pass** (no behavior change)
3. Run coverage to ensure no regression
4. Keep commits small and focused

---

## Code Review Process

**What reviewers will check:**

- ✅ Commit messages follow Conventional Commits
- ✅ Code follows style guide (naming, formatting, imports)
- ✅ Tests added for new features/fixes
- ✅ Tests pass locally: `npm test`
- ✅ Architecture patterns followed (layering, DI, adapters)
- ✅ No debug code or console.logs left behind
- ✅ Documentation updated (JSDoc, README, changelog)
- ✅ No breaking changes (or clearly documented)
- ✅ Reasonable scope (focused changes)

**How to respond to feedback:**

- 🟢 **Approve** — Submit PR for merge
- 🟡 **Comment** — Discussion, no action needed
- 🟠 **Request Changes** — Address feedback and push new commits
- 🔴 **Block (rare)** — Fundamental issues, discuss with maintainers

**Pushing updates to PR:**

```bash
# Make changes locally
git add .
git commit -m "refactor: address review feedback"
git push origin feat/<branch-name>
# PR auto-updates; no need to close/reopen
```

---

## Common Tasks

### Running Tests

```bash
npm test                # Run all once
npm run test:watch     # Watch mode
npm run test:coverage  # With coverage report
```

### Testing a Specific File

```bash
npm test -- error/bad-request.test.ts
npm run test:watch -- service/service.test.ts
```

### Fixing Lint Issues

```bash
npm run lint           # See issues
npm run lint:fix       # Auto-fix where possible
```

### Building for Release

```bash
npm run clean:build    # Clean old build
npm run build          # Full build
npm run type:check     # Verify types
npm run test           # Final test run
```

### Viewing Coverage

```bash
npm run test:coverage
open coverage/index.html  # macOS
# or
firefox coverage/index.html  # Linux
xdg-open coverage/index.html  # Linux alternative
```

---

## Release Process

Maintainers handle releases. For reference, see [git-workflow.md](./docs/guidelines/git-workflow.md#release-procedure).

**What you should know:**

- Versions follow Semantic Versioning (MAJOR.MINOR.PATCH)
- Changelog updated in `docs/changelog.md`
- Use [Keep a Changelog](https://keepachangelog.com/) format
- Each entry uses emoji categories (✨ ✅ 🐛 🔧 📚, etc.)

---

## Getting Help

### Questions?

- 📖 **Check docs/guidelines/** first
- 💬 **Open a discussion** on GitHub
- 🐛 **Found a bug?** Open an issue with reproduction steps

### Want to Learn More?

- [Architecture Overview](./docs/guidelines/framework-overview.md)
- [API Reference](./docs/service/README.md)
- [Examples](./examples/)
- [Test Coverage Roadmap](./docs/roadmap/testing-roadmap.md)

---

## Common Issues & Solutions

### "Tests failing after setup"

```bash
# Clean and reinstall
rm -rf node_modules build dist
npm install
npm test
```

### "Lint errors on commit"

```bash
npm run lint:fix  # Auto-fix most issues
npm run lint      # Check remaining
```

### "Type checking fails"

```bash
npm run type:check  # See errors
# Fix and retry
npm run type:check
```

### "Build produces large output"

```bash
npm run clean:build  # Remove old artifacts
npm run build        # Fresh build
```

---

## Code of Conduct

- Be respectful and inclusive
- Assume good intent
- Help others learn
- Report violations to maintainers

---

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).

---

Thank you for contributing to Zacatl! 🙏
