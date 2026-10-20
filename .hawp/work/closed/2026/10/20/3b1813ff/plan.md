# Reject malformed ZodError lookalikes before wrapping

**UUID:** `3b1813ff-f481-42a8-976e-3ca9a25be48b`
**Type:** bug
**Reported:** 2026-10-19

## Input (verbatim)

> Please review the new Copilot comments and see if there are better fixes than patching or workarounds.

## Intake summary

The shared `isZodError` guard accepted any object named `ZodError`. Express
request validation renders `error.issues`, so a custom schema rejecting a
malformed lookalike caused a new TypeError instead of preserving the original
failure. The same guard is used by JSON and YAML configuration loaders.

## Evidence and decision

**Confirmed:** A focused regression first failed because
`RequestValidationError` evaluated `undefined.map`. The existing guard checked
only `name`. Real Zod validation errors passed existing tests.

**Decision:** Strengthen the shared guard to accept an `Error` named
`ZodError` only when `issues` is an array whose members provide a path array
and message string, and contains at least one issue. This keeps cross-copy
structural recognition and makes all callers use the same boundary. Empty
arrays and other malformed failures are rethrown unchanged.

## Verification and gate

Focused guard and Express tests pass on `caeef07c`: 2 files / 57 tests,
including malformed and empty issue-array cases. `npm run type:check` passes.
The preceding full local suite passed at 85 files / 736 tests, and the full
PR CI run [39436096400](https://github.com/sentzunhat/zacatl/actions/runs/39436096400)
passes all 12 checks on `caeef07c`, including publish dry-run and eight Docker
smoke jobs.

## Outcome

The malformed and empty issue-array paths now return false from the shared
structural guard, while nonempty valid issue arrays remain recognized. The
review finding is fixed and verified. The separate accepted adapter-contract
thread does not block closure of this validation item.

**Status:** closed 2026-10-20.

## Verification

- Focused guard and Express suite: 2 files / 57 tests pass.
- `npm run type:check` passes.
- CI run [39436096400](https://github.com/sentzunhat/zacatl/actions/runs/39436096400):
  all 12 checks pass on code head `caeef07c`.
- The later commits contain only HAWP and version-policy documentation; HAWP
  links and kit validation pass.

## Close Checklist

- [x] Outcome recorded
- [x] Verification recorded
- [x] Active backlog row removed and recent-close entry added
- [x] Plan moved to the dated closed archive
