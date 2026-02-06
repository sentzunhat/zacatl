# Documentation Index

**Zacatl Examples - Organized Documentation**

This directory contains all documentation for the Zacatl examples project, organized by purpose and audience.

---

## 📂 Directory Structure

```
/docs
  /overview          → Project purpose, goals, and catalog
  /architecture      → System design, comparisons, patterns
  /setup             → Installation, quick starts, prerequisites
  /operations        → Scripts, maintenance, validation
  /decisions         → ADRs, rationale, optimization history
  /notes             → Raw notes, drafts, research
  /archive           → Deprecated or superseded docs
```

---

## 🎯 Quick Navigation

### New to the Project?

**Start here:** [/overview/main-readme.md](./overview/main-readme.md) (root [README.md](../README.md))  
**Quick reference:** [/setup/quick-ref.md](./setup/quick-ref.md)

### Want to Run Examples?

**Fastest:** `platform-fastify/01-with-sqlite/` (< 1 second startup)  
**Full setup guide:** [/setup/quick-start.md](./setup/quick-start.md)  
**Visual catalog:** [/overview/catalog-visual.md](./overview/catalog-visual.md)

### Understanding Architecture?

**Framework comparison:** [/architecture/comparison-guide.md](./architecture/comparison-guide.md)  
**Technology matrix:** [/architecture/comparison.md](./architecture/comparison.md)

### Building New Examples?

**For AI agents:** [/decisions/agents.md](./decisions/agents.md)  
**Design rationale:** [/decisions/optimization-summary.md](./decisions/optimization-summary.md)

### Validating Your Work?

**QA Checklist:** [/operations/validation-checklist.md](./operations/validation-checklist.md)

---

## 📚 Documentation by Category

### Overview

**Purpose:** High-level understanding of what this project is and what examples are available

- [main-readme.md](./overview/main-readme.md) - Primary README with learning path and getting started
- [catalog-index.md](./overview/catalog-index.md) - Condensed catalog view with quick commands
- [catalog-visual.md](./overview/catalog-visual.md) - Visual decision matrix and structure map

**Best for:** New developers, project evaluators, quick reference

---

### Architecture

**Purpose:** Understanding design patterns, comparisons, and architectural decisions

- [comparison-guide.md](./architecture/comparison-guide.md) - Best practices and pattern evolution (Fastify vs Mictlan)
- [comparison.md](./architecture/comparison.md) - Technology matrix showing same logic across different stacks

**Best for:** Understanding why certain patterns were chosen, comparing implementations

---

### Setup

**Purpose:** Getting examples running on your machine

- [quick-start.md](./setup/quick-start.md) - Bun monorepo setup for MongoDB and SQLite examples
- [quick-ref.md](./setup/quick-ref.md) - One-page reference with all commands
- [fastify-quick-start.md](./setup/fastify-quick-start.md) - Fastify-specific quick start (duplicate of main quick-start)

**Best for:** Developers wanting to run examples immediately

---

### Operations

**Purpose:** Maintenance, validation, and ongoing project health

- [validation-checklist.md](./operations/validation-checklist.md) - Quality checklist for Fastify examples

**Best for:** Contributors validating new examples, CI/CD setup

---

### Decisions

**Purpose:** Understanding why things are the way they are (Architecture Decision Records)

- [agents.md](./decisions/agents.md) - Comprehensive guide for AI agents building parallel examples
- [optimization-summary.md](./decisions/optimization-summary.md) - History of optimizations and why Fastify is the reference

**Best for:** Understanding project evolution, contributor onboarding, maintaining consistency

---

### Notes

**Purpose:** Unstructured thoughts, drafts, and work-in-progress documentation

_Currently empty - reserved for future brainstorming and draft docs_

**Best for:** Capturing ideas that don't yet fit elsewhere

---

### Archive

**Purpose:** Deprecated or superseded documentation preserved for historical reference

_Currently empty - documentation is still active_

**Best for:** Understanding what changed and why

---

## 🔍 Finding What You Need

### By Use Case

| I want to...                          | Read this                                                                  |
| ------------------------------------- | -------------------------------------------------------------------------- |
| Understand what this project is       | [overview/main-readme.md](./overview/main-readme.md)                       |
| Run an example in 30 seconds          | [setup/quick-ref.md](./setup/quick-ref.md)                                 |
| Choose the right example for my needs | [overview/catalog-visual.md](./overview/catalog-visual.md)                 |
| Understand the architecture           | [architecture/comparison-guide.md](./architecture/comparison-guide.md)     |
| Build a new example                   | [decisions/agents.md](./decisions/agents.md)                               |
| Compare Fastify vs Express            | [architecture/comparison.md](./architecture/comparison.md)                 |
| See all available examples            | [overview/catalog-index.md](./overview/catalog-index.md)                   |
| Validate my implementation            | [operations/validation-checklist.md](./operations/validation-checklist.md) |

### By Audience

**Beginners:**

1. [overview/main-readme.md](./overview/main-readme.md)
2. [setup/quick-ref.md](./setup/quick-ref.md)
3. [setup/quick-start.md](./setup/quick-start.md)

**Intermediate Developers:**

1. [architecture/comparison-guide.md](./architecture/comparison-guide.md)
2. [architecture/comparison.md](./architecture/comparison.md)
3. [overview/catalog-visual.md](./overview/catalog-visual.md)

**Contributors/Maintainers:**

1. [decisions/agents.md](./decisions/agents.md)
2. [decisions/optimization-summary.md](./decisions/optimization-summary.md)
3. [operations/validation-checklist.md](./operations/validation-checklist.md)

**AI Agents:**

1. [decisions/agents.md](./decisions/agents.md) ← START HERE
2. [architecture/comparison-guide.md](./architecture/comparison-guide.md)
3. [overview/main-readme.md](./overview/main-readme.md)

---

## 📝 Document Status

| Document                           | Status       | Last Updated | Quality |
| ---------------------------------- | ------------ | ------------ | ------- |
| overview/main-readme.md            | ✅ Active    | Feb 2026     | High    |
| overview/catalog-index.md          | ✅ Active    | Feb 2026     | High    |
| overview/catalog-visual.md         | ✅ Active    | Feb 2026     | High    |
| setup/quick-start.md               | ✅ Active    | Feb 2026     | High    |
| setup/quick-ref.md                 | ✅ Active    | Feb 2026     | High    |
| setup/fastify-quick-start.md       | ⚠️ Duplicate | Feb 2026     | Medium  |
| architecture/comparison-guide.md   | ✅ Active    | Feb 2026     | High    |
| architecture/comparison.md         | ✅ Active    | Feb 2026     | High    |
| operations/validation-checklist.md | ✅ Active    | ~Jan 2026    | Medium  |
| decisions/agents.md                | ✅ Active    | Feb 4, 2026  | High    |
| decisions/optimization-summary.md  | ✅ Active    | Feb 2026     | High    |

---

## 🔄 Maintenance Notes

**How this was organized (February 5, 2026):**

Previously, all markdown files lived in `/examples` root, causing:

- Difficulty finding specific docs
- No clear categorization
- Duplicate/overlapping content unclear

**Reorganization approach:**

1. Created categorical subdirectories
2. Moved docs based on primary purpose
3. Preserved all original content (no deletions)
4. Created this index for navigation

**Original locations preserved in root:**
All original markdown files remain in `/examples` root for backwards compatibility. The `/docs` folder contains copies organized for easier navigation.

**Future improvements needed:**

1. Merge duplicate content (quick-start.md appears twice)
2. Update relative links in moved documents
3. Add more granular categorization as docs grow
4. Create visual diagrams in `/architecture`

---

## 🤝 Contributing to Documentation

### Adding New Docs

1. **Determine category:** Which subfolder best fits?
   - Overview = What is this?
   - Architecture = How does it work?
   - Setup = How do I use it?
   - Operations = How do I maintain it?
   - Decisions = Why did we do it this way?
   - Notes = Unformed ideas/drafts

2. **Name clearly:** Use descriptive filenames (kebab-case)

3. **Update this index:** Add your doc to the appropriate section

4. **Link from related docs:** Cross-reference where helpful

### Deprecating Docs

1. Move to `/archive` subfolder
2. Add entry to this index under "Archive" section
3. Explain in ARCHIVE.md why it was deprecated
4. Update links in other docs

---

## 📞 Questions?

If you can't find what you're looking for:

1. Check [PROJECT-STATUS.md](../PROJECT-STATUS.md) for overall project state
2. Check [overview/catalog-visual.md](./overview/catalog-visual.md) for decision matrix
3. Search for keywords across all docs
4. File an issue requesting clarification

---

**Last Updated:** February 5, 2026  
**Maintainer:** AI Agent / Project Team  
**Status:** Active, under continuous improvement
