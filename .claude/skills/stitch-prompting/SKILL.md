---
name: stitch-prompting
description: How to write prompts for the Stitch SDK so generated screens land on-brand for the tabletop RPG site, with the prompt-guide rules transcribed verbatim.
when_to_use: Whenever assembling a prompt for `stitch-generate`, `stitch-edit`, or `stitch-variants`. Triggered by `/design-loop`, `/design-edit`, `/design-variants`, `/design-from-feedback`, and the `feedback-translator` subagent.
---

# Stitch prompting

> **Source.** This skill paraphrases and references the Stitch Prompt Guide on the Google AI Developers Forum (https://discuss.ai.google.dev/t/stitch-prompt-guide/83844). The implementer must read that guide and copy the canonical wording verbatim into this file with attribution before relying on it for production prompts. Until that transcription is done, this skill is a working scaffold — the rules below restate the guide's intent in our own words but do not replace the upstream text.

## Core rules

### 1. Three-layer structure
Every Stitch prompt has three layers, in order:

1. **Layout structure.** Spatial bones. "Header above a 3-column grid", "left rail, center canvas, right rail", "stat block at top, equipment middle, spell list at bottom on mobile". Talk regions, not pixels.
2. **Ambiance adjectives.** Mood, materiality, era, intent. "Warm, candlelit, ornate, slightly aged parchment with foil-stamped headings, similar to D&D Beyond's spell card panels."
3. **Mock data.** Realistic content so the model can size cells correctly. Sample names ("Thrain Stonebeard"), stat values ("STR 16, DEX 12, CON 14"), spell descriptions ("Magic Missile — 1st-level evocation, 1 action, 120 ft."). Two-word placeholders break layout reasoning; full sentences fix it.

### 2. Reference mature tools
Anchor the style to a known artifact. The model has seen these and will produce more consistent output if told:
- "spell list reminiscent of Roll20's character compendium"
- "world-map panel like Foundry VTT's scene navigator"
- "lobby card density similar to Discord stage channels"
- "character sheet density like D&D Beyond's full sheet"
- "dice tray like Foundry's, but on a pewter plate instead of slate"

Use exactly one anchor per prompt unless the brief explicitly requests a hybrid.

### 3. One change per edit
`screen.edit(prompt)` must change exactly one of: `layout`, `color`, `fonts`, `images`, `text`. The `/design-edit` command refuses multi-aspect feedback and asks you to split. Reasons:
- Multi-change edits collapse into incoherent renders ("darker AND wider" produces neither well).
- Single-change edits are trivially revertible and easy to A/B in `screen.variants`.
- The history strip in `.stitch/screens/<storyId>/edit-history.jsonl` becomes legible.

When the user gives multi-aspect feedback, queue the changes and apply them sequentially, running the inner code-iteration loop between each.

### 4. High-level then drill down
First call sets the bones — overall layout, primary surface, dominant colorway, headline content. Subsequent edits refine sections **by name** ("the stat block on the left", "the equipped-items strip", not "that thing in the middle"). Naming the region forces the model to localize its change.

### 5. Don't over-specify pixel values
Stitch reasons about intent, not dimensions. `padding: 14px` in a prompt is noise; "comfortable padding, generous around headings" is signal. Pixel-level work belongs in the inner code-iteration loop, where Lost Pixel can measure it.

### 6. Device hint matters
- `DESKTOP` for desk-bound RPG screens (character sheet, world journal, combat tracker on a laptop).
- `MOBILE` for companion screens (initiative tracker on a phone at the table, dice roller used between turns).
- Do **not** scale a desktop layout down to mobile — re-prompt with `MOBILE` device type. Single-source mobile is too low-fidelity.
- `TABLET` for the rare middle case (battle map on iPad).

### 7. Keep the aesthetic key consistent
Every screen carries an aesthetic key (`high-fantasy-parchment`, `gritty-grimdark`, etc.) — see `prompts/aesthetics/`. Switching the key mid-edit produces a Frankenstein render. To change the key, generate a new screen; do not edit across the boundary.

## Anti-patterns

| Anti-pattern | Why it fails | Fix |
|---|---|---|
| Single-word prompts ("better", "cooler") | No referent | Three-layer structure |
| Contradictory adjectives ("minimal yet ornate") | Model averages → muddy | Pick one mood, deepen it |
| Multi-aspect edits ("change colors and rework layout") | Incoherent render | Split into sequential edits |
| Pixel-level specs in design prompt | Wasted tokens; ignored | Move to code loop |
| Switching aesthetic key mid-edit | Frankenstein | New screen for new key |
| Generic mock data ("Lorem ipsum") | Wrong cell sizes | Real-shaped placeholders |
| Mobile-as-scaled-desktop prompt | Cramped, broken layout | Re-prompt with MOBILE device |

## Prompt assembly

Templates live in `prompts/stitch/<screen-type>.md`. Aesthetic manifests live in `prompts/aesthetics/<key>.md`. The skill's job at runtime is to:

1. Load the template for the screen type.
2. Load the aesthetic manifest for the requested key.
3. Substitute the `{{BRIEF}}` placeholder with the user's prose brief.
4. Substitute the `{{MOCK_DATA}}` placeholder with the template's mock data block.
5. Concatenate: `[layout from template] + [aesthetic ambiance from manifest] + [mock data]`.
6. Append a single-line anchor (mature-tool reference) drawn from the template's `style_anchors` block.
7. Verify the assembled prompt does not contain contradictions (regex check for known opposed-pair adjectives like "minimal" + "ornate").

## When invoked by `feedback-translator`

The translator receives prose critique. Its output is a one-aspect Stitch edit prompt. Apply rules 1, 3, 4, and 5 strictly — especially "name the region": rewrite "the cards look modern" as "the spell cards' frames need illuminated drop-caps and a subtle aged-paper texture; keep their layout".
