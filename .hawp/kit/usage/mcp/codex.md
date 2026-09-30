# Codex

Follow the [shared setup and worker instructions](README.md) first.

## Setup

Prefer MCP-only setup when HAWP is already installed:

```sh
./.hawp/bin/hawp mcp configure --provider codex
```

This creates a new config or updates an explicit HAWP table without replacing
custom policies, environment settings, unrelated servers, or surrounding comments.
Quoted table names and multiline values are supported. Existing disabled state,
tool restrictions, and timeouts remain unchanged; missing defaults are added.
Only command, repository-root arguments, and cwd are updated.

Malformed/duplicate TOML, remote servers, inline or dotted-only HAWP tables,
and comments embedded inside a launch value that must change are refused
unchanged for manual review. There is no force-overwrite flag. Repeating an
already-current migration does not rewrite the file.

For full HAWP initialization, from the intended repository root:

```sh
./.hawp/bin/hawp init --provider codex --no-update-check
```

This writes `.codex/config.toml` using the same preserving merge, but also
provisions assets and syncs kit/provider files. Prefer `mcp configure` for
setup-only work, and inspect the resulting diff before enabling tools.

For MCP-only setup, merge this table into the local project configuration,
preserving unrelated tables and existing HAWP policy settings:

```toml
[mcp_servers.hawp]
command = "<repo-root-abs>/.hawp/bin/hawp"
args = ["mcp", "--repo-root", "<repo-root-abs>"]
enabled = true
```

Use `hawp.exe` and correctly escaped paths on Windows. Avoid defining the
same server twice across project, user, or plugin configuration scopes.

## Verify

Trust only the intended project, then start a fresh task. When Codex CLI is
available, run `codex mcp list`. Ask the worker to call `hawp_work_validate`
and check its reported repository and result before allowing work-item creation.

Codex supports project MCP configuration in trusted projects. See the
[official MCP documentation](https://developers.openai.com/codex/mcp).
Local config-writer tests pass, and HAWP MCP validation/creation were exercised
in this Codex task; that is not proof of setup on a different machine.
