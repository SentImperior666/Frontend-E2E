---
name: impeccable
description: Patrick Bakaus' impeccable skill set — design-language taste for AI-driven UI work. Vendored from pbakaus/impeccable.
when_to_use: As a final taste pass on workshop output, especially type, spacing rhythm, and visual hierarchy.
---

# Impeccable (vendored placeholder)

> **Vendor source.** Install via `npx skills add pbakaus/impeccable` (https://github.com/pbakaus/impeccable). The CLI write to `.claude/skills/impeccable/`. If the CLI is unavailable, vendor manually. Replace this placeholder with upstream content in step 7 of the implementation order.

## Working bar (placeholder)

The "impeccable" skill catalogs taste-level constraints that catch AI-generated UI in its weak spots. Until vendored, the working bar:

- **Type pairings.** Display + body fonts must contrast in style and weight, not in genre. Don't pair Cinzel with Cardo; pair Cinzel with EB Garamond.
- **Optical centering.** Logos and round shapes need optical, not geometric, centering. Tailwind doesn't help here — manual offset of 1–2px.
- **Spacing within elements.** A button's text needs *more* horizontal padding than vertical (typically 1.5×–2×).
- **Rounding consistency.** Pick a corner radius family (none / soft / round) and stick with it. Mixing 4px and 12px corners on the same screen looks accidental.
- **Shadow physics.** Light comes from above. Always. Bottom shadows, top highlights.
- **Borders for depth.** A 1px inner border + 1px outer shadow does what 4px borders attempt and looks much better.
- **Iconography weight.** Match icon stroke weight to the body font weight. 1px icons on a 700-weight body look skeletal.
- **Animation choreography.** When two things animate at once, stagger by 30–80ms unless they're physically attached.

## Tabletop-RPG application

- Display fonts often go too far (Old English / blackletter for everything). Reserve display for headings only; body must be readable parchment-on-cream at 16px.
- Iconography for stats (sword, shield, brain) wants matched weight. The aesthetic catalog (`prompts/aesthetics/`) specifies stroke weight per key.
- Texture overlays (parchment grain, leather scuff) belong on **surfaces**, not on body text. Texture-on-text is unreadable at 14px.
