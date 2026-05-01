---
template: lobby-list
device_default: DESKTOP
style_anchors:
  - "lobby card density similar to Discord stage channels"
  - "session listing conventions from Roll20's looking-for-group"
---

# Lobby list — Stitch prompt template

## Layout

**Top strip** — search field, sort dropdown (Newest / Most popular / Starting soon), and "Host new session" call-to-action.

**Left filter rail** — system filter (5e / PF2 / Savage Worlds / Mörk Borg / Cyberpunk RED / Lancer), schedule filter (day-of-week chips), tone filter (Heroic / Gritty / Weird / Comedy), seats-available toggle, GM-style chips (Sandbox / Story-driven / Combat-heavy / Roleplay-heavy).

**Main area** — grid of session cards (3 columns at desktop). Each card:
- Cover image at top (banner ratio, ~3:1).
- Session title (display face).
- System chip + tone chip + day-of-week chip on a single row beneath title.
- Host name + avatar + small "verified GM" indicator if applicable.
- Schedule line ("Wednesdays, 7–10pm CT").
- Seats indicator: "3 / 5 seats" with a small bar.
- Tags row (3–5 short tags: "homebrew", "voice", "newbie-friendly").
- Two affordances at bottom: "Join" (primary, may be disabled if full) and "Watch" (secondary).

## Mock data

```
Session 1:
  Title: The Hollow Crown of Drelmar
  System: D&D 5e   Tone: Gritty   Schedule: Wednesdays 7–10pm CT
  Host: GM Verena (verified) — 4.9/5 over 31 sessions
  Seats: 3 / 5
  Tags: homebrew, voice, low-magic, political-intrigue
  Cover: ruined castle in fog
  Status: starting next week

Session 2:
  Title: Wormwood Hollow
  System: Mörk Borg   Tone: Weird   Schedule: Sundays 8–11pm GMT
  Host: GM Pell — 4.7/5 over 12 sessions
  Seats: 1 / 4
  Tags: one-shot, voice+text, gore, doom-metal
  Cover: black-and-white woodcut of a tree with hands
  Status: this Sunday

Session 3:
  Title: Drift Tide — a Lancer mercenary campaign
  System: Lancer   Tone: Heroic   Schedule: Saturdays 2–5pm UTC
  Host: GM Kostas (verified) — 4.8/5 over 18 sessions
  Seats: 0 / 4 (FULL)
  Tags: mech-combat, narrative, biweekly
  Cover: starscape with a lit mech silhouette
  Status: in session

Session 4:
  Title: Scarred Lands — Sandbox PF2
  System: Pathfinder 2e   Tone: Heroic   Schedule: Mondays 6–9pm ET
  Host: GM Eli — 4.6/5 over 22 sessions
  Seats: 2 / 6
  Tags: sandbox, hexcrawl, newbie-friendly
  Cover: hand-drawn parchment region map
  Status: ongoing, 3 weeks in

Session 5:
  Title: Neon Marrow — a Cyberpunk RED noir
  System: Cyberpunk RED   Tone: Gritty   Schedule: Fridays 9pm–midnight PT
  Host: GM Mira — 5.0/5 over 7 sessions
  Seats: 4 / 4 (FULL, waitlist)
  Tags: noir, fixers-and-edgerunners, voice
  Cover: rain-slicked street, neon kanji
  Status: ongoing

Session 6:
  Title: The Crown We Carry
  System: Savage Worlds   Tone: Heroic   Schedule: Thursdays 7–10pm ET
  Host: GM Devorah — 4.8/5 over 14 sessions
  Seats: 1 / 5
  Tags: dramatic-arcs, low-prep, episodic
  Cover: knight backlit by sunrise
  Status: starting in 2 weeks
```

## Brief slot

```
{{BRIEF}}
```
