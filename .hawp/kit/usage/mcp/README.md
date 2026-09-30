# HAWP MCP Worker Guides

Scope: v0.0.24 branch behavior, verified 2026-09-24. This does not claim
v0.0.24 is published or that every provider has passed a live connection test.

- [Agent installation instructions](install-agent.md)
- [Codex](codex.md)
- [Claude Code](claude-code.md)
- [GitHub Copilot in VS Code](github-copilot.md)
- [Lessons and troubleshooting](lessons.md)
- [Connection checks and provider extension](verification.md)

For a release or pull-request review, use the [review-derived lessons and
pre-publication checklist](lessons.md#review-derived-contract-lessons) after
the worker flow is aligned with the implementation.

## Before Setup

Work from the intended repository root. Read its HAWP operating guide and
backlog, inspect dirty state, and confirm the installed executable version:

```sh
./.hawp/bin/hawp version
```

The current native filename is `hawp` (`hawp.exe` on Windows).
Install/update sources now target this native filename. The v0.0.24
native-binary/config migration is implemented; existing legacy files may remain
for compatibility and are intentionally not removed. The core
source launcher is retired; releases supply the native binary separately from
the kit/provider bundle. Use a binary built for the host;
the checked-in maintainer binary is not a universal executable.

The examples use `--repo-root`, added on the v0.0.24 branch. Verify that the
installed binary supports it; do not assume an older published binary does.
Replace `<repo-root-abs>` with the actual absolute path in local configurations.
Do not commit machine-specific paths or secrets. Preserve existing entries.

`hawp init --provider NAME` is not a config-only operation: it provisions
runtime/model assets and syncs release kit/provider files over the network.
Asset failures can yield exit 1 even after config files were written. Inspect
the output and actual config; neither a file nor exit 0 proves client connection.
Use the manual provider example when only MCP configuration is needed.

## MCP-Only Configuration

On a build containing this v0.0.24 continuation, use:

```sh
./.hawp/bin/hawp mcp configure --provider claude --provider codex
```

Run from the intended repo or pass `--repo-root <repo-root-abs>`. Select only
clients you want configured. This command makes no network requests, downloads
no models, and does not sync kit, overlays, or work records. It requires an
installed native binary and backlog; file presence is not a version or execution
test. Check binary compatibility as described above.

Codex explicit-table configurations preserve custom settings and surrounding
text while updating launch values and adding missing defaults. Unsupported
layouts require manual merge; there is no force-overwrite flag.
JSON and Codex validation occur before any selected config is
written, but later filesystem write failures are not an all-or-nothing transaction.
Continue prints a user-config block; GitHub writes repo-local `.vscode/mcp.json`.
Exit 0 is not client connection proof.
Both `configure` and `init` now share the preserving Codex merge; `init` still
performs provisioning and kit sync. See the Codex guide for supported layouts.

## Shape A Work Request Into Intake

The worker can reshape a natural-language request using the
[HAWP template](../../start-here.md#minimal-template) before filling its
investigation. Keep `input` verbatim; use `context` only for known facts,
`mission` for one objective, `constraints` for actual limits, and `output` for
what done looks like. Omit `checkpoint` unless a handoff is needed. Mark missing
information as unknown instead of inventing requirements, approval, or evidence.

The HAWP shape names are `output` and `checkpoint`; in MCP JSON responses these
are serialized as `output_spec` and `done_signal` respectively.

Prefer `hawp_work_intake` when it is available. It runs indexed search and
request reshape in one MCP call, then returns a structured state:
`ready_for_work_new`, `needs_user_input`, `blocked_missing_index`, or
`blocked_reshape_failed`. Treat warnings and questions as blockers for confident
work creation; ask the user, refresh the index, or retry with a focused request
before calling `hawp_work_new`.

See the [complete intake-to-document example](../../examples/mcp-intake-to-work-doc.md)
for the ready and needs-input paths.

Check the backlog and source plans first. Continue the same UUID when the intent
matches. For genuinely new work, call `hawp_work_new` with the original request
in `input`, then fill that scaffold's investigation and plan from the shaped
request and verified context. Keep raw input separate from derived analysis and
validate the records afterward. A rewritten request is not an implementation
approval or proof that the work is complete.

There is no `hawp_reshape` tool or automatic intake reshaping in
`hawp_work_new`. Search `context:true` formats retrieved documents; it does not
turn a request into an intake plan unless the caller also shapes it. Use
`hawp_work_intake` for the combined path.

## Instructions For A Digital Worker

```text
Read .hawp/kit/start-here.md and .hawp/work/BACKLOG.md.
Discover the connected HAWP tools. Call hawp_work_validate and confirm the
reported repository before any write. Stop if it is the wrong repository.
Use hawp_work_intake for compound context retrieval and request shaping when
available. If using hawp_search directly, verify the referenced source files
before treating search output as evidence.
Update the existing UUID plan when continuing the same intent. Use
hawp_work_new only for genuinely new work, with the original request recorded.
There is no hawp_work_update tool today: edit the existing plan and backlog
directly when needed, preserving evidence, context, UUID, and supporting files.
Implement a bounded change, run relevant tests, and call hawp_work_validate.
Record observed results and remaining uncertainty in the same work item.
Do not delete unmatched work or claim unknown-folder migration already exists.
Do not commit, push, merge, publish, or modify another repo without authorization.
If MCP is unavailable, report that and use the repo-local CLI; do not claim
a shell invocation was an MCP call.
```

The current tool set is `hawp_search`, `hawp_usage`, `hawp_work_intake`,
`hawp_work_new`, `hawp_work_validate`, `hawp_work_doc`, and
`hawp_work_reshape`. Client prefixes can vary.
Validation needs no search index. If search reports a missing index, review
`.hawp/config/search.json` and the [search guide](../search.md) before running
`./.hawp/bin/hawp search index --no-update-check`; indexing writes local state.
