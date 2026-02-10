# Documentation Standards & Guidelines

**Version:** 1.0
**Last Updated:** 2026-01-31

## Overview

This guide defines standards for creating and maintaining documentation in the `@sentzunhat/zacatl` project.

---

## File Naming Conventions

### ✅ Standard Patterns

- **Use lowercase with hyphens**: `getting-started.md`, `multi-orm-setup.md`
- **Use descriptive names**: `infrastructure-usage.md` not `infra.md`
- **Numbered sequences**: `01-setup.md`, `02-configuration.md`
- **Category prefixes** (optional): `guide-testing.md`, `api-service.md`

### ❌ Avoid

- UPPERCASE: `MIGRATION.md` → `migration.md`
- Mixed case: `MultiORM.md` → `multi-orm.md`
- Underscores: `getting_started.md` → `getting-started.md`
- Generic names: `README.md` in subfolders (use `index.md` or specific name)

---

## Directory Structure

```
docs/
├── README.md                    # Main documentation entry point
├── changelog.md                 # Version history
│
├── getting-started/             # New user guides
│   ├── installation.md
│   ├── quickstart.md
│   └── first-service.md
│
├── tutorials/                   # Step-by-step learning guides
│   ├── rest-api.md
│   ├── working-with-databases.md
│   └── error-handling.md
│
├── guides/                      # How-to guides
│   ├── dependency-injection.md
│   ├── infrastructure-usage.md
│   └── non-http-setup.md
│
├── reference/                   # API reference documentation
│   ├── api/
│   ├── orm/
│   └── architecture/
│
├── architecture/                # Architecture decisions & design
│   ├── orm-architecture.md
│   └── decisions/
│       └── adr-001-*.md
│
├── migration/                   # Version migration guides
│   ├── v0.0.20.md
│   └── prepare-v0.0.20.md
│
├── standards/                   # Documentation & code standards
│   ├── documentation.md (this file)
│   └── code-style.md
│
└── roadmap/                     # Roadmap and future plans
```

---

## Document Structure

### Required Sections

Every documentation file should include:

```markdown
# Title (Clear, Descriptive)

**Brief description of what this document covers**

## Overview

High-level summary (2-3 sentences)

## Main Content

[Your content organized in logical sections]

## Related

- [Link to related docs]
- [Link to examples]
```

### Optional Sections

Add when relevant:

- **Prerequisites** - What users need before reading
- **Quick Start** - Immediate practical example
- **Examples** - Code samples and use cases
- **Common Issues** - FAQ or troubleshooting
- **Next Steps** - Where to go after this doc
- **References** - External links and resources

---

## Content Guidelines

### Writing Style

- **Concise**: Keep docs byte-sized when possible (under 500 lines)
- **Clear**: Use simple language, avoid jargon
- **Actionable**: Provide concrete examples and steps
- **Consistent**: Use same terminology across all docs
- **Scannable**: Use headings, lists, and code blocks

### Code Examples

```typescript
// ✅ Good: Clear, minimal, self-contained
import { Service } from "@sentzunhat/zacatl";

const service = new Service({
  type: ServiceType.SERVER,
  layers: {
    infrastructure: { repositories: [] },
    domain: { services: [] },
  },
  platforms: {
    server: { name: "my-service" },
  },
});
```

```typescript
// ❌ Bad: Too complex, unclear context
import { Service } from "@sentzunhat/zacatl";
import stuff from "somewhere";
// ... lots of unrelated code
```

### Formatting

- **Headings**: Use ATX style (`#`, `##`, `###`)
- **Lists**: Use `-` for unordered, `1.` for ordered
- **Code blocks**: Always specify language (`typescript, `bash)
- **Links**: Use relative paths for internal docs
- **Emphasis**: Use `**bold**` for importance, `*italic*` sparingly
- **Inline code**: Use backticks for code, filenames, commands

---

## Document Types

### 1. Getting Started Docs

- **Purpose**: Onboard new users
- **Length**: 200-400 lines
- **Style**: Tutorial, step-by-step
- **Example**: `getting-started/installation.md`

### 2. Guides

- **Purpose**: How to accomplish specific tasks
- **Length**: 300-600 lines
- **Style**: Task-focused, practical
- **Example**: `guides/database-setup.md`

### 3. API Reference

- **Purpose**: Complete API documentation
- **Length**: As needed (can be longer)
- **Style**: Technical, comprehensive
- **Example**: `api/service.md`

### 4. Architecture

- **Purpose**: Explain design decisions
- **Length**: 400-800 lines
- **Style**: Conceptual, detailed
- **Example**: `architecture/orm-architecture.md`

### 5. Migration Guides

- **Purpose**: Help users upgrade versions
- **Length**: 400-600 lines
- **Style**: Practical, checklist-based
- **Example**: `migration/v0.1.0-multicontext.md`

---

## Metadata

Include at the top of long-form docs:

```markdown
---
title: Document Title
description: Brief description
version: 1.0
updated: 2026-01-31
category: guide|api|architecture|migration
tags: [database, orm, sequelize]
---
```

---

## Version Control

### Changelog Format

```markdown
## [0.0.20] - 2026-01-31

### Added

- New BaseRepository pattern
- ORMType enum for type safety

### Changed

- Removed MongooseRepository and SequelizeRepository

### Deprecated

- String literals for ORM type configuration

### Fixed

- Type safety issues in repository layer
```

### Document Versioning

- Add `Last Updated` date to major docs
- Keep migration docs for each version
- Remove outdated docs or replace with current versions

---

## Quality Checklist

Before publishing documentation:

- [ ] File name is lowercase with hyphens
- [ ] File is in correct directory
- [ ] Title and description are clear
- [ ] Code examples are tested and work
- [ ] Links are valid (use relative paths)
- [ ] Grammar and spelling are correct
- [ ] Formatting is consistent
- [ ] Length is appropriate for document type
- [ ] Related docs are linked
- [ ] No sensitive information included

---

## Maintenance

### Regular Reviews

- **Quarterly**: Review all getting-started docs
- **Per Release**: Update migration guides
- **As Needed**: Update API docs when code changes

### Deprecation Process

1. Mark deprecated content with:

   ```markdown
   > **⚠️ DEPRECATED**: This approach is deprecated. See [new-approach.md](./new-approach.md)
   ```

2. After 2 major versions, remove outdated guides

3. Update index to remove deprecated docs

---

## Templates

### Quick Reference Template

```markdown
# [Feature Name]

**Quick reference for [feature]**

## Basic Usage

`typescript
// Minimal working example
`

## Common Patterns

### Pattern 1

`typescript
// Example
`

### Pattern 2

`typescript
// Example
`

## Options

| Option | Type   | Default | Description |
| ------ | ------ | ------- | ----------- |
| name   | string | -       | Description |

## Related

- [Link to detailed guide]
```

### Guide Template

```markdown
# How to [Task]

**Learn how to [accomplish task]**

## Prerequisites

- Requirement 1
- Requirement 2

## Overview

[2-3 sentence summary]

## Step 1: [Title]

[Description]

`typescript
// Code example
`

## Step 2: [Title]

[Description]

## Complete Example

`typescript
// Full working example
`

## Next Steps

- [What to learn next]
```

---

## AI Prompt for New Docs

When creating new documentation, use this prompt:

```
Create documentation for [topic] in @sentzunhat/zacatl following these standards:

1. File naming: lowercase-with-hyphens.md
2. Location: docs/[category]/[filename].md
3. Length: [getting-started: 200-400 | guides: 300-600 | api: as needed]
4. Structure:
   - Title and brief description
   - Overview (2-3 sentences)
   - Main content with headings
   - Code examples (TypeScript, tested)
   - Related links
5. Style: Concise, clear, actionable, scannable
6. Include working code examples
7. Use relative links for internal docs

Topic: [describe what to document]
Category: [getting-started|guides|api|architecture|migration|prompts]
```

---

## Examples of Good Documentation

### ✅ Good

- Clear file name: `multi-orm-setup.md`
- Proper category: `reference/orm/multi-orm-setup.md`
- Concise: 400 lines
- Scannable: Good headings and code blocks
- Actionable: Working examples

### ❌ Needs Improvement

- Unclear name: `stuff.md`
- Wrong location: `docs/MIGRATION.md` (should be in `migration/`)
- Too long: 2000 lines without breaks
- No examples: Only text
- Broken links: Links to non-existent files

---

## Summary

**Golden Rules:**

1. 📝 **Lowercase with hyphens** for file names
2. 📁 **Organized by category** in proper folders
3. 🎯 **Byte-sized** when possible (under 500 lines)
4. 💡 **Clear and actionable** with working examples
5. 🔗 **Well-linked** to related documentation

**Quick Checklist:**

- Lowercase filename ✓
- In correct folder ✓
- Has overview ✓
- Has examples ✓
- Links work ✓
- Under 600 lines (for guides) ✓

---

For questions about documentation standards, see the [documentation index](../README.md) or create an issue.
