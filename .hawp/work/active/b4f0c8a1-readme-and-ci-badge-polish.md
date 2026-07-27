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
- 2026-07-27 (same day, follow-up): Shipped via PR #51 (merged, squash). Along
  the way:
  - Verified TOC anchors against GitHub's actual rendered permalink hrefs via
    `gh api -H "Accept: application/vnd.github.html"` rather than guessing —
    caught and fixed a self-inflicted regression where a first "fix" pass used
    the wrong attribute (`id` instead of the visible `href`) and broke every
    anchor; reverted before merge.
  - Added `docs/migration/README.md` as an index; root README's Documentation
    table now links there once instead of listing each guide.
  - Added an animated walkthrough GIF for `fastify-mongodb-react` — stitched
    locally with `ffmpeg` from the existing Playwright screenshots (no new
    capture, no external hosting, 52KB).
  - Grouped badges into Package/Quality/Stack rows; documented inline why
    there's one `CI` badge instead of a separate CVE badge (no reliable way to
    badge a single job within a `workflow_call`-only sub-workflow without
    reintroducing the frozen-badge bug fixed earlier this session).
  - Hit a real merge conflict on PR #51 (`dev` vs `main` diverged after
    several squash-merges this session touched the same README lines) —
    resolved in favor of `dev`'s content, which strictly superseded `main`'s
    stale badges/backlog row. Worth watching: this squash-merge-heavy workflow
    will keep producing `dev`/`main` divergence; consider rebasing `dev` onto
    `main` after each merge if conflicts become frequent.
  - Deferred, needs user input: "benefits from other projects like tekit,
    mictlan, howfily" — none of these are recognizable library names; asked
    the user to clarify rather than guess.
