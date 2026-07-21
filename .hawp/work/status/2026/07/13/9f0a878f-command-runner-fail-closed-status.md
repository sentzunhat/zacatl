# Status Report

## Intent

Remove the command runner's implicit arbitrary-executable behavior while retaining
an explicit compatibility path for trusted application code.

## Current State

Work item `9f0a878f` is implemented and closed. Command execution requires a
non-empty allowlist unless `allowUnrestrictedCommands: true` is explicitly set.

## What Was Inspected

- Public command-runner schemas, policy validation, runner, and batch executor.
- Repository consumers, unit tests, API documentation, and package exports.
- The separate scripts-only runner to confirm it was outside this public API change.

## What Changed

The public policy now fails closed, documents a trusted-only unrestricted opt-in,
and has regression coverage for both modes. Full details are in the closed plan.

## What Was Directly Verified

- Node.js `v26.3.0` focused tests: 26 passed.
- Full tests: 560 passed across 73 files.
- Type checks passed for source, tests, and scripts.
- Source lint completed with no errors and one unrelated existing warning.
- ESM and CJS builds passed for source and scripts.

## What Remains Unproven

The complete publication dry-run could not proceed past the expected guard because
package version `0.0.56` is already published. The guard failure was:
`Version 0.0.56 is already published to npm for @sentzunhat/zacatl`.

## Constraints

This item did not change the scripts-only runner, canonicalize `cwdPrefix`, alter
package versions, or modify unrelated dirty worktree files.

## Help Wanted

Review the naming and visibility of `allowUnrestrictedCommands` before the next release.

## Suggested Next Step

Implement `c5c75f5e` so the remaining working-directory boundary uses canonical
path containment rather than string-prefix matching.
