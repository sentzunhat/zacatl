# Documentation Guidelines

This file defines repository-level conventions for writing and maintaining project documentation.

## Documentation filename guideline

Use lowercase kebab-case for normal documentation files under docs/.

Examples:

- start-here.md
- quick-reference.md
- documentation-guidelines.md
- dependency-exports.md

Exceptions:

- Root README.md stays README.md.
- Package/module/folder README.md files may stay README.md for GitHub, npm, package, and folder landing-page conventions.
- Historical changelog entries should not be rewritten only to satisfy current filename style.

## Evidence-first documentation rule

- Use src/ and exported module surfaces as the source of truth.
- Verify commands against package.json scripts before documenting them.
- Verify runtime behavior (platform support, startup behavior, adapter behavior) against current implementation.
- Verify import examples against current public exports.

## Future improvements rule

Docs must clearly separate:

- implemented behavior
- known gaps
- open questions
- future improvements

Do not describe future improvements as current behavior.

## Drift prevention checklist

- Confirm links resolve after file renames.
- Keep implementation examples minimal and copy/paste-ready.
- Keep historical release notes factual; do not rewrite prior entries unless explicitly requested.
