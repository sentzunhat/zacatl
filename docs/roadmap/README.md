# Zacatl Roadmap - Future Features

This directory contains specifications and documentation for features planned for future releases. These features are **not currently implemented** in the framework.

## Current Status: Deferred Features

The following features are documented here but are not part of the current production scope:

### CLI Service Feature

**Status:** Specification Only
**Target:** Future Release (v0.2.0+)
**Folder:** [cli-service-feature/](./cli-service-feature/)

Command-line interface support for building CLI applications using Zacatl's architecture patterns.

**Included Specs:**

- CLI module specification
- Command pattern implementation
- CLI application tutorial

### Desktop Service Feature

**Status:** Specification Only
**Target:** Future Release (v0.3.0+)
**Folder:** [desktop-service-feature/](./desktop-service-feature/)

Desktop application support with IPC handlers for Neutralino and Electron platforms.

**Included Specs:**

- Desktop module specification
- Platform adapter patterns (Neutralino, Electron, Tauri)
- IPC communication patterns

### Multi-Context Architecture

**Status:** ✅ Complete (v0.0.32)
**File:** [v0.0.26-to-v0.1.0.md](./v0.0.26-to-v0.1.0.md), [multi-context-design.md](./multi-context-design.md)

Unified architecture supporting CLI, Desktop, and Server contexts from a single codebase.

---

## Current Production Scope

**Zacatl currently supports:**

- ✅ HTTP server applications (Fastify, Express)
- ✅ SQLite database (via Sequelize)
- ✅ MongoDB database (via Mongoose)
- ✅ REST API development
- ✅ Layered architecture (Infrastructure, Domain, Application)
- ✅ Dependency injection

**Not yet supported:**

- ❌ CLI applications
- ❌ Desktop applications
- ❌ Multi-context service types

---

## For Contributors

If you're interested in implementing these features:

1. Review the specifications in the respective folders
2. Check the current framework architecture in `src/service/`
3. Ensure backward compatibility with existing HTTP server patterns
4. Submit proposals via GitHub Issues before major implementation work

---

## Migration Notes

These specifications were moved from the main documentation to clarify the current production scope. They remain valuable references for future development but should not be confused with currently available features.

**Last Updated:** February 5, 2026
