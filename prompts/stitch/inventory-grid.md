---
template: inventory-grid
device_default: DESKTOP
style_anchors:
  - "slot inventory reminiscent of Diablo / Path of Exile but with RPG-paper textures"
  - "encumbrance bar conventions from Pathfinder Kingmaker"
---

# Inventory grid — Stitch prompt template

## Layout

Two regions side-by-side:

**Left two-thirds — slot grid.** A 12×8 grid of inventory slots. Each occupied slot shows an item icon (centered) with a small quantity badge bottom-right when stacked. Equipped items glow with a subtle rail accent. Empty slots are visible but dim. Hover (visual representation only — show one slot in hover state) reveals an item tooltip with name, type, weight, and key stats.

Above the grid: a category filter row (All / Weapons / Armor / Consumables / Treasure / Quest), and a search field.

Below the grid: encumbrance bar with three discrete segments (Light / Medium / Heavy) plus an "Overloaded" warning state. Currently at "Medium". Numeric weight readout: "47.2 / 75 lbs".

**Right one-third — equipped panel.** Paper-doll style: head / chest / hands / waist / feet / main-hand / off-hand / neck / ring1 / ring2 / cloak. Each slot shows the equipped item's icon or an empty silhouette. Below the doll: an attunement counter ("2 / 3 attuned"). Below that: currency strip (CP / SP / EP / GP / PP) with current totals.

## Mock data

```
Carrying:
  - Warhammer +1 (equipped, main-hand)        weight 2 lb   attuned
  - Hand crossbow (equipped, off-hand)        weight 3 lb
  - Plate armor (equipped, chest)             weight 65 lb
  - Shield (equipped, off-hand alternate)     weight 6 lb
  - Holy symbol of Moradin (equipped, neck)
  - Healing potion ×3                         weight 1.5 lb total
  - Rations ×7 days                           weight 14 lb
  - Bedroll, mess kit, tinderbox, torch ×4    weight 12 lb total
  - Rope (50 ft, hempen)                      weight 10 lb
  - Spell focus: silvered hammer charm        weight 1 lb    attuned
  - Letter from Cleric Brother Aldric (quest)
  - Bag of 47 GP, 12 SP, 200 CP

Encumbrance: 47.2 / 75 lbs (Medium)
Attunement: 2 / 3
Currency: CP 200, SP 12, EP 0, GP 47, PP 0
```

## Brief slot

```
{{BRIEF}}
```
