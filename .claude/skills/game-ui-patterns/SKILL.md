---
name: game-ui-patterns
description: Tabletop-RPG UI conventions (stat blocks, dice trays, condition trackers, hex grids, etc.) so generated and hand-authored components stay legible to gamers across aesthetic keys.
when_to_use: Whenever authoring or critiquing components for the RPG site — character sheets, dice rollers, spell cards, combat trackers, inventory, NPC dialogue, world maps, lobbies, journals.
---

# Game UI patterns

This skill encodes shape-level conventions every tabletop-RPG UI must satisfy regardless of aesthetic key. The aesthetic key changes surface treatment (parchment vs grimdark vs ethereal); the patterns below stay constant.

## Stat blocks

- **D&D 5e shape**: ability name, large numeric score (e.g. `16`), signed modifier in a pill (`+3`), saving-throw delta beneath.
- **PF2 shape**: proficiency tier (Untrained / Trained / Expert / Master / Legendary) shown as filled chevrons; total stacked next to the name.
- **System-agnostic shape**: label / value / signed delta. Use this when the brief doesn't specify a system.
- Stat order: STR, DEX, CON, INT, WIS, CHA (5e) or follow the system's canonical order. Never alphabetize stats.

## Modifier badges

- Signed integer in a small pill: `+3`, `-1`, `0` (zero is rendered, not blanked).
- Color-code by sign **only when** there is a redundant cue (icon, text label) — accessibility, not decoration.
- Tap target ≥ 32×32 dp on touch surfaces.

## Condition trackers

- Status-effect chips with tooltips on hover/long-press. Stacking duration counters when the system supports stacks (`Poisoned ×2`).
- Conditions cluster near the HP display, not buried in tabs. Critical conditions (Unconscious, Stunned) get a stronger visual weight.

## Hit points

- Current / max as the primary affordance: `28 / 45`.
- Temp-HP overlays the bar as a translucent band on top of the current-HP fill, never replacing it.
- Damage-type icons alongside the most recent hit, not as a permanent fixture.

## Initiative order

- Vertical list, top-to-bottom = play order. Current actor highlighted with a stronger border AND a left-edge accent (two cues).
- Drag-to-reorder; drag affordance visible on hover.
- Dead/unconscious actors dimmed but kept in list (not removed) — players track corpses.
- "Hold action" / "Ready" affordance visible on the actor's row, not in a submenu.

## Dice rollers

- Animated tray with physics or pseudo-physics — a dice that snaps without rolling reads as broken to gamers.
- History strip showing the last N rolls with timestamp and source label ("Thrain — Attack, d20 + 5 = 17").
- Advantage / disadvantage / neutral toggle as a tri-state, not two checkboxes.
- Exploding dice (Savage Worlds, etc.) supported via a config flag, rendered as a small "↻" stack.
- Critical hit / fumble visually distinct without relying on color alone.

## Spell cards

- School-coded border (Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation). Color is a hint, not the only cue — include the school name in text.
- Level badge in a corner.
- Components glyphs (V / S / M) inline with casting time.
- Concentration marker (small "C" or hourglass) prominent on concentration spells.
- Prepared / unprepared affordance distinct from "known".
- Damage / save / range / duration in a fixed-position field grid, not free-form prose, so players can scan many cards quickly.

## Inventory

- Slot-based (Diablo / Path of Exile style) **or** list with categories — pick one per screen, do not mix.
- Encumbrance bar with three states (light / medium / heavy / overloaded) rendered as discrete segments, not a smooth gradient.
- Equipped indicator distinct from "in bag" (border, glow, or rail).
- Attunement count (D&D 5e: max 3) prominent if the system has it.

## Map panels

- Grid types: square (default), hex (pointy-top or flat-top — match the system), gridless. Toggle in a control rail, not a menu.
- Token layer above terrain layer; both above grid; both below fog-of-war.
- Fog-of-war as a per-cell mask, not a global overlay. Reveal animation if the aesthetic permits.
- Measurement tool (ruler) with diagonal rules per the chosen system (5e's "every other diagonal counts as 10ft").

## NPC dialogue

- Portrait left, speaker name above body, body wraps to a comfortable measure (~60ch).
- Branching choices stack vertically, numbered or lettered. Choices that close a branch visually distinct from continuations.
- "Skill check required" choices show the check inline (`[Persuasion DC 15]`).

## Lobby / session lists

- Card-per-session, with: title, system (5e / PF2 / Savage Worlds / etc.), schedule, host, seats filled / total, tags.
- Filter rail with system + day-of-week + tone (gritty / heroic / weird) at minimum.
- "Join" and "Watch" are distinct affordances; "Join" requires a seat and may be disabled.

## Journals / world entries

- Body text in a comfortable measure (~70ch); margin notes / footnotes break out to the side, not inline asterisks.
- Cross-reference links visually distinct from out-of-world links (different underline weight or icon).
- Entry header with date (in-world if applicable + real-world updated-at), tags, author.

## Aesthetic neutrality rule

Every pattern above must support all aesthetic keys without rewriting structure — only surface treatment changes. If a pattern needs structural changes per aesthetic, that's a defect in the pattern. Examples:
- Parchment + grimdark + ethereal all use the same stat-block shape; they differ in border style, paper texture, and ink color, not in cell layout.
- Sci-fi-RPG dice tray is the same animated tray + history strip; it differs in materiality (carbon-fiber vs leather) and font (technical vs hand-lettered), not in rolling mechanics.

If a brief asks for a structurally different pattern, treat it as a *new* pattern and document it here before generating.

## Critic anchors

When `design-critic` evaluates a render, it cross-checks against the relevant pattern above. Common failures it catches:

- HP bar without max value visible.
- Stat block alphabetized.
- Initiative list with current actor cued only by color.
- Spell card without level badge.
- Dice tray with no history.
- Inventory with both slots and list mixed.
- Map with fog-of-war as a global overlay (loses per-cell reveal).
- Dialogue body wrapping past 80ch.
