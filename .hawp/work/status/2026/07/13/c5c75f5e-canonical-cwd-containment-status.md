# Status Report

## Intent

Prevent command-runner working-directory restrictions from being bypassed through
string-prefix collisions, traversal, relative paths, or symlink escapes.

## Current State

Work item `c5c75f5e` is implemented and closed. Existing `cwdPrefix` and `cwd`
paths are canonicalized and checked using platform-native descendant semantics.

## What Was Inspected

- Public command policy validation, schema documentation, API guide, and tests.
- All repository references to `cwdPrefix`.
- Node path resolution and spawn-relative-path behavior.

## What Changed

String matching was replaced with `realpathSync` plus `path.relative` containment.
Tests now exercise exact roots, descendants, sibling names, traversal, relative
paths, missing paths, and escaping symlinks.

## What Was Directly Verified

- Focused command-runner tests: 32 passed.
- Full suite: 566 passed across 73 files.
- Source, test, and scripts type checks passed.
- Changed-file lint and ESM/CJS builds passed.
- The previously reproduced sibling, traversal, and symlink escapes are rejected.

## What Remains Unproven

- Windows behavior is based on Node's documented platform-native `path` behavior;
  this verification ran on macOS arm64, not a Windows host.
- A local filesystem actor could theoretically race path replacement between
  canonical validation and `spawn`.
- Publication packaging remains behind the guard for already-published version `0.0.56`.

## Constraints

This item did not redesign the command API, alter filesystem ownership, change the
package version, or modify the separate scripts-only runner.

## Help Wanted

Review whether downstream callers need a migration note stating that configured
working directories must already exist.

## Suggested Next Step

Continue with `d5be8edb`: separate safe public error serialization from verbose
diagnostic output.
