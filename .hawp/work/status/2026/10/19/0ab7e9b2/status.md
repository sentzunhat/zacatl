# Status Report — Service architecture and review scope

## Intent

Capture the owner's module model and make a small release work sequence for
the new Copilot findings on draft PR #138.

## Current State

`Service` composes sibling `Layers` and `Platforms` modules. The three
hexagonal layers are nested under `Layers`; Server is nested under `Platforms`.
The map is in `docs/service/architecture.md`. PR #138 is the development
integration path to `dev`; a later release PR decides publication from `dev`
to `main`.

## What Was Inspected

`src/service/service.ts`, `src/service/layers/`, `src/service/platforms/`,
`docs/guidelines/architecture.md`, `docs/skills/version-updates.md`, the
existing HAWP Service and docs plans, and the review findings supplied by the
owner.

## What Changed

Added the current-versus-proposed architecture map and corrected the primary
docs' four-layer description. Clarified that the minor-version policy begins
at `0.1.0`; `0.0.x` development releases may contain breaking changes with
migration notes. Created two focused review work items: `6ec737fa` for direct
Server route resolution and `fa61f33c` for Service-scoped ORM/policy state.
`4c4365a1` captures the future Domain client design outside this release lane.

## What Was Directly Verified

Source contains Service child scopes, Server/API/Page/database modules, and
CLI/Desktop stubs. `DomainConfig` has providers and services but no separate
clients registration. ORM adapters currently use global lookups. The version
guide already had a pre-`0.1.0` exception before this documentation pass.

## What Remains Unproven

Both review issues need runtime reproductions and targeted checks. CI status
for the present PR head, merge readiness, and a release version have not been
verified by this architecture pass. A proposed Domain clients module has not
been designed as a public API.

## Constraints

No new runtime abstraction follows automatically from the ownership diagram.
The host-first adapter break remains an accepted pre-`0.1.0` API decision.
Keep implementation slices small and leave merge/publication to owner review.

## Help Wanted

Review whether the documented module ownership matches the intended Zacatl
model, especially how a future Domain client relates to entry points and
providers.

## Suggested Next Step

Reproduce and address `6ec737fa` in PR #138. Reproduce `fa61f33c`, then make
the smallest scoped fix on `dev` before publication or explicitly approve a
narrower single-Service release contract. Verify the final PR head and CI.
