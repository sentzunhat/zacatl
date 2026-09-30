# Claude Code

Follow the [shared setup and worker instructions](README.md) first.

## Setup

For an existing HAWP installation, prefer the network-free MCP-only command:

```sh
./.hawp/bin/hawp mcp configure --provider claude
```

It updates MCP configuration without provisioning models or syncing kit files.

For full HAWP initialization, from the intended repository root:

```sh
./.hawp/bin/hawp init --provider claude --no-update-check
```

This writes `.mcp.json`. The v0.0.24 branch writer preserves custom JSON HAWP
settings while updating launch fields; invalid or remote entries require review.

For MCP-only setup, merge the HAWP entry into the existing root `.mcp.json`:

```json
{
  "mcpServers": {
    "hawp": {
      "command": "<repo-root-abs>/.hawp/bin/hawp",
      "args": ["mcp", "--repo-root", "<repo-root-abs>"]
    }
  }
}
```

Use `hawp.exe` and escaped JSON paths on Windows.

## Verify

Start Claude Code in the intended repository and review its project-server
approval. Run `claude mcp list` or inspect `/mcp`, then ask the worker to
call `hawp_work_validate`. Confirm the reported root before creating work.

A pending approval or failed connection is not successful setup. See the
[official Claude Code MCP guide](https://code.claude.com/docs/en/mcp).
HAWP config generation is covered by local tests; a live Claude Code connection
was not tested in the original documentation pass. On 2026-09-06 the user
supplied a Claude Code MCP report: all three validations passed for this HAWP
repository, with zero work issues/warnings and 136 Markdown links checked.
This is user-reported evidence, not an independently observed session.
