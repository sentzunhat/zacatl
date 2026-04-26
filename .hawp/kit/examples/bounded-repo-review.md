# Example: Bounded Repo Review

## Scenario

A user asks: "review this repository and tell me what matters."

## Filled HAWP Shape

```ts
const shape: Shape = {
  input: "review this repository and identify the most important issues",
  context:
    "Repository contains application code, deployment configuration, and internal docs. The review should focus on the active service path and its immediate operational dependencies.",
  mission:
    "Perform a bounded repository review of the active service path with a maintainability and risk lens, and produce findings that help decide what to fix first.",
  constraints:
    "Limit scope to the active service path and directly related configuration; separate direct evidence from inference; avoid style-only findings; call out uncertainty where inspection is incomplete.",
  output:
    "A prioritized review report with finding, evidence, impact, and recommended next action for each item.",
};
```

## Notes

- mission turns a vague review ask into a bounded review target, lens, and decision-support purpose.
- constraints prevent the review from expanding into the whole repo or drifting into speculative criticism.
- output defines a decision-useful artifact rather than a generic summary.
