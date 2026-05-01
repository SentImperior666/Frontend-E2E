---
key: modern-vtt
era: contemporary-app
intent: clean, restrained, system-agnostic
---

# Modern VTT

The "default web app" register, but specifically tuned for tabletop UI density. Use this when the brief calls for a clean, system-agnostic look — companion app, GM tools, scheduler — and the rich aesthetic would be visual noise. Roll20-modern, Foundry-modern, the well-designed parts of D&D Beyond's web app.

## Ambiance adjectives

- clean, restrained, neutral-warm
- functional, instrumented, accessible-first
- contemporary card-based UI
- comfortable density (denser than SaaS, looser than data-tables)

## Mature-tool style refs

- Foundry VTT's actor-sheet redesigns (modern Foundry, not retro)
- Linear's UI (density + restraint)
- Roll20's modernized lobby pages

## Color/material palette (in prose)

A neutral-warm grey (`#f5f3ef`) for surfaces, a near-black ink (`#0f0f0f`) for text, a single restrained primary accent (typically a deep teal `#2c6e7a` or warm bronze `#a07a39`), plus semantic colors. No textures. Subtle 1px borders, gentle shadows.

## Typographic intent

- Display: Inter, Manrope, or a clean grotesque at 600.
- Body: Inter / Manrope at 400/500. Comfortable measure.
- Numerals: tabular for stat blocks, proportional for body.
- Iconography: stroke-based, 1.5px, matched to body weight.

## Motion intent

- Subtle. 150ms ease-out for state changes.
- No flourish.
- Respects `prefers-reduced-motion` strictly.

## Anti-patterns

- **Aesthetic mixing.** This aesthetic does not borrow from parchment, grimdark, or arcane. If you find yourself adding ornament, switch keys.
- **Excessive whitespace.** Tabletop UI is denser than business SaaS. Don't space-out a stat block to a third of the screen.
- **Color-coded category proliferation.** Categories use shape and label; color is the *third* cue, not the first.
