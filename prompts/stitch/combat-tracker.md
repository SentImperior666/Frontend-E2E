---
template: combat-tracker
device_default: DESKTOP
style_anchors:
  - "initiative tracker reminiscent of Foundry VTT's combat tab"
  - "actor row density similar to Roll20's combat tracker"
---

# Combat tracker — Stitch prompt template

## Layout

A vertical strip of actor rows, top-to-bottom = play order. Each row contains: portrait (40×40), name, current HP / max HP with a thin under-bar, AC chip, condition chips (compact, with truncation indicator if more than 3), the actor's initiative number, and a small actions menu affordance.

The current actor's row is highlighted with a stronger left-edge accent AND a heavier border (two cues, not just color). Dead/unconscious actors are dimmed but kept in the list — never removed.

Above the strip: round counter (Round 3) + turn indicator + a "Next turn" / "End turn" / "Hold" action row.

Below the strip: a notes panel for the current encounter — terrain, lair actions, environmental effects.

## Mock data

```
Round: 3, Turn: Lyra (active)
Actors (initiative order):
  21 — Brann (PC)        HP 34/40   AC 17   conditions: —
  19 — Lyra (PC, ACTIVE) HP 22/28   AC 15   conditions: Hidden
  17 — Goblin Boss       HP 18/27   AC 14   conditions: Bloodied
  15 — Goblin A          HP  4/7    AC 13   conditions: Bloodied
  12 — Goblin B          HP  0/7    AC 13   conditions: Unconscious
  10 — Thrain (PC)       HP 56/62   AC 19   conditions: Bless +1, Spirit Guardians
   8 — Wolf              HP 11/11   AC 13   conditions: —

Encounter: Forest path ambush
Terrain: difficult terrain in undergrowth squares
Lair actions: none
Environmental: light rain, dim light
```

## Brief slot

```
{{BRIEF}}
```
