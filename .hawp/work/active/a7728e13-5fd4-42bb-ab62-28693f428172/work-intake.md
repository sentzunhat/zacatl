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
- The user approved unDraw Handcrafts and asked to put its **Code** illustration inside a terminal, with taller grass and a brown ground touching the terminal. The user then asked for less brown and a shorter dirt layer, so the soil is shallow with a green moss-like edge. The site's picker had no match for “grass” or “ground,” so original SVG geometry makes the taller reed-like grass and soil cutaway while the Handcrafts code drawing stays inside the terminal. Its published license permits commercial and personal use and modification without attribution, but prohibits asset-pack redistribution, competing-service replication, and use of its content to train automated systems. The asset is used as part of one card, not redistributed as a pack.
- On 2026-10-23, the repository owner explicitly approved adapting the concept for the public README and LinkedIn profile Featured section, and requested a PR from a branch without the `codex/` prefix. This supersedes the earlier private-draft-only boundary for these two surfaces. Package inclusion remains out of scope.

## Impact and risk

Small, reviewable addition: a no-dependency Node script emits a hand-drawn-style SVG plus a PNG derivative for README and LinkedIn Featured use. **Risk:** low; owner approval and current LinkedIn preview dimensions are recorded in the plan.

## Scope

- Keep a deterministic generator in `scripts/graphics/`; store the public SVG and PNG under `docs/assets/`.
- Use the approved Handcrafts Code illustration and original SVG geometry; no AI bitmap, product screenshots, logos, or unsupported claims.
- Publish the SVG and PNG as documentation assets under `docs/assets/`; display the PNG in README.
- Do not add assets to package exports or release assets, and do not present the one-off palette as a brand-system change.

## Acceptance criteria

- [x] The script runs with the repository's supported Node runtime and regenerates the SVG deterministically without adding dependencies.
- [x] Generated SVG is well-formed and accessible (title and description), with visually clear SVG and PNG output at thumbnail scale.
- [x] Content reflects only verified Zacatl architecture concepts and does not imply hosted-service or performance guarantees.
- [x] Work is isolated from existing path/export and source-layout changes.
- [x] Owner approved public README and LinkedIn profile Featured use on 2026-10-23.
- [x] LinkedIn Featured item visibly displays the uploaded card and saved description; verified in the signed-in profile UI on 2026-10-23.
- [x] No package version, dependency, or package behavior change occurs.

## Owner approval requirements

User approval on 2026-10-23 covers adding the image to the public README and LinkedIn profile Featured section. It does not cover package inclusion or release changes.

## Plan and implementation

1. Draw a compact editorial card with the Code handcraft within a terminal window, taller reed-like grass, a shallow green-edged soil cutaway touching the terminal base, three labeled architecture layers, and a restrained one-off palette.
2. Keep the source generator at `scripts/graphics/generate-zacatl-featured-card.mjs`; it writes `docs/assets/zacatl-social-card.svg`.
3. Display the PNG banner in the README and add the image to the owner's LinkedIn Featured profile; verify rendering and platform visibility.

## Verification

- [x] Run the generator and verify the SVG parses.
- [x] Regenerate the revised card twice and confirm identical SHA-256: `d099b470af1f587b03e434cd41be036a38dc33aa26c391bada3faa5da4215f08`.
- [x] Render and inspect the revised card at 1200×627 and 360×188; terminal-to-ground contact, taller grass, shallow green soil edge, and labels remain legible.
- [x] The public PNG is 1200×627 PNG and is regenerated from the SVG using `rsvg-convert`; repeated render produced identical SHA-256: `b4028594c738a2d2c08aa6de5ab151eb743e5b0216d8216ef5ed0ddf24bfa7e8`.
- [x] Confirm `git diff --check` for owned files and HAWP work validation for the new record.
