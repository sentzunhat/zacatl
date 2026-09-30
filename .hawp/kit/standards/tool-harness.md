# Tool Harness — CLI Commands and MCP Tools

Use this when adding or changing a CLI command or MCP tool. A tool boundary
includes argument parsing, validation, execution, errors, and observable
outputs.

## Parse and validate before effects

- Keep argument parsing separate from execution where the existing architecture
  allows it.
- Reject unknown flags or fields, missing values, invalid combinations, and
  unexpected positional arguments with actionable errors.
- Do not write files, open network connections, or mutate shared state until
  inputs and destinations pass validation.
- Test invalid requests for absence of partial writes or other side effects.

## CLI checks

- Cover help and a valid representative invocation.
- Cover missing, malformed, conflicting, and unexpected arguments.
- Assert useful output and correct exit behavior; distinguish stdout from
  stderr where callers rely on it.
- Use temporary directories and injected dependencies for filesystem/network
  effects.

## MCP checks

- Keep the registered input schema aligned with the handler's accepted fields,
  types, defaults, and required values.
- Test valid calls, malformed inputs, unknown fields, and tool-specific
  failures.
- Preserve JSON-RPC distinctions such as omitted fields versus explicit
  `null` when the protocol contract requires them.
- Return structured errors for failures; do not disguise an error as a
  successful empty result.
- Verify error paths do not leave partial configuration or work-record writes.

## Evidence

Run focused parser and handler tests first. Add end-to-end MCP or CLI tests when
they prove behavior that unit tests cannot cover. Follow the
[slice harness](slice-harness.md) and the project's own testing policy; avoid
fixed test counts that do not correspond to the command's contract.
