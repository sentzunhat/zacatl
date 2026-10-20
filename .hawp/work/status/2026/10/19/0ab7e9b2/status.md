# Status Report — Service architecture and review scope

## Intent

Historical record of the owner's module model and release work sequence, created
while PR #138 was a draft and targeted `dev`.

## Current State

Historical architecture checkpoint created on 2026-10-19: `Service` composes
sibling `Layers` and `Platforms` modules. The three hexagonal layers are nested
under `Layers`; Server is nested under `Platforms`. The map is in
`docs/service/architecture.md`.

Updated 2026-10-20: PR #138 now targets `main` as the proposed release PR and
remains open. No merge, prerelease publication, version tag, or npm publication
has occurred. The repository package version remains `0.0.65`; the PR's CI
publish job is a dry run. The title and description summarize the work without
a release number.

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

The current package version and PR target were checked on 2026-10-20. A real
prerelease/publication has not occurred; the CI publish job is only a dry run.
A proposed Domain clients module has not been designed as a public API.

## Constraints

No new runtime abstraction follows automatically from the ownership diagram.
The host-first adapter break remains an accepted pre-`0.1.0` API decision.
Keep implementation slices small and leave merge/publication to owner review.

## Help Wanted

Review whether the documented module ownership matches the intended Zacatl
model, especially how a future Domain client relates to entry points and
providers.

## Suggested Next Step

Continue review on PR #138 targeting `main`. Reproduce and address any remaining
review findings on the PR branch, then verify the resulting head and CI before
owner-approved merge and automated publication. Keep the separate physical
infrastructure-layout work tracked outside this release PR.
