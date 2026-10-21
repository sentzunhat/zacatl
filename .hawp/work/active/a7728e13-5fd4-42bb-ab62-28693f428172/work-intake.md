# Zacatl Featured-card vector artwork — intake

**UUID:** `a7728e13-5fd4-42bb-ab62-28693f428172`
**Type:** improvement
**Reported:** 2026-10-21
**Status:** in-progress

## Input

> Make the Zacatl LinkedIn Featured image feel less AI-generated. Create a repo-native, reproducible script and a hand-drawn SVG concept rather than using generated bitmap art.

## Investigation

- The public README describes Zacatl as a TypeScript framework for modular services, with a Service composition model, application/domain/infrastructure layers, and server/CLI/desktop platforms.
- No existing Zacatl social-card or approved brand illustration was found in the inspected repository scope.
- Existing active item `1e905c1f` audits package path/export scripts. The planned graphics tool is isolated under `scripts/graphics/` and does not change package exports, build scripts, or publish behavior.
- The user approved unDraw Handcrafts and asked to put its **Code** illustration inside a terminal, with taller grass and a brown ground touching the terminal. The user then asked for less brown and a shorter dirt layer, so the soil is shallow with a green moss-like edge. The site's picker had no match for “grass” or “ground,” so original SVG geometry makes the taller reed-like grass and soil cutaway while the Handcrafts code drawing stays inside the terminal. Its published license permits commercial and personal use and modification without attribution, but prohibits asset-pack redistribution, competing-service replication, and use of its content to train automated systems. The asset is used as part of one private card, not redistributed as a pack.
- User authorized a private draft illustration and its generating script; LinkedIn upload, publication, website integration, and package inclusion are not authorized.

## Impact and risk

Small, reviewable addition: a no-dependency Node script emits a hand-drawn-style SVG concept in this work-item folder. **Risk:** low while private; medium if used publicly before owner review and validation of LinkedIn crop requirements.

## Scope

- Add a deterministic script in `scripts/graphics/` and one draft SVG under this work item.
- Use the approved Handcrafts Code illustration and original SVG geometry; no AI bitmap, product screenshots, logos, or unsupported claims.
- Keep the draft outside `src/`, `website/`, package exports, and release assets.
- Do not deploy, publish, upload to LinkedIn, or change the existing site/brand system.

## Acceptance criteria

- [x] The script runs with the repository's supported Node runtime and regenerates the SVG deterministically without adding dependencies.
- [x] Generated SVG is well-formed, accessible (title and description), visually clear at thumbnail scale, and source-controlled only as a private work artifact.
- [x] Content reflects only verified Zacatl architecture concepts and does not imply hosted-service or performance guarantees.
- [x] Work is isolated from existing path/export and source-layout changes.
- [ ] Founder reviews and approves the concept before any move to public assets or LinkedIn.
- [x] No deployment, publication, upload, or package behavior change occurs.

## Owner approval requirements

User approval covers the private concept/script only. Separate explicit approval is required before adding the SVG to a public website/release, creating or editing a public LinkedIn page, or uploading the image.

## Plan and implementation

1. Draw a compact editorial card with the Code handcraft within a terminal window, taller reed-like grass, a shallow green-edged soil cutaway touching the terminal base, three labeled architecture layers, and a restrained palette that is explicitly a draft rather than Zacatl brand guidance.
2. Keep the script self-contained in `scripts/graphics/generate-zacatl-featured-card.mjs`; it writes only `.hawp/work/active/a7728e13-5fd4-42bb-ab62-28693f428172/zacatl-featured-card.svg`.
3. Parse and inspect the generated SVG, verify repeated generation is stable, and review the narrow working-tree diff.

## Verification

- [x] Run the generator and verify the SVG parses.
- [x] Regenerate the revised card twice and confirm identical SHA-256: `275f02dc76e918ba300f3e15e6d20fa33d5f7cccf09569fd6740f1d67fb142e9`.
- [x] Render and inspect the revised card at 1200×630 and at 360×189 thumbnail size; terminal-to-ground contact, taller grass, the shallow green soil edge, and labels remain legible.
- [x] Confirm `git diff --check` for owned files and HAWP work validation for the new record.
