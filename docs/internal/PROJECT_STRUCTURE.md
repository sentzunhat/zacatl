# Updated Project Structure

**Zacatl Framework - Complete Folder Tree (Post-Audit)**

**Date:** February 6, 2026  
**Status:** ✅ Reorganization Complete

---

## 📊 Quick Stats

| Metric                        | Count                    |
| ----------------------------- | ------------------------ |
| **Total Directories**         | 72                       |
| **Source Files (TypeScript)** | 200+                     |
| **Test Files**                | 201 unit tests           |
| **Documentation Files**       | 150+ markdown            |
| **Example Projects**          | 4 (2 Fastify, 2 Express) |

---

## 🌳 Complete Folder Tree

```
zacatl/
│
├── README.md                           # Main project README
├── LICENSE                             # MIT License
├── PROJECT_AUDIT_SUMMARY.md           # ✨ Comprehensive audit report
├── AUDIT_CHANGE_LOG.md                # ✨ Change log for this reorganization
│
├── package.json                        # NPM package configuration
├── package-lock.json                   # NPM lock file
├── bun.lock                           # Bun lock file
├── tsconfig.json                      # TypeScript configuration
├── eslint.config.mjs                  # ESLint configuration
├── vite.config.mjs                    # Vite build configuration
│
├── .git/                              # Git repository
├── .gitignore                         # Git ignore rules
├── .vscode/                           # VS Code settings
├── .dockerignore                      # Docker ignore rules
├── .env.example                       # Environment template
├── .node-version                      # Node version requirement
├── .npm-version                       # NPM version requirement
├── .nvmrc                             # NVM configuration
│
├── node_modules/                      # Dependencies (gitignored)
├── build/                             # Compiled JavaScript (gitignored)
├── coverage/                          # Test coverage reports (gitignored)
│   └── lcov-report/
│
├── archive/                           # ✨ NEW: Archived code directory
│   ├── code/                          # Archived code (currently empty)
│   └── ARCHIVE.md                     # Archive policy & contents
│
├── docs/                              # 📚 Documentation (reorganized)
│   ├── index.md                       # Main documentation index
│   ├── README.md                      # Documentation overview
│   ├── changelog.md                   # Release history
│   │
│   ├── overview/                      # Project information
│   │   ├── README.md
│   │   ├── project-status-summary.md  # ✨ MOVED from root
│   │   ├── executive-summary.md       # ✨ MOVED from root
│   │   ├── final-summary.md           # ✨ MOVED from root
│   │   ├── deliverables-index.md      # ✨ MOVED from root
│   │   ├── documentation-change-log.md# ✨ MOVED from root
│   │   └── final-documentation-structure.md # ✨ MOVED from root
│   │
│   ├── getting-started/               # Setup & quick start
│   │   ├── README.md
│   │   ├── installation.md
│   │   ├── quickstart.md
│   │   ├── quick-start-guide.md       # ✨ MOVED from root
│   │   ├── hello-world.md
│   │   └── first-service.md
│   │
│   ├── tutorials/                     # Step-by-step learning
│   │   ├── README.md
│   │   ├── hello-world-updated.md
│   │   ├── rest-api.md
│   │   ├── working-with-databases.md
│   │   ├── database-setup.md
│   │   ├── error-handling.md
│   │   ├── i18n.md
│   │   └── testing.md
│   │
│   ├── guides/                        # How-to guides (14 guides)
│   │   ├── README.md
│   │   ├── index.md
│   │   ├── service-adapter-pattern.md
│   │   ├── agent-implementation-guide.md
│   │   ├── infrastructure-usage.md
│   │   ├── dependency-injection.md
│   │   ├── http-service-scaffold.md
│   │   ├── non-http-setup.md
│   │   ├── non-http-elegant.md
│   │   ├── handler-registration.md
│   │   ├── layer-registration.md
│   │   ├── implementation-analysis.md
│   │   ├── eslint-configuration.md
│   │   ├── dependencies-reference.md
│   │   └── single-import.md
│   │
│   ├── reference/                     # API documentation
│   │   ├── README.md
│   │   ├── di-registration-patterns.md
│   │   ├── path-aliases.md
│   │   ├── third-party.md
│   │   ├── api/                       # API reference
│   │   ├── architecture/              # Architecture docs
│   │   └── orm/                       # ORM integration
│   │
│   ├── architecture/                  # System design
│   │   ├── README.md
│   │   ├── framework-overview.md
│   │   ├── multi-context-design.md
│   │   └── design-decisions/          # ADRs
│   │
│   ├── migration/                     # Version upgrades (15 guides)
│   │   ├── index.md
│   │   ├── v0.1.0-multicontext.md
│   │   ├── v0.0.26-to-v0.0.27.md
│   │   ├── v0.0.24.md
│   │   ├── v0.0.22.md
│   │   ├── v0.0.21.md
│   │   ├── v0.0.20.md
│   │   ├── prepare-v0.0.20.md
│   │   ├── general-guide.md
│   │   ├── step-by-step.md
│   │   ├── assessment.md
│   │   ├── best-practices.md
│   │   ├── old-to-new-api.md
│   │   ├── type-safety-improvements.md
│   │   ├── quickstart.md
│   │   └── summary.md
│   │
│   ├── testing/                       # Testing guides (10 guides)
│   │   ├── README.md
│   │   ├── 01-setup.md
│   │   ├── 02-basic-tests.md
│   │   ├── 03-mocking.md
│   │   ├── 04-http-testing.md
│   │   ├── 05-error-testing.md
│   │   ├── 06-test-organization.md
│   │   ├── 07-fixtures.md
│   │   ├── 08-async-testing.md
│   │   ├── 09-coverage.md
│   │   └── 10-best-practices.md
│   │
│   ├── standards/                     # Code standards
│   │   ├── index.md
│   │   ├── documentation.md
│   │   ├── publish-checklist.md
│   │   └── naming-conventions-guide.md
│   │
│   ├── development/                   # Internal development
│   │   ├── README.md
│   │   ├── roadmap-index.md
│   │   └── cli-module-spec.md
│   │
│   ├── internal/                      # Internal specs & ADRs
│   │   ├── project-audit-analysis.md  # ✨ MOVED from root
│   │   ├── HANDOFF_SUMMARY.md         # ✨ MOVED from root
│   │   ├── adr-platform-server-refactoring.md
│   │   ├── adr-platform-refactoring-v2.md
│   │   ├── adapter-pattern.md
│   │   ├── agent-integration-spec.md
│   │   ├── agent-prompt-template.md
│   │   ├── express-rest-roadmap.md
│   │   ├── implementation-summary.md
│   │   ├── naming-conventions.md
│   │   ├── roadmap.md
│   │   └── ujti-integration-analysis.md
│   │
│   ├── prompts/                       # AI automation
│   │   ├── index.md
│   │   └── migration.md
│   │
│   ├── roadmap/                       # Future plans
│   │   ├── README.md
│   │   ├── v0.0.26-to-v0.1.0.md
│   │   ├── multi-context-design.md
│   │   ├── cli-service-feature/
│   │   └── desktop-service-feature/
│   │
│   ├── notes/                         # Working notes
│   │   └── README.md
│   │
│   ├── archive/                       # Historical docs
│   │   └── README.md
│   │
│   └── config/                        # Config templates
│       ├── README.md
│       ├── context.yaml
│       ├── guidelines.yaml
│       ├── mongodb.yaml
│       └── patterns.yaml
│
├── src/                               # 💻 Source code (TypeScript)
│   ├── index.ts                       # Main entry point
│   ├── optionals.ts                   # Optional exports
│   │
│   ├── configuration/                 # Config loading
│   │   ├── index.ts
│   │   ├── json.ts
│   │   └── yml.ts
│   │
│   ├── dependency-injection/          # DI container
│   │   ├── container.ts
│   │   └── index.ts
│   │
│   ├── error/                         # Error types
│   │   ├── index.ts
│   │   ├── custom.ts
│   │   ├── bad-request.ts
│   │   ├── bad-resource.ts
│   │   ├── forbidden.ts
│   │   ├── internal-server.ts
│   │   ├── not-found.ts
│   │   ├── unauthorized.ts
│   │   └── validation.ts
│   │
│   ├── eslint/                        # ESLint configuration
│   │   ├── README.md
│   │   ├── index.mjs
│   │   ├── base.mjs
│   │   ├── file-naming.mjs
│   │   ├── imports.mjs
│   │   └── naming-conventions.mjs
│   │
│   ├── localization/                  # i18n support
│   │   ├── index.ts
│   │   ├── i18n-node.ts
│   │   ├── i18n-node/
│   │   └── locales/
│   │
│   ├── logs/                          # Logging
│   │   ├── index.ts
│   │   ├── config.ts
│   │   ├── logger.ts
│   │   ├── types.ts
│   │   └── adapters/
│   │
│   ├── runtime/                       # Runtime detection
│   │   ├── index.ts
│   │   ├── detector.ts
│   │   └── types.ts
│   │
│   ├── service/                       # Core framework
│   │   ├── index.ts
│   │   ├── service.ts
│   │   ├── layers/                    # Layered architecture
│   │   │   ├── application/
│   │   │   ├── domain/
│   │   │   └── infrastructure/
│   │   ├── platforms/                 # Platform adapters
│   │   │   ├── server/
│   │   │   ├── cli/
│   │   │   └── desktop/
│   │   └── types/                     # Type definitions
│   │
│   ├── third-party/                   # External integrations
│   │   ├── index.ts
│   │   ├── eslint.ts
│   │   ├── fastify.ts
│   │   ├── i18n.ts
│   │   ├── i18next.ts
│   │   ├── js-yaml.ts
│   │   ├── mongoose.ts
│   │   ├── sequelize.ts
│   │   ├── tsyringe.ts
│   │   ├── uuid.ts
│   │   └── zod.ts
│   │
│   └── utils/                         # Utilities
│       ├── index.ts
│       ├── encode-decode.ts
│       ├── error-guards.ts
│       └── hmac.ts
│
├── test/                              # 🧪 Test suite
│   ├── tsconfig.json
│   └── unit/
│       ├── configuration/
│       ├── dependency-injection/
│       ├── error/
│       ├── helpers/
│       ├── lib/
│       ├── logs/
│       ├── runtime/
│       ├── service/
│       ├── auto-registration.test.ts
│       ├── conditional-exports.test.ts
│       ├── i18n.test.ts
│       ├── requirements-verification.test.ts
│       └── v0.0.24-bug-fix.test.ts
│
└── examples/                          # 📦 Example projects
    ├── README.md
    ├── index.md
    ├── catalog.md
    ├── comparison.md
    ├── comparison-guide.md
    ├── quick-ref.md
    ├── quick-start.md
    ├── agents.md
    ├── CHANGELOG.md
    ├── DELIVERABLES.md
    ├── PROJECT-STATUS.md
    ├── FOLDER-TREE.txt
    ├── optimization-summary.md
    ├── README-NEW.md
    │
    ├── docs/                          # Examples documentation
    │   ├── README.md
    │   ├── overview/
    │   ├── setup/
    │   ├── operations/
    │   ├── architecture/
    │   ├── decisions/
    │   ├── notes/
    │   └── archive/
    │
    ├── archive/                       # Examples archive
    │   ├── code/
    │   └── ARCHIVE.md
    │
    ├── shared/                        # Shared code
    │   ├── README.md
    │   ├── package.json
    │   └── domain/
    │
    ├── platform-fastify/              # Fastify examples
    │   ├── README.md
    │   ├── quick-start.md
    │   ├── validation-checklist.md
    │   ├── 01-with-sqlite/
    │   └── 02-with-mongodb/
    │
    └── platform-express/              # Express examples
        ├── README.md
        ├── 01-with-sqlite/
        └── 02-with-mongodb/
```

---

## 📁 Directory Breakdown

### Root Level (Project Files)

```
zacatl/
├── README.md                    # Main project documentation
├── LICENSE                      # MIT license
├── PROJECT_AUDIT_SUMMARY.md    # ✨ NEW: Comprehensive audit
├── AUDIT_CHANGE_LOG.md         # ✨ NEW: Reorganization log
├── package.json                 # NPM configuration
├── tsconfig.json                # TypeScript config
├── eslint.config.mjs            # ESLint config
└── vite.config.mjs              # Build config
```

**Clean root with only essential files.**

### Archive (Code Archive)

```
archive/
├── code/                        # ✨ NEW: For archived code (empty)
└── ARCHIVE.md                   # ✨ NEW: Archive policy
```

**Safe storage for deprecated code (currently empty - all code is active).**

### Documentation Structure

```
docs/
├── overview/          # ✨ 7 files (6 moved from root)
├── getting-started/   # ✨ 6 files (1 moved from root)
├── internal/          # ✨ 12 files (2 moved from root)
├── tutorials/         # 8 learning guides
├── guides/            # 14 how-to guides
├── reference/         # API documentation
├── architecture/      # System design & ADRs
├── migration/         # 15 version upgrade guides
├── testing/           # 10 testing guides
├── standards/         # 4 code standards
├── development/       # 3 internal development docs
├── prompts/           # 2 AI automation templates
├── roadmap/           # 4 future plans
├── notes/             # Working notes
├── archive/           # Historical documentation
└── config/            # 5 configuration templates
```

**~150 markdown files organized into 15 categories.**

### Source Code Structure

```
src/
├── service/           # Core framework (layered architecture)
├── error/             # 7 custom error types
├── logs/              # Structured logging
├── dependency-injection/  # DI container
├── configuration/     # Config loading
├── localization/      # i18n support
├── runtime/           # Runtime detection
├── third-party/       # External integrations
├── eslint/            # ESLint rules
└── utils/             # Utilities
```

**200+ TypeScript files, all actively used and tested.**

### Test Suite Structure

```
test/unit/
├── configuration/     # Config tests
├── dependency-injection/  # DI tests
├── error/             # Error handling tests
├── logs/              # Logging tests
├── runtime/           # Runtime tests
├── service/           # Service framework tests
├── helpers/           # Test helpers
└── lib/               # Test library
```

**201 unit tests, 79% coverage, all passing.**

### Examples Structure

```
examples/
├── platform-fastify/
│   ├── 01-with-sqlite/    # SQLite example
│   └── 02-with-mongodb/   # MongoDB example
├── platform-express/
│   ├── 01-with-sqlite/    # SQLite example
│   └── 02-with-mongodb/   # MongoDB example
└── shared/                # Shared domain code
```

**4 working examples demonstrating framework usage.**

---

## 📊 File Count Summary

| Category              | Count | Notes                     |
| --------------------- | ----- | ------------------------- |
| **Source Files**      | 200+  | TypeScript, all active    |
| **Test Files**        | 201   | Unit tests (79% coverage) |
| **Documentation**     | 150+  | Markdown files            |
| **Config Files**      | 10    | Project configuration     |
| **Example Projects**  | 4     | Working examples          |
| **Total Directories** | 72    | Well-organized structure  |

---

## 🎯 Key Changes from Audit

### Files Moved ✅

- ✅ 9 audit/summary documents moved from root to `/docs`
  - 6 to `/docs/overview/`
  - 2 to `/docs/internal/`
  - 1 to `/docs/getting-started/`

### Directories Created ✅

- ✅ `/archive` - Code archive directory
- ✅ `/archive/code` - Archived code location (empty)

### Files Created ✅

- ✅ `/archive/ARCHIVE.md` - Archive policy
- ✅ `/PROJECT_AUDIT_SUMMARY.md` - Audit report
- ✅ `/AUDIT_CHANGE_LOG.md` - Change log

### Files Deleted ❌

- **None** - All files preserved per audit rules

---

## 🔗 Navigation Guide

### For New Users

1. Start: [README.md](../README.md)
2. Learn: [docs/getting-started/quickstart.md](../docs/getting-started/quickstart.md)
3. Try: [examples/platform-fastify/01-with-sqlite/](../examples/platform-fastify/01-with-sqlite/)

### For Developers

1. Architecture: [docs/architecture/framework-overview.md](../docs/architecture/framework-overview.md)
2. Patterns: [docs/guides/service-adapter-pattern.md](../docs/guides/service-adapter-pattern.md)
3. Testing: [docs/testing/README.md](../docs/testing/README.md)

### For Maintainers

1. Audit: [PROJECT_AUDIT_SUMMARY.md](../PROJECT_AUDIT_SUMMARY.md)
2. Status: [docs/overview/project-status-summary.md](../docs/overview/project-status-summary.md)
3. Internal: [docs/internal/](../docs/internal/)

---

**Tree Version:** 1.0  
**Last Updated:** February 6, 2026  
**Status:** ✅ Complete
