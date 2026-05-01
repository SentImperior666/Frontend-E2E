---
template: dice-roller
device_default: DESKTOP
style_anchors:
  - "dice tray like Foundry VTT's, on a dimensional surface"
  - "history strip reminiscent of Roll20's chat output"
---

# Dice roller — Stitch prompt template

## Layout

A bordered dice tray with a textured surface. Left two-thirds: the rolling area, with a row of polyhedral die selectors above (d4, d6, d8, d10, d12, d20, d100) — each selector a small button showing the die shape and current count. Below the selectors: the rolling surface, occupied with a few die mid-roll for visual anchor. Beneath the tray: a modifier input (`+ / -` numeric) and an advantage/disadvantage tri-state toggle.

Right one-third: a vertical history strip showing the last ~12 rolls, each entry a single line: actor name, roll label, breakdown ("d20 + 5"), result, timestamp. Highlight the most recent entry; show critical hits (nat 20) and fumbles (nat 1) with distinct rail accents and small icons in addition to color.

A "Roll" call-to-action sits prominently below the tray. A smaller "Clear pool" sits next to it.

## Mock data

```
Selected pool: 1d20 + 1d6 + 5
Modifier: +5
State: Normal (advantage off, disadvantage off)
Latest roll: Thrain — Attack roll, d20 + 5 = 22  (CRITICAL)
Recent history (newest first):
  Thrain — Damage, 1d8+4 bludgeoning = 11
  Lyra  — Stealth, d20 + 7 = 24
  Lyra  — Saving throw (DEX), d20 + 4 = 7  (failed DC 14)
  Brann — Initiative, d20 + 2 = 13
  Thrain — Attack roll, d20 + 5 = 22  (CRITICAL)
  Brann — Persuasion, d20 + 4 = 11
  Lyra  — Sneak Attack damage, 3d6 = 14
  Brann — Concentration save, d20 + 3 = 16
  Thrain — Healing Word, 1d4+4 = 7
  Lyra  — Backstab attempt, d20 + 7 = 17
  GM    — Random encounter table, d100 = 87  (Bandit camp)
  GM    — Weather, d6 = 4  (Light rain)
```

## Brief slot

```
{{BRIEF}}
```
