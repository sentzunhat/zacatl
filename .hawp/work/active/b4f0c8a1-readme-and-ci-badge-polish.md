# README overhaul + CI badge polish — quick iterations, no release cutover

**UUID:** `b4f0c8a1-readme-and-ci-badge-polish` · **Type:** docs/tooling · **Priority:** P2 · **Reported:** 2026-07-27
**Status:** in-progress
**Owner:** agent (unassigned)

---

## Goal

Bring the root `README.md` and CI status badges up to the bar set by widely-used
Node.js libraries with polished public docs (Fastify, Mongoose) — this is a
production-facing consumer library, and the README is the first thing a
prospective consumer sees.

**Explicitly out of scope for now: cutting a release.** This is quick-iteration
polish work that lands on `dev` (or directly reviewed in small PRs) without a
version bump, changelog entry, or npm publish. Batch this kind of improvement
until the `e7a20d15` (v0.1.0) milestone, which is the next real cutover point.
Follow-up iterations on this same item don't need their own plan file — append
to this one's log below.

## Scope (2026-07-27 session)

- Root `README.md` restructure: fix the broken coverage-badge link (badge text
  showed 91.41% but linked to a *different* shields.io image showing 91.19% —
  copy-paste bug), refresh the stale test-count badge (648 → actual count),
  add a table of contents, add real Mongoose/Fastify code examples (not just
  a features table), surface the existing Playwright-captured screenshots
  from `examples/screenshots/` (previously only linked from
  `examples/README.md`, invisible from the root), add a Mermaid architecture
  diagram, tighten the docs/links tables.
- CI badges: already collapsed to a single `ci.yml` badge earlier this session
  (see PR #50). Further improvement: badge grouping/style consistency,
  consider per-check visibility now that `ci.yml` is the only live workflow.
- Anything else found along the way — logged below as it happens.

## Non-goals

- No version bump, no changelog entry, no release.
- No new screenshot capture (existing PNGs in `examples/screenshots/` are
  reused as-is; re-run `npm run screenshots:examples:capture` only if UI
  actually changed, which it hasn't).
- No fabricated logo/banner image — none exists in the repo today and
  generating one is out of scope for this pass.

## Log

- 2026-07-27: Item opened. Researched Fastify's and Mongoose's README
  structure (badges grouping, TOC, dual-example code formatting, docs
  organization) for inspiration. Confirmed `examples/screenshots/` already has
  real Playwright-captured PNGs per example and `examples/DOCKER.md` already
  has a Docker architecture writeup — reused both rather than fabricating new
  diagrams/images.
