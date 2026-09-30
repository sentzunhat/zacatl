# Harness Guide — Applying the HAWP Slice Checks

Use these guides before implementing a non-trivial slice. They describe what to
verify and record; they do not add HAWP fields or replace project-specific
engineering standards.

## Which guide to use

| Work | Read |
| --- | --- |
| Every non-trivial implementation slice | [slice harness](../standards/slice-harness.md) |
| New embedding or LLM adapter | [provider harness](../standards/provider-harness.md) |
| New CLI command or MCP tool | [tool harness](../standards/tool-harness.md) |

Provider and tool work use the slice harness plus their specific guide.

## Work sequence

1. Check the backlog and existing plan. Record the UUID, scope, constraints,
   owner, and exact files in the plan before editing.
2. Implement one bounded slice.
3. Run focused checks for changed packages first. Expand to build, vet, full
   tests, and HAWP validation according to the change and repository guidance.
4. Record the actual command and result. Separate confirmed output from
   inference and unverified behavior.
5. Update the plan and status/evidence artifact so the next reviewer can locate
   the changes and continue from the same work item.

Use `librarian/src` for HAWP Go/Makefile commands in this repository. For other
projects, follow their declared toolchain and check commands.

## Evidence bar

- Do not record tests as passing unless they were run and the output supports
  that claim.
- Keep local unit tests, integration tests, live service checks, and manual
  review distinct.
- Do not claim a provider, tool, or whole repository is verified from one
  narrow test.
- Skip broad checks when they add no evidence for the change; explain any
  required check that remains unrun.
