# Add Zacatl social card to README and LinkedIn Featured

**UUID:** `a7728e13-5fd4-42bb-ab62-28693f428172`
**Type:** improvement
**Reported:** 2026-10-21
**Risk:** low; public use approved by repository owner on 2026-10-23
**Status:** in-progress

## Input

> Make the Zacatl LinkedIn Featured image feel less AI-generated. Create a repo-native, reproducible script and a hand-drawn SVG concept rather than using generated bitmap art.

## Goal

Create an editable Zacatl social card with a deterministic generator script. The hand-drawn illustration uses the approved Handcrafts code illustration inside a terminal with grass beneath it and explains modular service composition.

## Investigation

The public Zacatl README describes a TypeScript framework for modular services and explains its Service composition model: Application, Domain, and Infrastructure layers work with Server, CLI, and Desktop platforms. The repository did not contain a Zacatl social illustration in the inspected scope. This item isolates the asset, README reference, and generator from package exports and build/publish behavior.

The existing `1e905c1f` item owns audit and maintenance of package path/export scripts. This item does not touch those scripts, package manifests, generated exports, or build/publish behavior.

The user approved using [unDraw Handcrafts](https://handcrafts.undraw.co/app) for the drawing and requested moving the code mark into a terminal, with grass underneath. The picker search returned no matching artwork for “grass” or “ground,” so the composition keeps the site's **Code** handcraft inside a hand-drawn terminal and uses original SVG geometry for taller, reed-like grass and a brown soil cutaway that meets the terminal base. In response to the user's review, the soil layer is shallow with a green moss-like edge. The [license](https://handcrafts.undraw.co/license) permits commercial and personal use and modification without attribution; it prohibits redistribution as an asset pack, competing integrations, and use for automated-system training. No asset pack is created.

On 2026-10-23, the repository owner explicitly approved adapting this concept for the public README and LinkedIn profile Featured section, and requested a pull request from a branch without the `codex/` prefix. LinkedIn's current link-preview guidance specifies 1200×627 (1.91:1), and profile media accepts PNG/JPEG. The public assets use this ratio. The LinkedIn upload is a separate account action.

## Plan

1. Use a restrained editorial composition with the Handcrafts Code doodle inside a terminal, taller reed-like grass and a shallow, green-edged soil layer touching the terminal base, concise Zacatl positioning, and three labels for Application, Domain, and Infrastructure. Keep the warm palette a one-off concept, not a Zacatl brand rule.
2. Add a no-dependency Node script under `scripts/graphics/` that writes the fixed SVG source to `docs/assets/zacatl-social-card.svg`; render a PNG derivative at `docs/assets/zacatl-social-card.png` for README display and LinkedIn upload.
3. Add a `<title>` and `<desc>`, use semantic grouping and readable contrast, inline the modified doodle so the SVG has no remote dependencies, and avoid logos, screenshots, performance promises, or hosted-service language.
4. Run the script, parse the SVG as XML, rerun it to verify deterministic output, and inspect only owned paths.
5. Add the public image to the README and upload it to the LinkedIn profile Featured section once the stable public asset is available.

## Risks and approval

The owner approved public README and LinkedIn profile use on 2026-10-23. The card is an illustration, not a logo or official color-system specification. Do not add it to package exports or release assets. Do not claim LinkedIn publication until the profile visibly shows the uploaded item.

## Acceptance criteria

- [x] The script runs with the repository's supported Node runtime, adds no dependencies, and emits the same SVG on repeated runs.
- [x] The generated SVG is well-formed and includes an accessible title and description.
- [x] The Handcrafts source and license are recorded, and the selected drawing is used as part of this card rather than redistributed as a standalone pack.
- [x] The drawing remains legible at a reduced thumbnail size and describes only public, evidence-backed Zacatl architecture.
- [x] The generator, SVG, and PNG stay in `scripts/graphics/` and `docs/assets/`; package metadata, exports, and release behavior do not change.
- [x] Owner approved the concept for public README and LinkedIn profile use on 2026-10-23.
- [x] LinkedIn link-preview dimensions and profile media formats checked against current LinkedIn Help.
- [ ] LinkedIn Featured profile item visibly displays the uploaded banner.
- [x] No package version, dependency, package export, or release asset changes.

## Verification

- [x] Regenerate the SVG, parse it as XML, and render the 1200×627 PNG derivative.
- [x] Two generator runs produced identical SVG SHA-256: `d099b470af1f587b03e434cd41be036a38dc33aa26c391bada3faa5da4215f08`.
- [x] PNG render reproduced SHA-256 `b4028594c738a2d2c08aa6de5ab151eb743e5b0216d8216ef5ed0ddf24bfa7e8`.
- [x] Inspect the final artwork at 1200×627 and 360×188; labels and illustration remain legible.
- [x] The Handcrafts Code vector is embedded locally; the generated SVG has no external image or reference dependencies.
- [x] HAWP backlog consistency passed: active 10/10, closed 10/10, parked 5/5. Overall HAWP validation still fails on older closed-record completeness issues; this new item introduced no backlog integrity error.
- [x] Owned SVG, PNG, generator, README, and work-item text files pass `git diff --check`.

## Outcome

In progress: the owner approved public use. The README and public SVG/PNG assets are on the scoped branch. LinkedIn Featured upload remains to be completed and verified.
