# Create a hand-drawn Zacatl Featured-card SVG

**UUID:** `a7728e13-5fd4-42bb-ab62-28693f428172`
**Type:** improvement
**Reported:** 2026-10-21
**Risk:** low for private draft; medium for public use
**Status:** in-progress

## Input

> Make the Zacatl LinkedIn Featured image feel less AI-generated. Create a repo-native, reproducible script and a hand-drawn SVG concept rather than using generated bitmap art.

## Goal

Create a private, editable Zacatl Featured-card illustration with a small deterministic generator script. The concept should feel hand drawn, use the approved Handcrafts code illustration inside a terminal with grass beneath it, explain modular service composition, and remain separate from public assets until reviewed.

## Investigation

The public Zacatl README describes a TypeScript framework for modular services and explains its Service composition model: Application, Domain, and Infrastructure layers work with Server, CLI, and Desktop platforms. The repository did not contain an approved Zacatl social illustration in the inspected scope. The current source worktree has extensive unrelated changes, including active source-layout and build-script work; this item therefore isolates all new files to a dedicated graphics script and this HAWP item folder.

The existing `1e905c1f` item owns audit and maintenance of package path/export scripts. This item does not touch those scripts, package manifests, generated exports, or build/publish behavior.

The user approved using [unDraw Handcrafts](https://handcrafts.undraw.co/app) for the drawing and requested moving the code mark into a terminal, with grass underneath. The picker search returned no matching artwork for “grass” or “ground,” so the composition keeps the site's **Code** handcraft inside a hand-drawn terminal and uses original SVG geometry for taller, reed-like grass and a brown soil cutaway that meets the terminal base. In response to the user's review, the soil layer is now shallow with a green moss-like edge to reduce the brown area. The [license](https://handcrafts.undraw.co/license) permits commercial and personal use and modification without attribution; it prohibits redistribution as an asset pack, competing integrations, and use for automated-system training. No asset pack is created. The card remains a private concept.

## Plan

1. Use a restrained editorial composition with the Handcrafts Code doodle inside a terminal, taller reed-like grass and a shallow, green-edged soil layer touching the terminal base, concise Zacatl positioning, and three labels for Application, Domain, and Infrastructure. Keep the warm palette a one-off concept, not a Zacatl brand rule.
2. Add a no-dependency Node script under `scripts/graphics/` that writes the fixed SVG output into this work-item folder. Keep the output out of `src/`, `website/`, package exports, and release paths.
3. Add a `<title>` and `<desc>`, use semantic grouping and readable contrast, inline the modified doodle so the SVG has no remote dependencies, and avoid logos, screenshots, performance promises, or hosted-service language.
4. Run the script, parse the SVG as XML, rerun it to verify deterministic output, and inspect only owned paths.
5. Obtain founder review before any public asset integration or LinkedIn upload; separately verify current LinkedIn size and crop requirements before creating a production card.

## Risks and approval

Private concept risk is low. Public use carries medium risk because it represents the Zacatl brand and the correct LinkedIn crop has not been verified. User authorization covers a local draft and script only. Do not deploy, publish, upload, or add the draft to package/site assets.

## Acceptance criteria

- [x] The script runs with the repository's supported Node runtime, adds no dependencies, and emits the same SVG on repeated runs.
- [x] The generated SVG is well-formed and includes an accessible title and description.
- [x] The Handcrafts source and license are recorded, and the selected drawing is used as part of this card rather than redistributed as a standalone pack.
- [x] The drawing remains legible at a reduced thumbnail size and describes only public, evidence-backed Zacatl architecture.
- [x] New files stay in `scripts/graphics/` and this work-item directory; no package, production site, or release files change.
- [ ] Founder reviews the draft; current LinkedIn dimensions/cropping are checked before any production adaptation.
- [x] No deployment, publication, account change, LinkedIn edit, or upload occurs.

## Verification

- [x] `node scripts/graphics/generate-zacatl-featured-card.mjs` completed and wrote the expected SVG under this item.
- [x] Python's XML parser accepted the generated SVG.
- [x] Two runs produced identical SHA-256: `275f02dc76e918ba300f3e15e6d20fa33d5f7cccf09569fd6740f1d67fb142e9`.
- [x] The revised terminal, taller grass, and shallow green-edged soil layer were rendered and checked at 1200×630 and 360×189; labels and illustration remain legible at thumbnail size.
- [x] The Handcrafts Code vector is embedded locally; the generated SVG has no external image or reference dependencies.
- [x] HAWP backlog consistency passed: active 10/10, closed 10/10, parked 5/5. Overall HAWP validation still fails on older closed-record completeness issues; this new item introduced no backlog integrity error.
- [x] Owned SVG, generator, and work-item text files have no trailing whitespace.

## Outcome

In progress pending founder review of the terminal-and-grass concept and verification of current LinkedIn crop requirements before any production adaptation. The generator and final SVG remain local, private work-item files; no public asset or platform change is included.
