# Example: Prompt Handoff Generation

## Scenario

A user asks for a handoff prompt so another agent can continue work with minimal drift.

## Filled HAWP Shape

```ts
const shape: Shape = {
  input: "create a handoff prompt for the next agent to continue this task",
  context:
    "Current session produced partial implementation, known risks, and pending verification tasks. Next agent should continue without re-discovery.",
  mission:
    "Generate a concise, intent-first handoff prompt that preserves decisions, current state, and next actions.",
  constraints:
    "Do not rewrite history; include only verified facts; list open questions explicitly; keep it reusable in a new chat.",
  output:
    "A copy-ready handoff prompt with sections for intent, current state, decisions, risks, and immediate next steps.",
};
```

## Notes

- mission focuses on continuity rather than re-analysis.
- constraints reduce ambiguity for the receiving agent.
- output defines a portable artifact that minimizes context loss.
