# Documentation Standards

**Purpose:** Reusable patterns for documenting code, systems, and processes.

## What Belongs Here

Standards for documentation practices and content:

- README folder patterns and structure
- Architecture Decision Records (ADRs)
- Runbook and operations guides
- API documentation patterns
- Environment variable documentation
- Drift audits and verification reports
- Configuration documentation
- JSDoc and code comments
- Changelog format and conventions
- Change verification procedures

## What Does NOT Belong Here

- Code organization (those go in `standards/nodejs/`)
- Authentication/authorization docs (those go in `standards/auth/`)
- Provider integration docs (those go in `standards/providers/`)
- Database design docs (those go in `standards/database/`)

## Standards in This Category

- `standards/guidelines/documentation.md` — Active source for documentation and communication guidance.
- Canonical: `.hawp/kit/standards/docs/hawp-install-update-safety.md` — install/update safety (use this, not the mirror stub in this folder).
- `standards/templates/ADR.template.md` — Reusable ADR template.

## Source Evidence

These standards were promoted from:

- Existing `standards/guidelines/documentation.md`
- Proven documentation patterns across projects
- Keep a Changelog and ADR best practices

## Review Triggers

Review and update these standards when:

- Documentation practices diverge significantly across projects
- New documentation formats or tools are adopted
- A documentation pattern is successfully reused across 3+ projects
- Documentation quality issues emerge

## Key Concepts

1. **Factual & Current** — Documentation matches implementation
2. **Copy/Paste Ready** — Examples and commands work when copied directly
3. **Concise** — Keep docs lean; avoid duplication
4. **Searchable** — Use clear headings and index files
5. **Versioned** — Track changes and maintain history

## Templates Included

Templates for common documentation types are stored in `standards/templates/`:

- `ADR.template.md` — Architecture Decision Record template

Additional templates can be added after cross-project validation and promotion review.

## Migration Guidance

If you are implementing documentation standards:

1. Use provided templates from `standards/templates/`
2. Create a root `README.md` in your project
3. Document architecture decisions in `docs/adr/`
4. Create runbooks for operations in `docs/runbooks/`
5. Keep environment documentation in `docs/ENV.md`
6. Maintain a `CHANGELOG.md` in Keep a Changelog format
7. Review and update docs when behavior changes

## Documentation Audit Checklist

- [ ] Root README.md exists and is current
- [ ] All major features have documentation
- [ ] ADRs document significant decisions
- [ ] API endpoints are documented with examples
- [ ] Environment variables are documented
- [ ] Runbooks exist for common operations
- [ ] Changelog is up to date
- [ ] All code samples are tested and working
- [ ] Links are not broken
- [ ] No stale or outdated information
