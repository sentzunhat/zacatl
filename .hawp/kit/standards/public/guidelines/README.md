# Standards & Guidelines

Reference documentation for code style, architecture, testing, and workflow across all projects.

These guidelines are **principles-based, not dogmatic**. Use professional judgment; exceptions for good reasons are acceptable. When in doubt, prioritize code clarity and maintainability.

## Files

- **[code-style.md](code-style.md)** — TypeScript conventions, naming, formatting, and import patterns.
- **[architecture.md](architecture.md)** — Layered/hexagonal architecture, module organization, and DI patterns.
- **[testing.md](testing.md)** — Vitest setup, test structure, mocking, and coverage guidance.
- **[documentation.md](documentation.md)** — JSDoc, inline comments, READMEs, and changelogs.
- **[git-workflow.md](git-workflow.md)** — Plain-sentence commit messages, branch naming, versioning, and PR flow.
- **[security.md](security.md)** — Input validation, authentication, headers, and dependency hygiene.
- **[mongodb-schema-design.md](mongodb-schema-design.md)** — Embedding, minimalism, and property naming for MongoDB.
- **[adr-template.md](adr-template.md)** — Architecture Decision Record template for recording design choices.

## Quick Start

1. **New TypeScript project?** Start with **code-style.md** and **architecture.md**.
2. **Adding tests?** Refer to **testing.md**.
3. **Writing docs/comments?** Check **documentation.md**.
4. **Making a release?** Use **git-workflow.md** and update changelog per **documentation.md**.
5. **Storing data?** See **mongodb-schema-design.md** (if using MongoDB).
6. **Handling auth/secrets?** Review **security.md**.

## Core Principles (All Projects)

- **Type safety first** — strict TypeScript, Zod validation at boundaries, no untyped code.
- **Test behavior, not implementation** — aim for 70–90% coverage on domain/application layers.
- **Document public APIs** — JSDoc for functions, classes, and interfaces; skip for obvious private code.
- **Plain-sentence commits** — one lowercase sentence per commit; no `feat:` / `fix:` prefixes (see git-workflow.md).
- **Fail securely** — validate all input, log strategically (no PII/tokens), return generic errors to clients.
- **Modular by feature** — organize code by business domain, not by type (services/, handlers/, repos/ as subfolders, not top-level).

## Standards Precedence

When standards conflict, use this precedence order:

1. Enforced repository config (lint, type config, formatter, scripts).
2. Repeated, currently active codebase patterns.
3. Prose docs in the current repository.
4. External/reference documentation.

Practical rule: if prose and enforced tooling disagree, follow enforced tooling and update docs.

## Using These Guidelines

✅ **Do:**

- Reference these files during code review and PR feedback.
- Adapt patterns to your project's specific needs.
- Update guidelines when you discover better practices.
- Link to specific sections in your project's README or CONTRIBUTING.md.

❌ **Don't:**

- Treat guidelines as absolute rules; professional judgment applies.
- Copy/paste guidelines into project docs; link or reference instead.
- Ignore security and type safety guidance — these are non-negotiable.

## Feedback & Updates

If a guideline doesn't fit your workflow or you discover an improvement, document it and discuss with the team. Shared standards only work when they reflect actual practice.
