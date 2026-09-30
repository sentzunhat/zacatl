# MCP Setup Lessons

Recorded 2026-09-06 from HAWP source, configuration tests, and local MCP calls.

- Configuration written, server connected, tool exposed, and tool executed are
  separate checks. Record each honestly; validate the selected repository first.
- Native executable paths plus explicit `--repo-root` avoid dependence on the
  client's working directory. Absolute local paths must not leak into shared
  repository artifacts.
- `init` provisions assets and syncs kit/provider files. It is not a lightweight
  MCP-only command. A later asset failure can coexist with an already-written
  provider config; examine both the error and resulting files.
- Codex and Claude config writers exist. GitHub currently prints manual MCP
  setup advice only. Provider instruction overlays are not MCP connections.
- Preserve custom environment, timeout, policy, and unrelated server settings.
  JSON and explicit Codex TOML table migrations have preservation tests. Codex
  migration uses parsed source ranges rather than replacing the whole table;
  unsupported layouts and embedded launch-value comments require manual review.
- Do not reuse one provider's JSON wrapper key indiscriminately: Claude uses
  `mcpServers`; VS Code workspace MCP configuration uses `servers`.
- Trust and approval remain user decisions. Do not bypass them to make a
  connection test pass.
- Local in-place executable replacement produced exit 137 during maintenance.
  Temporary-file replacement restored execution. The Makefile and CI now share
  that install path; the precise OS-level cause was not established.
- Search can be stale or incomplete; use the backlog and source files to verify.
  The current tools create and validate work, but do not update existing plans.
- Single-executable retirement and routing unmatched records into an unknown
  folder remain planned. Preserve copies, evidence, identity, and sidecars.

## Review-Derived Contract Lessons

These lessons came from reconciling implementation, tests, release notes, worker
guides, generated provider overlays, and pull-request review feedback for the
v0.0.24 intake/work-document lane.

- Build a contract matrix before editing prose. Record the exact MCP wire keys,
  state values, CLI spellings, generated paths, and the tests that assert each
  one. Treat source and tests as authoritative over changelog shorthand.
- Keep protocol vocabulary separate from wire vocabulary. HAWP authors use
  `output` and `checkpoint`; MCP JSON responses expose `output_spec` and
  `done_signal`. Explain the mapping where workers cross that boundary.
- Use the generated artifact path as the canonical path. New status, evidence,
  and decision records belong under `YYYY/MM/DD/{uuid}/<type>.md`; update the
  root kit, core kit, provider overlays, examples, and status README together.
  Preserve legacy records as historical evidence instead of rewriting them.
- Separate benchmark dimensions. Report structured-output coverage, short-input
  token expansion, and downstream token reduction as different measurements.
  State the denominator, failed-query treatment, and gate definition beside the
  numbers; never call an aggregate a percentage average.
- Keep review evidence portable. Redact machine-local prefixes from committed
  artifacts, use repository-relative examples, and label live-provider or
  client-connection checks as unproven when they were not exercised.
- Synchronize the pull-request description with the shipped contract after the
  final commit. Include the exact supported states, command forms, verified
  checks, benchmark boundaries, and known historical/deferred items, then ask
  for a fresh review rather than relying on an earlier review summary.

## Pre-Publication Checklist

- [ ] Compare MCP JSON keys and state values with server types and contract tests.
- [ ] Compare CLI examples with `hawp --help` and command tests.
- [ ] Compare generated paths with `hawp work status|evidence|decision|note`.
- [ ] Search live guidance, examples, changelog, and provider overlays for old
      names and old paths.
- [ ] Validate root/core/provider/distribution parity.
- [ ] Run tests, vet, build, HAWP checks, diff checks, and relevant smoke tests.
- [ ] Review the PR title/body for stale claims before requesting re-review.

## Verification Boundary

Local configuration tests and actual HAWP MCP calls in Codex are evidence.
They do not prove every provider version, platform, user policy, or hosted agent
environment. Official provider documentation is linked in each setup guide.
No live Claude Code or Copilot connection was exercised for these guides.
