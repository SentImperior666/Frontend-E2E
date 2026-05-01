---
template: npc-dialogue
device_default: DESKTOP
style_anchors:
  - "dialogue layout reminiscent of CRPG conversation panels (Pillars of Eternity, BG3)"
  - "portrait + speaker name + body convention from Disco Elysium"
---

# NPC dialogue — Stitch prompt template

## Layout

A horizontal panel near the bottom 40% of the viewport.

**Left** — NPC portrait, ~120×160, framed with an ornate border that matches the aesthetic key. Below the portrait: speaker name in a display face, optional title in a smaller body face ("Brother Aldric, Keeper of the Forgehouse").

**Right** — dialogue body, body face, comfortable measure (~60ch wrapped to the panel width), italicized stage direction at top in a subtle ink color, then the speech body.

**Below body** — choice list. Each choice on its own line, numbered or lettered (1 / 2 / 3 / [a] / [b]). Skill-check choices show the check inline in brackets (`[Persuasion DC 15]`). End-of-branch choices visually distinct from continuations (small icon or different rail).

A history affordance ("Read previous lines") sits unobtrusively in a top corner of the panel.

## Mock data

```
NPC: Brother Aldric, Keeper of the Forgehouse
Portrait: a weather-lined dwarven cleric, soot on his beard, kind eyes

Stage direction: The cleric sets down a half-finished horseshoe and meets your gaze. The forge behind him glows orange.

Speech: "You came back. I had wondered. The road from the highlands is no kinder this time of year, but the hammer remembers your hand. Tell me — did the relic answer when you asked, or did it merely listen?"

Choices:
  1. "It answered. The forge in the dream is the same as this one."
  2. "It only listened. Whatever I am to learn, I have not yet earned."
  3. [Persuasion DC 15] "Brother — perhaps the question itself was wrong."
  4. [Religion DC 12] Recite the third verse of the Anvil Litany.
  5. (End conversation) "I should rest. We will speak again."
```

## Brief slot

```
{{BRIEF}}
```
