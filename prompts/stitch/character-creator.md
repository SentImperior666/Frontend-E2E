---
template: character-creator
device_default: DESKTOP
style_anchors:
  - "step-based character creator like D&D Beyond's character builder"
  - "ability-score allocation conventions from Pathfinder 2e Nexus"
---

# Character creator — Stitch prompt template

## Layout

A multi-step creator. The current screen shows the **Ability Scores** step (point-buy / standard array / roll, with point-buy active).

**Top strip** — step progress: Race → Class → Background → Ability Scores (active) → Skills → Equipment → Spells → Review. Each step a chip with a state (done / active / upcoming).

**Left rail** — character summary so far (race, class, background, level — all chosen). A small portrait area at top. Total points remaining.

**Center** — point-buy widget. Six ability score rows, each with the ability name, base value (8), modifier-from-race (+2 for STR if dwarf, etc.), final value, and `+` / `-` buttons. Cost-per-point varies non-linearly past 13 (per 5e rules); show the cost next to each `+` button.

**Right rail** — a "Why does this matter?" explainer panel that updates context-aware as the user touches different abilities (right now it explains WIS for the chosen Cleric class).

**Bottom strip** — "Back" / "Next" buttons.

## Mock data

```
Step: Ability Scores (point-buy, 27 points)
So far:
  Race: Mountain Dwarf (+2 STR, +2 CON)
  Class: Cleric (Forge Domain) — primary stat WIS
  Background: Guild Artisan
  Level target: 1 (will be 7 after epilogue session)

Current allocation (8 base + race bonuses, 27 points to spend):
  STR  base 8, race +2, spent 5 pts (→ 13)        final 15
  DEX  base 8, race +0, spent 4 pts (→ 12)        final 12
  CON  base 8, race +2, spent 5 pts (→ 13)        final 15
  INT  base 8, race +0, spent 3 pts (→ 11)        final 11
  WIS  base 8, race +0, spent 9 pts (→ 15)        final 15
  CHA  base 8, race +0, spent 1 pt  (→ 9)         final 9

Points remaining: 0 / 27   (cost for next +1 to STR: 2 pts — unavailable)

Why does this matter?
WIS is your primary spellcasting ability as a Cleric. It determines your spell save DC (8 + proficiency + WIS mod) and spell attack bonus. At final +2, your save DC at level 1 is 13 (8 + 2 prof + 2 WIS + 1 if you take the focus feat). You'll typically want WIS at 15 or 16 at level 1 and improve it via Ability Score Improvements at level 4 and 8.
```

## Brief slot

```
{{BRIEF}}
```
