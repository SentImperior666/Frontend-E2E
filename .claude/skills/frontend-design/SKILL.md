---
name: frontend-design
description: Anthropic's frontend-design skill — general principles for taste, hierarchy, restraint, and rhythm in UI work. Vendored from anthropics/skills.
when_to_use: Whenever authoring or critiquing visual UI in the workshop.
---

# Frontend design (vendored placeholder)

> **Vendor source.** This skill is intended to be vendored from `anthropics/skills` (https://github.com/anthropics/skills) at `frontend-design/SKILL.md`. The implementer must replace this placeholder with the upstream content in step 6 of the implementation order. Until then the principles below are a working stand-in; defer to upstream once vendored.

## Working principles (placeholder)

- **Hierarchy first.** Decide what the user looks at first, second, third. Layout, size, weight, and color all serve that ranking.
- **Rhythm in spacing.** Spacing values come from a small scale (e.g., 4 / 8 / 12 / 16 / 24 / 32 / 48). Random values produce visual noise.
- **Restraint with color.** A neutral background, a primary accent, a secondary accent, semantic colors. Five accent colors make every element compete.
- **Restraint with type.** Two type families maximum (one display, one body). Two weights per family is plenty.
- **Borders are punctuation.** A border separates two surfaces; a shadow lifts a surface; a rule organizes content. Don't use all three on the same element.
- **Motion serves comprehension.** Animation should explain a state change, not decorate. 200–400ms with an ease-out curve covers 90% of cases.
- **Empty states are real states.** Design them; don't fall back to a blank rectangle.
- **Error states are real states.** Inline, recoverable, never a modal-of-shame.

## Tabletop-RPG override

These principles still hold for rich game UI; the difference is that "restraint" applies *within* the chosen aesthetic. Parchment-and-ink is busy by definition — that's the vibe. Restraint means: one parchment texture (not three), one decorative border family (not five), one display face (Cinzel, or Cardo, or Berkshire — not all of them).

When `game-ui-patterns` and `frontend-design` conflict, `game-ui-patterns` wins (per CLAUDE.md skill priority).
