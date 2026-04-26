# Documentation Standards

Documentation standards cover reusable patterns for documenting code, systems, and workflow operations.

## What Belongs Here

- README structure and folder-level landing pages
- Architecture Decision Records (ADRs)
- Runbook and operations guide patterns
- API and environment variable documentation practices
- Drift audits and verification report patterns
- Change verification procedures for documentation updates

## What Does Not Belong Here

- Code organization standards (use `../nodejs/`)
- Authentication internals (keep private unless explicitly generalized)
- Provider integration internals (keep private unless explicitly generalized)
- Database design guidance (use `../database/`)

## Standards in This Category

- [hawp-install-update-safety.md](hawp-install-update-safety.md) - Install/update safety boundaries, ownership model, and idempotent behavior.

## Key Concepts

1. Factual and current: docs should match implementation.
2. Copy/paste ready: commands and examples should run as written.
3. Boundary-aware: separate public-safe reusable guidance from private operational details.
4. Verifiable: record direct evidence for behavior-sensitive claims.

## Review Triggers

Review this category when:

- install/update behavior changes
- ownership boundaries between managed and project-owned files change
- migration/reconciliation behavior changes
- command examples drift from implementation
