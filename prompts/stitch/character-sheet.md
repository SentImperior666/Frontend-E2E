---
template: character-sheet
device_default: DESKTOP
style_anchors:
  - "character sheet density like D&D Beyond's full sheet"
  - "stat block conventions reminiscent of Roll20's character compendium"
  - "Pathfinder 2e SRD layout if PF2 system specified"
---

# Character sheet — Stitch prompt template

## Layout (DESKTOP)

A single full-bleed character sheet. Three columns:

- **Left rail** — character identity (portrait area, name, race, class, level), the six core ability scores stacked vertically as stat blocks (each: ability label, large numeric score, signed modifier pill, saving-throw delta beneath), then below that a compact list of skills with proficiency markers.
- **Center column** — combat-essentials at top: HP (current / max + temp HP overlay), AC, initiative, speed; below that, equipped weapons / attacks as a 2-column grid; below that, a notes / features-and-traits section that can scroll independently.
- **Right rail** — spell list grouped by level (cantrips first), each entry a compact card with school, components, range, and a prepared/known marker. Spell slots tracker at top of the rail (filled bubbles per slot expended).

Header strip across the top with character name, class+level chips, current encounter context (initiative number if in combat), and a small actions row (Roll, Rest, Edit).

## Layout (MOBILE)

When `--device MOBILE`, re-prompt with this structure: tabs across the top (Stats / Combat / Spells / Inventory / Notes); each tab a single-column scroll. Stat block tab still uses the six-stat grid but in 3×2 instead of 1×6. Spell list collapses to expandable accordions per level.

## Mock data

Use this data block verbatim — it sizes cells correctly:

```
Character: Thrain Stonebeard
Race: Mountain Dwarf      Class: Cleric of Moradin (Forge Domain)      Level: 7
HP: 56 / 62  (+5 temp)    AC: 19    Init: +1    Speed: 25 ft

STR 16 (+3)  DEX 12 (+1)  CON 16 (+3)  INT 11 (+0)  WIS 18 (+4)  CHA 10 (+0)
Saves (proficient): WIS, CHA

Skills (proficient): Insight +7, Persuasion +3, Religion +3, History +3
Passive Perception: 14    Languages: Common, Dwarvish, Celestial

Attacks:
  Warhammer +1 (versatile)   +6 to hit   1d8+4 bludgeoning  /  1d10+4 versatile
  Hand Crossbow              +4 to hit   1d6+1 piercing      Range 30/120

Spell slots:  1: ●●●●  2: ●●●○  3: ●●●○  4: ●●○○

Spells prepared:
  Cantrips: Sacred Flame, Light, Mending, Spare the Dying
  1: Bless, Cure Wounds, Healing Word, Identify, Shield of Faith
  2: Aid, Heat Metal, Spiritual Weapon
  3: Spirit Guardians, Crusader's Mantle, Animate Dead
  4: Stoneskin, Banishment

Features & Traits:
  - Channel Divinity (2/rest): Turn Undead, Artisan's Blessing
  - Forge Domain — Blessing of the Forge, Soul of the Forge
  - Dwarven Resilience: advantage vs poison
```

## Brief slot

```
{{BRIEF}}
```

(If empty, fall back to: "Render the layout and mock data above; pick the aesthetic from the requested aesthetic key; honor the system implied by the data.")
