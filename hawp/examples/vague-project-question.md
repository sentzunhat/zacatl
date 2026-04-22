# Example: Vague Project Question

## Scenario

A user asks: "what is this project about?"

## Filled HAWP Shape

```ts
const shape: Shape = {
  input: 'what is this project about?',
  context:
    'Repository is infra-as-code for Sentzunhat; includes Kubernetes manifests, ArgoCD configs, and platform service folders.',
  mission:
    'Produce a concise project summary that explains purpose, main components, and operational model.',
  constraints:
    'Stay factual to current repository evidence; avoid speculation; keep summary short and readable for non-authors.',
  output: 'A 5-8 sentence plain-language summary with key folders and responsibilities.',
};
```

## Notes

- input keeps the original vague wording unchanged.
- context grounds the response in known repository facts.
- mission turns a vague question into a concrete deliverable.
- constraints prevent drift into speculation.
- output defines completion format clearly.
