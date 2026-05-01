---
template: world-map
device_default: DESKTOP
style_anchors:
  - "world-map panel like Foundry VTT's scene navigator"
  - "hex layouts reminiscent of Forbidden Lands or Dolmenwood"
---

# World map — Stitch prompt template

## Layout

A full-bleed map canvas occupying the center of the viewport. Hex grid (pointy-top), with terrain tiles colored or textured per biome. Visible hexes layered: terrain → grid lines → rivers/roads → tokens → fog-of-war (per-cell mask, NOT a global overlay).

**Left rail (collapsible)** — layer toggles (Terrain / Grid / Rivers / Roads / Tokens / Fog), measurement tool, ruler, current zoom. A "Reveal" affordance.

**Right rail (collapsible)** — selected hex info panel: biome name, settlements (if any), points of interest, encounter chance, weather. Below the info panel: a small location bookmark list ("The Ashen Peaks", "Silverbrook", "Forgewatch").

**Top strip** — breadcrumb path of regions (Continent ▸ Region ▸ Sub-region), and a small time-of-day / weather indicator.

A handful of tokens are placed on hexes near the center: a party marker, a hostile force, a settlement, a dungeon icon.

## Mock data

```
Region: The Ashen Peaks
Time: Day 14, dawn
Weather: light snow, clear visibility ~2 hexes
Selected hex: (Q12, R-7) — Pine forest, light snow, 1 hex SE of Silverbrook
  Encounter chance: 15% (forest, dawn)
  Weather: snow, accumulating
  Travel time across: 4 hours (foot), 1 hour (horseback)
  Notable: trail to Forgewatch follows the river NE

Settlements visible:
  - Silverbrook (village) — population ~280, mining + furrier
  - Forgewatch (keep) — Order of Moradin garrison, ~60 souls
  - Ashpeak Hold (ruin) — abandoned dwarven outpost, dangerous

Tokens placed:
  - Party (PC group, 4 figures)
  - Goblin warband (hostile, last seen 2 days ago, dotted line trail)
  - Caravan (neutral, en route to Silverbrook)
  - Dragon nest marker (rumor, unverified)
```

## Brief slot

```
{{BRIEF}}
```
