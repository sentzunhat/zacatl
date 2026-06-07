# Node.js Standards (mirror)

**Purpose:** Mirror copy of Node.js/TypeScript backend guidance.

**Normative copy:** use `.hawp/kit/standards/nodejs/` (canonical siblings outside `public/`).

## What belongs here

- Project structure and file organization
- Backend area module composition
- Build and environment configuration
- Code style and validation patterns

## What does not belong here

- Framework-specific runtime wiring (see mirror `framework-domain/` or your project docs)
- Database schema design (see canonical `standards/database/`)
- Install/update process (see canonical `standards/docs/`)

## Files in this mirror category

- [project-structure.md](project-structure.md)
- [area-composition.md](area-composition.md)
- [build-and-env.md](build-and-env.md)

## Review triggers

- New Node project does not fit existing patterns
- Build or env configuration changes materially
- A pattern succeeds in multiple projects (candidate for canonical promotion)
