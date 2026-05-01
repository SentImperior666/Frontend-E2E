---
key: ethereal-arcane
era: timeless / between-worlds
intent: weightless, luminous, runic
---

# Ethereal arcane

The aesthetic for spell descriptions, eldritch lore, planar travel, and divinations. Things glow from within. Edges are not quite where they appear.

## Ambiance adjectives

- luminous, prismatic, runic
- weightless, half-lit
- diaphanous, smoke-veiled
- starlit-by-day
- harmonic, geometric, mathematical
- otherworldly but not threatening

## Mature-tool style refs

- Magic: the Gathering's blue control card design language
- BG3's spell visual feedback
- Hellblade: Senua's Sacrifice's rune iconography

## Color/material palette (in prose)

The dominant tone is a deep midnight (`#0e1424`) shifting to a pale twilight (`#a8b6e0`). Accents are `rune-blue` and a violet (`#8a6ad8`). Highlights — gold-flecked starlight, but cooler than the parchment aesthetic's candle gold. Surfaces feel like leaded glass or polished obsidian: subtle reflections, never matte.

Texture: gentle gradient washes, prismatic chromatic aberration on accents, faint constellation overlays on background surfaces. Avoid grain.

## Typographic intent

- Display: a delicate-but-confident face — Cormorant, or a sharply geometric serif at light weight. Italic emphasis works well.
- Body: a humanist serif at slightly looser tracking than parchment. Comfortable measure ~65ch.
- Iconography: rune-shaped glyphs with hairline strokes; matched stroke weight to body.
- Numerals: oldstyle figures; tabular for stat blocks.

## Motion intent

- Subtle, continuous, almost ambient.
- Page transitions: a slow chromatic-aberration ease-in (300ms) followed by content settle.
- Hover: a faint rune trace under the element, fading in then out.
- Dice: floating roll with ghost trails, slower than physical (1200–1600ms).
- Spell cast feedback: prismatic ripple from the affected region.
- Strict respect for `prefers-reduced-motion`: replace continuous ambient motion with one-off transitions.

## Anti-patterns

- **Hard solid borders.** Edges should feel slightly less defined than they actually are — a 1px border with a 4px low-opacity glow is the right register.
- **Saturated reds.** This aesthetic doesn't have arterial red. Damage feedback uses a desaturated rose.
- **Dense text on dark backgrounds.** When body text gets long, switch to a lighter surface inset; never run long body on full midnight.
- **Hex / square grids in obvious black lines.** When ethereal calls for a grid, draw it in starlight — luminous lines under the elements, never above.
