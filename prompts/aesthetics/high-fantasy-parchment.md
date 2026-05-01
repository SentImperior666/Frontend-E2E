---
key: high-fantasy-parchment
era: medieval-romantic
intent: warm, scholarly, ornate-but-readable
---

# High fantasy — parchment & ink

The default aesthetic for the site. Warm, scholarly, slightly aged. Imagine a well-loved compendium pulled from a guild archive: the paper is cream rather than white, the headings are foil-stamped, the rules are ink-drawn. Decorative, not noisy.

## Ambiance adjectives

- warm, candle-lit, hand-illuminated
- aged but cared-for (not ruined; not dirty)
- ornate yet legible
- foil-stamped, gilt-edged in restrained measure
- scholarly, archivist, reverent
- ember-glow at decorative accents

## Mature-tool style refs

- D&D Beyond's character compendium (layout density)
- Wizards of the Coast's official PHB plates (illumination style)
- a hand-bound grimoire from a TTRPG kickstarter

## Color/material palette (in prose)

The paper is `parchment-100` cream — warm, faintly speckled, *not* white. Ink is `ink-900` near-black with a slight brown undertone — never pure black. Display headings use `candle-500` antique gold for emphasis; never use it for body text. Accents pull from `rune-blue` (cool magic) and `rune-red` (martial / fire) sparingly. Borders are `ink-500` sepia at hairline weight. Surfaces under emphasis get a subtle inner shadow (`shadow-ink-press`) to evoke pressed paper.

Texture: a subtle parchment grain on surface backgrounds. Never on body text.

## Typographic intent

- Display: Cinzel (or a comparable Roman-capital display face), 600 weight max. Headings only.
- Body: EB Garamond — humanist serif, 400/500 weights. Comfortable measure (~70ch).
- Drop-caps on long-form bodies (journal, spell descriptions). Drop-cap face matches display.
- Numerals: oldstyle figures in body, lining figures in stat blocks.
- Tracking: slightly relaxed for display, tight for body.
- Avoid: blackletter for everything; mixing two display faces; setting body text in display face.

## Motion intent

- Page transitions: ink-bleed crossfade (fade + 2px subtle blur).
- Hover affordances: candle-glow grow on accents (200ms ease-out).
- Dice animations: physical roll, 800–1200ms, settle bounce.
- Spell cast / damage feedback: brief ember flash, no screen-shake.
- Respect `prefers-reduced-motion`: replace ink-bleed with simple opacity fade.

## Anti-patterns

- **Pure black on pure white.** Ever. The aesthetic dies.
- **Single-flat-color buttons.** The aesthetic expects a worked surface — at minimum a 1px inner border + 1px outer shadow.
- **Sans-serif body text.** Body is humanist serif. Sans appears only for monospace numbers in dice rolls and timestamps if the design system permits it.
- **Modern tab bars / segmented controls without ornament.** A tab bar in this aesthetic gets a corner flourish, a brass divider, or both — but not three.
- **Texture on body text.** Parchment grain belongs on surfaces; on text it kills legibility.
- **Multi-color rainbow accents.** This aesthetic uses one primary + two semantic accents. More reads as wrong era.
