# Zacatl Docs

All project documentation is organized here.

If you are new to this repository, start with [START_HERE.md](./start-here.md).

> **AI agents / LLMs:** start with [`llms.txt`](./llms.txt) for a compact
> machine-readable project summary, import patterns, and module index.

> **For AI agents:** This repository is configured with Copilot instructions including workflow setup, standards, and context-intake rules. See [.github/copilot-instructions.md](../.github/copilot-instructions.md) and [.github/instructions/](../.github/instructions/).

## Guides

- [Guidelines & Standards](guidelines/README.md) — code style, architecture, testing, git workflow
- [Framework Overview](guidelines/framework-overview.md)
- [Quick Reference](guidelines/quick-reference.md)
- [Documentation Guidelines](documentation-guidelines.md)
- [AI Context Pack](context/README.md)

## Module Docs

- [Service & Platforms](service/README.md)
- [Dependency Injection](dependency-injection/README.md)
- [Configuration](configuration/README.md)
- [Errors](error/README.md)
- [Logging](logs/README.md)
- [Localization](localization/README.md)
- [Third-party / ORM](third-party/README.md)
- [ESLint](eslint/README.md)
- [Utils](utils/README.md)

## Implementation Status Notes

- `ServiceType.SERVER` is the currently runnable platform.
- `ServiceType.CLI` and `ServiceType.DESKTOP` exist as contract shapes and currently throw on startup/entrypoint registration.

## Reference

- [Dependencies reference](third-party/dependencies-reference.md)
- [SQLite Sequelize → node:sqlite migration](migration/sequelize-sqlite-to-nodesqlite.md)
- [Dev vs Publish Export Patterns](service/dependency-exports.md#development-vs-publish-export-patterns)
- [Changelog](changelog.md)
- [Roadmap](roadmap/index.md)
- [Skills: Version updates](skills/version-updates.md)
