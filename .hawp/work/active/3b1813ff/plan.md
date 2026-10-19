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
and message string. This keeps cross-copy structural recognition and makes all
callers use the same boundary. Other failures are rethrown unchanged.

## Verification and gate

Focused guard and Express tests pass. Full local suite passed: 85 files / 736
tests; source/test/script type checks, build and lint passed (existing lint
warnings only). Final PR-head CI and review thread status remain to verify.

**Status:** in-progress until the pushed head is verified.
