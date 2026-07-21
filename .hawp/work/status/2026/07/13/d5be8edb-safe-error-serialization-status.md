# Status Report

## Intent

Make automatic `CustomError` JSON safe for client responses while preserving full
context through an explicit trusted-logging API.

## Current State

Work item `d5be8edb` is implemented and closed. Public serialization is concise,
5xx messages are generic, and diagnostics require `toDiagnosticJSON()`.

## What Was Inspected

- `CustomError`, subclasses, exports, tests, and error documentation.
- Every example Fastify and Express global error handler.
- All repository `toJSON()` and raw-error response consumers.

## What Changed

Automatic JSON now exposes only message, correlation ID, and optional code. All
eight example handlers construct safe response objects and suppress 5xx details.

## What Was Directly Verified

- Focused error and route-handler tests: 29 passed.
- Type checks and changed-file lint passed.
- All eight example backend builds passed.
- Root ESM/CJS source and scripts builds passed.
- A built-artifact probe confirmed secrets and absolute paths do not enter public JSON.

## What Remains Unproven

- Full-suite cleanliness is blocked by 26 failures in concurrently modified ORM adapters.
- SQLite HTTP smokes were deferred because those ORM changes directly affect runtime behavior.
- Publication remains behind the already-published `0.0.56` version guard.

## Constraints

This item did not edit or revert concurrent ORM work, change package versions, or
attempt logger-specific redaction beyond the explicit diagnostic contract.

## Help Wanted

Re-run the full suite and four SQLite HTTP smokes after the ORM workstream stabilizes.

## Suggested Next Step

Continue with `33fc23e7`: deprecate legacy HMAC SHA-1 and MD5 algorithms without
silently breaking existing verification workflows.
