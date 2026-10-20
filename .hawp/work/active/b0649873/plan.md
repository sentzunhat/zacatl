# Organize the `src/` root around the agreed architecture

**UUID:** `b0649873-176f-479d-8406-06940dab8cec`
**Type:** refactoring
**Reported:** 2026-10-20

## Input (verbatim)

> Clean up the root folder where the source code lives too.

## Intake summary

Inventory and reorganize the top-level `src/` structure so ownership is clear
and matches the agreed model: Service coordinates lifecycle; Layers owns
Application, Domain, and Infrastructure; Platforms owns CLI, Desktop, and
Server. Establish a target map first, then move code in small slices.

## Confirmed evidence

Current top-level folders include `configuration`, `dependency-injection`,
`error`, `eslint`, `localization`, `logs`, `service`, `third-party`, and
`utils`. Their ownership is mixed: some are cross-cutting package facilities,
while others may belong under Service, Layers, or Platforms. The current
architecture and public export map need to be considered together before
moving files.

## Decision and boundary

Do not move every root folder mechanically into `service/`. First distinguish
framework orchestration from cross-cutting package facilities and
layer/platform-owned code. Avoid a broad rename or public export change without
an import/export map and consumer impact assessment.

## Small changes

1. Inventory every `src/` top-level file/folder, its imports, runtime owner,
   package export, generated output, and documentation references.
2. Propose a target tree aligned with Service, Layers, and Platforms, including
   an explicit home for cross-cutting facilities that remain package-wide.
3. Review the target map against `package.json` exports, declaration/build
   scripts, tests, examples, and the website consumer before moving code.
4. Move one cohesive subsystem at a time, updating imports and exports in the
   same slice. Remove old paths only under the documented pre-0.1.0 policy and
   include consumer migration guidance where needed.
5. Verify each slice with type checks, focused tests, build output, example
   imports, documentation links, and final CI.

## Acceptance

- Every `src/` top-level area has a documented owner and a reason for its
  location.
- The resulting tree clearly reflects Service orchestration, Layers, and
  Platforms while keeping true shared facilities easy to find.
- Package exports and generated declarations match the new source locations.
- Moves are reviewable, consumer impact is recorded, and all required checks
  pass on the final integration head.

## Dependencies and gate

Coordinate the target map with architecture item `19965b11`, database
ownership item `bfea146e`, and Domain-boundary item `4c4365a1`. Agree on the
map before implementation; keep this separate from the public compatibility
cleanup in item `533c3a53`.

**Status:** plan-ready for owner review; implementation deferred.
