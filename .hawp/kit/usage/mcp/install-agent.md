# Agent Installation Instructions — HAWP v0.0.24

Scope: instruction set for a digital agent installing HAWP v0.0.24 into a target
repository and configuring MCP for Claude Code and Codex. Written 2026-09-06.

These instructions require the v0.0.24 branch binary; published releases may not
yet include the features referenced here. Verify binary compatibility before
proceeding.

---

## Before You Start

1. **Confirm the target repository.** Know the absolute path of the repository
   root you are installing into. All paths below use `<repo-root-abs>` as a
   placeholder. Replace it with the actual absolute path in every command and
   config fragment. Do not commit machine-specific absolute paths.

2. **Read the repository state.** Check for an existing HAWP installation:
   ```sh
   ls <repo-root-abs>/.hawp/bin/
   ls <repo-root-abs>/.mcp.json
   ls <repo-root-abs>/.codex/config.toml
   ```
   Note which files already exist. Preserve all existing content.

3. **Confirm you are not in the wrong repository.** Do not proceed on an
   unintended target. If MCP tools are already available, call
   `hawp_work_validate` first and verify the returned repository root matches
   your target before any write.

---

## Step 1 — Obtain and Install the Binary

HAWP v0.0.24 is distributed as pre-built platform binaries from the GitHub
Release for the `0.0.24` tag in the `sentzunhat/hawp` repository.

Determine the correct platform binary:

| Platform | Binary filename |
| --- | --- |
| macOS (arm64) | `hawp-darwin-arm64` |
| macOS (amd64) | `hawp-darwin-amd64` |
| Linux (amd64) | `hawp-linux-amd64` |
| Linux (arm64) | `hawp-linux-arm64` |
| Windows (amd64) | `hawp-windows-amd64.exe` |
| Windows (arm64) | `hawp-windows-arm64.exe` |

Install to the repository's local HAWP bin directory using a temporary file and
rename — do not overwrite the in-use executable in place:

```sh
mkdir -p <repo-root-abs>/.hawp/bin
# Download to a temp file first, then rename
curl -L -o <repo-root-abs>/.hawp/bin/hawp.tmp \
  https://github.com/sentzunhat/hawp/releases/download/0.0.24/<platform-binary>
chmod +x <repo-root-abs>/.hawp/bin/hawp.tmp
mv <repo-root-abs>/.hawp/bin/hawp.tmp <repo-root-abs>/.hawp/bin/hawp
```

On Windows name the destination `hawp.exe`.

**Do not skip the temp-file rename step.** In-place overwrite of a running binary
has caused exit 137 failures in prior installs; the rename avoids this.

Verify the binary executes:

```sh
<repo-root-abs>/.hawp/bin/hawp version
```

The reported version must start with `0.0.24`. Stop and report if it does not.

---

## Step 2 — Verify HAWP Repository Prerequisites

The MCP configuration command requires an installed binary, a valid HAWP
directory structure, and a backlog file. If this is a fresh repository with no
prior HAWP installation, run `hawp init` first (see the note below). For an
existing installation, confirm:

```sh
ls <repo-root-abs>/.hawp/work/BACKLOG.md
ls <repo-root-abs>/.hawp/kit/start-here.md
```

If these files are missing, the repository has not been initialized. Use:

```sh
<repo-root-abs>/.hawp/bin/hawp init --no-update-check
```

`init` provisions runtime assets and syncs kit/provider files over the network.
It is not a lightweight command. Inspect its output; an asset error can produce
exit 1 even after config files were written. If you only need MCP configuration
and the kit is already present, skip to Step 3.

---

## Step 3 — Configure MCP

Use the network-free MCP-only command. Run from the repository root or pass
`--repo-root` explicitly:

```sh
<repo-root-abs>/.hawp/bin/hawp mcp configure \
  --provider claude \
  --provider codex \
  --repo-root <repo-root-abs>
```

This command:
- Writes or updates `.mcp.json` (Claude Code) using a safe JSON merge that
  preserves existing custom HAWP settings and unrelated server entries.
- Writes or updates `.codex/config.toml` (Codex) using a parsed TOML merge that
  preserves custom policies, environment, tool restrictions, timeouts, and
  surrounding text; only the launch values and missing defaults change.
- Makes no network requests and downloads nothing.

**What to do on a configuration refusal:** Malformed TOML, unsupported layouts
(inline or dotted-only tables), and embedded comments inside a changed launch
value are refused unchanged. Read the error, apply the fix manually using the
template below, and re-run to confirm idempotency.

Manual Codex template (merge into `.codex/config.toml`, do not replace the file):

```toml
[mcp_servers.hawp]
command = "<repo-root-abs>/.hawp/bin/hawp"
args = ["mcp", "--repo-root", "<repo-root-abs>"]
enabled = true
```

Manual Claude Code template (merge into `.mcp.json`, do not replace the file):

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

---

## Step 4 — Verify the Configuration

**Do not assume exit 0 means MCP is connected.** Verify each layer separately.

### 4a. Check the config files

Inspect the written files and confirm the HAWP entry contains the correct
absolute path and `--repo-root` argument:

```sh
cat <repo-root-abs>/.mcp.json
cat <repo-root-abs>/.codex/config.toml
```

### 4b. Verify Claude Code connection

Start Claude Code in the repository. Check server approval and status:

```sh
claude mcp list
```

Then ask the connected agent: "Call `hawp_work_validate` through MCP. Report the
repository path and PASS/WARN/FAIL result. Do not create or modify any work
items." Compare the returned root against `<repo-root-abs>`. Stop on mismatch
or tool error.

A pending approval or failed connection is not successful setup. Both must
resolve before proceeding.

### 4c. Verify Codex connection

Trust and approve the repository, then start a fresh Codex task. Run:

```sh
codex mcp list
```

Ask the worker to call `hawp_work_validate` and verify the returned root and
result match the target repository. Do not create or modify work items until
validation passes.

### 4d. Check search availability (optional)

If you plan to use `hawp_search`, check whether an index exists:

```sh
<repo-root-abs>/.hawp/bin/hawp search query --query "hawp" --limit 1
```

A missing-index error means indexing has not been run. Build the index with:

```sh
<repo-root-abs>/.hawp/bin/hawp search index --no-update-check
```

Indexing reads the local kit and work files and writes local state. Validation
does not require a search index.

---

## Constraints — What This Agent Must Not Do

- Do not commit, push, merge, or open a pull request without explicit
  authorization from the repository owner.
- Do not modify any downstream repository, provider configuration, or CI system
  other than the target repository.
- Do not use `hawp init` as a substitute for `mcp configure` when only config
  changes are needed; init provisions assets and syncs remote kit files.
- Do not use `hawp_work_new` to record this installation as a work item unless
  it is genuinely new planned work. Configuration steps are not backlog items.
- Do not delete, overwrite, or discard existing HAWP work records, unknown
  folders, or plan files to make space.
- Do not store absolute paths from this machine in any file that will be
  committed. Use relative paths in committed config when supported.
- Do not claim connection is established until a live `hawp_work_validate` tool
  call returns PASS with the correct repository root.
- Do not call MCP tools on the wrong repository. Verify the root first.

---

## If Something Goes Wrong

| Symptom | Likely cause | Action |
| --- | --- | --- |
| Binary exits 137 | In-place overwrite of a running binary | Remove the broken binary, re-download to a temp file, rename |
| `mcp configure` refuses TOML | Unsupported table layout | Apply the manual Codex template above; do not force-overwrite |
| `hawp_work_validate` reports wrong root | Stale or missing `--repo-root` | Rerun `mcp configure --repo-root <abs>`, restart the client |
| Server listed but tool call fails | Client approval pending | Approve the project in the client UI; restart the session |
| Missing index on `hawp_search` | Index not built yet | Run `hawp search index --no-update-check`; check config first |
| `version` mismatch | Wrong binary or update not complete | Re-download the platform binary for this host |

See [lessons.md](lessons.md) for additional troubleshooting notes.

---

## Related Guides

- [Shared worker instructions and pre-flight checks](README.md)
- [Claude Code setup](claude-code.md)
- [Codex setup](codex.md)
- [Connection check procedure](verification.md)
- [MCP setup lessons](lessons.md)
