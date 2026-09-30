# Slice Harness — Implementation Record

Use this for a non-trivial implementation slice. It is a checklist and evidence
pattern, not a new HAWP shape or required set of plan fields.

## Before implementation

Record in the active plan:

- Work UUID and intent.
- Constraints, non-goals, and acceptance evidence.
- Exact repo-relative files owned by this slice.
- Known overlap with other active work and how it will be coordinated.
- Focused checks and any broader checks required by repository policy.

## Verification order

1. Run the narrowest useful check for the changed package or behavior.
2. Fix failures before widening the check scope.
3. Run build, vet, or type checks when the change affects compilation or
   contracts.
4. Run integration or full-suite checks when the affected boundary requires
   them or repository policy requires them.
5. Validate HAWP records and generated outputs when the change affects those
   artifacts.

Do not run every check mechanically. Choose checks that can prove or disprove a
specific acceptance claim.

## Record evidence

| Claim | Evidence to record |
| --- | --- |
| Focused behavior works | Exact command and observed result |
| Build/type contract holds | Exact build/type-check result |
| Integration works | Environment, command, and observed response |
| HAWP records are valid | Exact validation command and issue count |

Keep direct observations separate from inferences. State what was not verified
when the implementation depends on a live service, platform, or manual review.

## Handoff

Update the existing plan with the changed paths, evidence, remaining risks, and
the next action. Use the UUID-scoped status or evidence path described by the
[status-report guide](../usage/status-report.md). Keep the same UUID when the
intent has not changed.
