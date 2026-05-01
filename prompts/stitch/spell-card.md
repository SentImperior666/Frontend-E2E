---
template: spell-card
device_default: DESKTOP
style_anchors:
  - "spell card layout reminiscent of D&D Beyond's spell pages"
  - "school-coded borders in the spirit of Wizards of the Coast's official card art"
---

# Spell card — Stitch prompt template

## Layout

A single spell card, roughly 320×440. Vertical orientation. From top to bottom:

1. **Header band** — spell name in a display face, level badge top-right corner, school name as small caps top-left. School-coded border accent (color or rune).
2. **Meta row** — 4 cells: casting time | range | components glyphs (V/S/M with M-cost in subscript if any) | duration. Concentration marker as a small "C" icon when applicable.
3. **Body** — spell description in a body face, comfortable measure (~50ch), small drop-cap on the leading paragraph. At-higher-levels addendum below the main body, separated by a thin rule.
4. **Footer strip** — class availability chips, prepared/known toggle area (visual only — no interaction), and a small "View ritual rules" affordance for ritual spells.

The card is a single artifact — no surrounding chrome, no list context.

## Mock data

```
Spell: Fireball
Level: 3 (Evocation)
Casting time: 1 action
Range: 150 ft.
Components: V, S, M (a tiny ball of bat guano and sulfur)
Duration: Instantaneous
Classes: Sorcerer, Wizard

A bright streak flashes from your pointing finger to a point you choose within range and then blossoms with a low roar into an explosion of flame. Each creature in a 20-foot-radius sphere centered on that point must make a Dexterity saving throw. A target takes 8d6 fire damage on a failed save, or half as much damage on a successful one.

The fire spreads around corners. It ignites flammable objects in the area that aren't being worn or carried.

At Higher Levels: When you cast this spell using a spell slot of 4th level or higher, the damage increases by 1d6 for each slot level above 3rd.
```

## Brief slot

```
{{BRIEF}}
```
