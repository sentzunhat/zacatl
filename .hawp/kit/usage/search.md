# hawp search — Context-Aware Search

`hawp search` finds relevant content from your indexed kit and work documents using lexical, semantic, or hybrid search. It can also pack results into LLM-ready context blocks.

## Quick start (CLI)

```bash
# 1. Index documents (run once, re-run after content changes)
hawp search index

# 2. Embed documents for semantic/hybrid search (--backend is required)
hawp search embed --backend ollama   # recommended: fast + high quality
hawp search embed --backend onnx     # offline fallback, no Ollama needed

# 3. Search
hawp search "how do I write a status report"
hawp search "backlog alignment rules" --hybrid-ratio 0.3
```

## Embedding backends

| Backend | Model (default) | First embed | Warm embed | Quality |
|---------|----------------|-------------|-----------|---------|
| `ollama` | `nomic-embed-text` (768d) | ~110ms/chunk | ~110ms/chunk | 0.83 |
| `onnx` | `all-MiniLM-L6-v2` (384d) | ~476ms/batch | ~8ms/chunk | 0.70 |

`--backend` is required. Ollama must be running for the `ollama` backend. ONNX runs offline (pure Go, no system deps).

```bash
# Override model
hawp search embed --backend ollama --model nomic-embed-text
hawp search embed --backend onnx   --model all-MiniLM-L6-v2
```

## Search modes

| Mode | Flag | Speed | Notes |
|------|------|-------|-------|
| Lexical (FTS5) | default | <1ms | No vectors needed |
| Hybrid (lexical + semantic) | default when vectors exist | ~15–50ms | Requires embed step; tune with `--hybrid-ratio` |
| Semantic only | `--semantic` | ~100ms | Requires embed step |

Hybrid is recommended once vectors are built.

## Context packing

```bash
hawp search "intake workflow" --context
hawp search "intake workflow" --context --max-tokens 4000 --format json
```

Output includes source file, chunk, and relevance score per result.

## Full flag reference

```
hawp search <query>
  --limit <n>             max results (default: 10)
  --context               pack results into LLM-ready context block
  --format markdown|json  output format (default: markdown)
  --max-tokens <n>        token budget for context block (default: 2000)
  --semantic              force semantic-only search
  --hybrid-ratio <f>      lexical fraction for hybrid blend, 0.0 to 1.0 (default: 0.3)
  --verbose | -v          print token accounting summary to stderr (chunks, ~tokens, saved via dedup)

hawp search index         ingest configured paths into SQLite (reads .hawp/config/search.json)
hawp search embed         generate and store embedding vectors
  --backend onnx|ollama   required: embedding backend to use
  --model <name>          override default model for the backend
```

## MCP tool: hawp_search

When using Claude Code with the HAWP MCP server (`hawp mcp`), the `hawp_search` tool provides structured results with precise line positions and context windows — suitable for automated code navigation and documentation lookup.

Use `hawp mcp configure --provider <name>` for config-only setup, or
`hawp init --provider <name>` when provisioning and kit sync are also wanted.
File-backed integrations are Claude Code (`.mcp.json`), Cursor
(`.cursor/mcp.json`), Codex (`.codex/config.toml`), and GitHub/Copilot
(`.vscode/mcp.json`); Continue prints a manual user-config block. Generated
file-backed configs use the native executable and an explicit repository root.
Follow the [provider MCP setup guides](mcp/README.md) rather than copying a
static relative launcher between machines or providers.

Tool input:

```json
{ "query": "backlog alignment", "limit": 5 }
```

Structured response schema:

```json
{
  "query": "backlog alignment",
  "results": [
    {
      "source": ".hawp/kit/references/backlog-alignment.md",
      "relevance": 0.91,
      "content": "Keep Active Work short and current…",
      "lines": {
        "range": { "start": 1, "end": 18 },
        "source": 3
      },
      "context": {
        "window": { "start": 1, "end": 58 }
      }
    }
  ]
}
```

- `lines.range` — full chunk span in the source file (1-indexed)
- `lines.source` — line containing the best match for the query term
- `context.window` — suggested read window (±40 lines around `lines.source`, clamped to file bounds)

Pass `context: true` to receive a single deduplicated, token-capped markdown block instead of raw results — suitable for direct LLM injection:

```json
{ "query": "backlog alignment", "limit": 5, "context": true, "max_tokens": 2000 }
```

- `context` — when `true`, returns a pre-shaped markdown block (Jaccard dedup + greedy token cap applied); default `false`
- `max_tokens` — token budget for the context block when `context: true`; default `2000`

Other MCP tools: `hawp_usage`, `hawp_work_intake`, `hawp_work_new`,
`hawp_work_validate`, `hawp_work_doc`, and `hawp_work_reshape`.

## Typical agent workflow

```bash
# At session start (once per session, if content changed)
hawp search index && hawp search embed --backend ollama

# During work
hawp search "backlog alignment rules" --context --max-tokens 2000
```

The index is idempotent — re-running after content changes upserts new chunks. Vectors persist across sessions.
