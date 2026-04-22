# Example: Launch Gap Analysis

## Scenario

A user asks for a Tekit-style launch readiness gap analysis before a production launch.

## Filled HAWP Shape

```ts
const shape: Shape = {
  input: 'run a launch readiness gap analysis for the next production release',
  context:
    'Infra repo includes deployment manifests, CI/CD flows, and multiple platform service areas. Team needs a practical pre-launch risk view.',
  mission:
    'Identify launch-critical gaps across reliability, security, observability, rollback readiness, and ownership.',
  checkpoint: 'draft gaps identified; waiting for owner confirmation on rollback runbook',
  constraints:
    'Prioritize high-impact issues; tie findings to evidence; separate confirmed gaps from assumptions; avoid proposing full re-architecture.',
  output: 'A ranked gap report with severity, evidence, owner, and next action per gap.',
};
```

## Notes

- checkpoint captures a lightweight pause/handoff marker without extra schema.
- constraints keep analysis practical and launch-focused.
- output uses a structured report format that supports execution.
