# Example: Implementation Planning

## Scenario

A user asks: "plan the implementation for adding structured review support to our CLI."

## Filled HAWP Shape

```ts
const shape: Shape = {
  input: 'plan the implementation for adding structured review support to our CLI',
  context:
    'The CLI already supports direct task execution and basic reporting. The team wants a bounded plan for adding review-oriented flows without redesigning the tool.',
  mission:
    'Produce a bounded implementation plan for adding structured review support to the CLI, including scope, dependencies, and phased delivery.',
  constraints:
    'Do not redesign the whole CLI; state assumptions explicitly; call out dependencies and unresolved questions; keep the plan close to the current architecture and delivery capacity.',
  output:
    'A phased implementation plan with scope, assumptions, dependencies, key work items, risks, and immediate next steps.',
};
```

## Notes

- mission makes the planning target explicit and keeps the work action-oriented.
- constraints keep the plan realistic and prevent speculative expansion.
- output defines a deliverable that can drive execution rather than just discussion.
