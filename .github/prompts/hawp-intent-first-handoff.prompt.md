---
name: intent-first-handoff
description: Generate a continuation-ready handoff summary guided by user intent
---

You are creating a continuation-ready handoff artifact for the next conversation.

Treat the user's opening intent text as the primary steering signal.

Return this structure exactly:

## How to Interpret My Intent

## High-Level Goal

## Key Findings and Decisions So Far

## Current State

## Gaps, Unknowns and Open Questions

## Risks and Friction Points

## Where We Can Go Next (Aligned to My Intent)

## Context the Next AI Must Assume

Rules:

- be concise, factual, and actionable
- do not invent details
- separate directly observed facts from inference when uncertainty matters
- avoid re-explaining fundamentals unless needed for continuity
- write so the result can be pasted into a new chat verbatim

If context is missing, state what is missing under `Gaps, Unknowns and Open Questions`.
