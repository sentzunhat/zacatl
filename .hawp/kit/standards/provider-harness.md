# Provider Harness — Embedding and LLM Adapters

Apply this when adding or changing a provider adapter. The domain ports define
the contract; adapters and factories belong in infrastructure. See the current
ports in `librarian/src/internal/domain/providers/embeddings/` and
`librarian/src/internal/domain/providers/llm/`, plus their package README files.

## Contract checks

- Assert the adapter implements the current interface at compile time.
- Verify required methods return contract-consistent values: embedding
  dimensions match the reported dimension; backend/model identity is stable and
  non-empty where required; batch output corresponds to batch input.
- Cover empty, invalid, and boundary inputs according to the port's documented
  semantics.
- Propagate cancellation and deadlines from the caller context.
- Return useful errors for unavailable backends, malformed responses, and
  configuration failures; avoid leaking secrets or full sensitive prompts.
- Verify resources close safely and repeated cleanup does not panic or leak.

## Wiring and configuration

- Keep concrete construction in the infrastructure factory and composition
  root; do not make domain or application code import provider implementations.
- Test valid selection, unknown providers, missing configuration, and defaults.
- Verify invalid configuration fails before network or filesystem side effects.
- Keep credentials out of fixtures, logs, and error messages.

## Test boundaries

- Use deterministic fakes or local fixtures for unit tests.
- Keep live-service tests explicit and separately identified; do not make the
  ordinary unit suite depend on a running model server or external network.
- Record latency or quality only from an actual benchmark with model, hardware,
  warm/cold state, and command stated. Do not carry historical performance
  figures forward as guarantees.

Run the focused adapter and factory tests first, then follow the
[slice harness](slice-harness.md) and repository verification policy.
