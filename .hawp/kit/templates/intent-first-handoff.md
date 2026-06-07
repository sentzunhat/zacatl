# Intent-First Conversation Handoff

Use this template to generate a continuation-ready summary for the next conversation.
Paste the completed form into a new chat and the AI will produce the handoff artifact.

Related prompt: `.github/prompts/hawp-intent-first-handoff.prompt.md`

---

## My Intent

> Write freely here in plain language. This is the primary steering signal.
>
> Examples:
>
> - "Where can we go from these findings, and how do we turn them into concrete next steps?"
> - "I want to resume from this point and focus on simplifying the architecture."
> - "Assume we are continuing this tomorrow and I want to make final decisions."
> - "Help me move forward from here without rehashing basics."

[Write your intent here]

---

## Previous Conversation Context

[Paste the conversation context and findings here]

---

## Requested Output

Please produce a structured handoff summary with the following sections:

### How to Interpret My Intent

Briefly restate how you understand my intent above.

### High-Level Goal

What I'm ultimately trying to achieve.

### Key Findings & Decisions So Far

Important conclusions, decisions, and constraints.

### Current State

What exists now, what's working, what's partial.

### Gaps, Unknowns & Open Questions

Things blocking progress or needing clarification.

### Risks & Friction Points

Technical, scope, cost, or complexity risks.

### Where We Can Go Next (Aligned to My Intent)

Concrete next steps and directions. Prioritized if possible.

### Context the Next AI Must Assume

What not to re-explain. What mindset or mode to resume in.

---

Guidelines for the AI generating the summary:

- Treat the intent text above as the primary steering signal.
- Be concise, factual, and actionable.
- Do not invent details.
- Write as if this will be pasted into a new chat verbatim.
