# Code Guidelines

This folder contains reusable coding standards and best practices extracted from the Zacatl codebase. These guidelines are intentionally generic so they can be adapted and applied to other projects.

## Documents

1. **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** — One-page cheat sheet (print-friendly!)
2. **[code-style.md](./code-style.md)** — Formatting, naming conventions, language-specific rules, and editor settings
3. **[architecture.md](./architecture.md)** — Folder structure, module organization, layering patterns, and dependency management
4. **[testing.md](./testing.md)** — Test structure, naming conventions, test framework setup, and coverage expectations
5. **[documentation.md](./documentation.md)** — Comment and docstring conventions, README guidelines, changelog format
6. **[git-workflow.md](./git-workflow.md)** — Commit message formats, branch naming, versioning strategy, release procedure
7. **[framework-overview.md](./framework-overview.md)** — High-level framework map and module index

## Quick Reference

### Language & Tools

- **Language**: TypeScript (strict mode)
- **Runtime**: Node.js 24+
- **Package Manager**: npm 10.9.0+
- **Build**: TypeScript compiler (tsc) + path alias resolution + ESM fixing
- **Testing**: Vitest
- **Linting**: ESLint (flat config)

### Core Patterns

- **Architecture**: Hexagonal/Layered (Application, Domain, Infrastructure, Platforms)
- **DI**: Container-based with auto-registration
- **Configuration**: JSON/YAML with Zod schema validation
- **Module System**: ES Modules (ESM)

### Naming at a Glance

| Type         | Convention       | Example                                  |
| ------------ | ---------------- | ---------------------------------------- |
| Classes      | PascalCase       | `GetRouteHandler`, `BadRequestError`     |
| Functions    | camelCase        | `createLogger`, `resolveDependency`      |
| Interfaces   | PascalCase       | `BadRequestErrorArgs`, `ConfigServer`    |
| Type Aliases | PascalCase       | `Constructor<T>`, `LoggerPort`           |
| Files        | kebab-case       | `get-route-handler.ts`, `bad-request.ts` |
| Folders      | kebab-case       | `dependency-injection/`, `error-guards/` |
| Constants    | UPPER_SNAKE_CASE | `DatabaseVendor.MONGOOSE`                |

## How to Use These Guides

### For New Contributors

1. Start with **[CONTRIBUTING.md](../../CONTRIBUTING.md)** — Setup, workflow, PR process
2. Reference **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** during development
3. Check specific guides for detailed rules (code-style, testing, etc.)
4. Bookmark this folder for quick access

### For Code Review

1. Use **[git-workflow.md](./git-workflow.md)** to validate commit messages and branches
2. Check **[code-style.md](./code-style.md)** for naming and formatting
3. Reference **[testing.md](./testing.md)** for test coverage expectations
4. Verify **[architecture.md](./architecture.md)** patterns are followed

### For New Projects

1. Read [architecture.md](./architecture.md) to understand the folder structure
2. Review [code-style.md](./code-style.md) for formatting and naming rules
3. Set up your editor and linter according to the style guide
4. Check [testing.md](./testing.md) to configure your test framework

### For Existing Projects

1. Compare your codebase against these standards
2. Adapt rules to your tech stack (swapping tools/frameworks as needed)
3. Update your linter and formatter configurations to match
4. Document any deviations in a local STYLE_VARIATIONS.md

### For Teams

1. Share these guidelines with team members
2. Use [git-workflow.md](./git-workflow.md) to align on versioning and commits
3. Set up lint hooks and type checking (see [code-style.md](./code-style.md))
4. Review PRs for compliance with architectural patterns

## Notes

- **`> Inferred`** — Rules marked with this note are not explicitly documented in the source codebase but inferred from actual usage patterns
- **`[Tech Stack Specific]`** — Rules that depend on specific tools; adapt for your stack
- All examples are illustrative and should be adjusted for your domain and language

---

## Document Sizes & Scope

- **code-style.md** — ~3–4 KB (code formatting, naming, editor config)
- **architecture.md** — ~4–5 KB (folder structure, layering, DI patterns)
- **testing.md** — ~2–3 KB (test file naming, structure, framework setup)
- **documentation.md** — ~2–3 KB (JSDoc, comments, changelog format)
- **git-workflow.md** — ~3–4 KB (commits, versioning, release procedure)

Each document is self-contained but cross-references others where relevant.
