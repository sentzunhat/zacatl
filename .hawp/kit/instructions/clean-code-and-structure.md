---
applyTo: "**"
description: Keep touched code cleaner than found and decompose large files with explicit boundaries
---

# Clean Code And Structure

## Purpose

Define a practical default for implementation work: improve local code quality as you touch files, and split crowded files only when there is a clear ownership or validation benefit.

## Core Rules

### 1. Leave It Better Than You Found It

For every file you touch, apply small safe cleanup within scope:

- reduce obvious duplication
- improve naming clarity where behavior is unchanged
- remove dead code or stale comments encountered in the touched area
- tighten local structure to improve readability

Do not do broad rewrite-only cleanup with no task linkage.

### 2. Split Large Files For A Reason

Do not split because a file is long alone.
Split when at least one is true:

- unrelated responsibilities are mixed
- behavior slices are hard to verify due to entanglement
- tests/imports reveal a missing boundary
- repeated edits in one crowded file create review friction

### 3. Keep Structural Scope Explicit

Before non-trivial structural refactors, create or update a HAWP work item.
This includes:

- introducing or expanding shared core boundaries (for example `core/`)
- moving code across feature ownership boundaries
- extracting multiple runtime modules from a single owner file
- introducing shared abstractions reused by more than one feature

Small local cleanup inside one file can stay in the active task.

### 4. Organize By Ownership, Not Just File Count

Prefer feature-first folder ownership.
When decomposition is justified, use folders that reflect behavior ownership (for example component-specific subfolders) and keep public entry points clear.

Do not move feature-local code into shared locations only to reduce top-level file count.

### 5. Gate High-Impact Structural Changes

Stop for approval when refactors change:

- folder topology
- shared contracts or bridge shapes
- storage naming or migration semantics
- cross-feature ownership boundaries

Low-risk internal cleanup in one bounded file does not need a separate approval gate.

### 6. Verify Early During Decomposition

After the first substantive structural edit, run the cheapest focused check before continuing broader splits:

- narrow test for the touched slice
- typecheck or compile check for the touched slice
- build check when coupling is broad

### 7. Keep Naming And Runtime Changes Separable

Separate user-facing wording cleanup from schema/API/storage renames when possible.
Prefer compatibility-first migration steps before canonical persisted-data renames.

## Non-Goals

- This instruction does not force immediate creation of `core/`.
- This instruction does not approve broad refactors by itself.
- This instruction does not replace feature-first ownership with mandatory shared-core architecture.
