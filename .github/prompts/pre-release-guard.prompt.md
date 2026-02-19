---
name: "pre-release-guard"
description: "Validate version + changelog consistency and block already-published npm versions"
argument-hint: "version=<x.y.z>"
agent: "agent"
---

Run a pre-release guard for Zacatl and report pass/fail checks.

Use only these references:

- [Version Updates](../../docs/skills/version-updates.md)
- [Release Notes](../../docs/changelog.md)
- [Package Manifest](../../package.json)

## Inputs

- Candidate version: `${input:version}`
- Workspace: `${workspaceFolderBasename}`

## Required Checks

1. Read `package.json` and get the local version.
2. Confirm the target version (if provided) matches `package.json` version.
3. Confirm `docs/changelog.md` contains a top entry for that same version.
4. Validate changelog entry placement (newest entry immediately below first `---`).
5. Check npm registry and fail if version is already published:
   - `npm view @sentzunhat/zacatl versions --json`
   - if the version exists in the published list, mark as BLOCKED.
6. Return a concise checklist with `PASS`, `WARN`, or `BLOCKED` per check.

## Output Rules

- Do not edit files.
- If npm registry is unreachable, mark publish-check as `WARN` and explain.
