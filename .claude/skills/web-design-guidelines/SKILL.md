---
name: web-design-guidelines
description: Vercel's web-design-guidelines skill — general web UI quality bar. Vendored from vercel-labs/agent-skills.
when_to_use: As a check on workshop output for general web-quality issues (focus states, contrast, responsive behavior, semantic HTML).
---

# Web design guidelines (vendored placeholder)

> **Vendor source.** This skill is intended to be vendored from `vercel-labs/agent-skills` (https://github.com/vercel-labs/agent-skills). The implementer must replace this placeholder with the upstream content in step 6 of the implementation order.

## Working bar (placeholder)

- **Focus states are not optional.** Every interactive element shows a visible focus ring. Tailwind's `focus-visible:` modifier is the right surface.
- **Contrast meets WCAG AA.** 4.5:1 for body, 3:1 for large text, 3:1 for non-text UI affordances. The `axe` Playwright project enforces this.
- **Tap targets ≥ 24×24 dp** (preferably 44×44 for primary actions on touch).
- **Responsive by default.** No fixed-pixel widths on layout containers. Use `clamp()` or fluid type / spacing.
- **Semantic HTML.** `<button>` for buttons, `<a>` for links, `<nav>` for navigation, `<main>` once per page.
- **Reduced motion.** Respect `prefers-reduced-motion: reduce` for any non-essential animation.
- **Forms.** Labels are visible, not just placeholders. Error messages are tied to inputs via `aria-describedby`.
- **Images.** `alt` text required; decorative images get `alt=""` (not omitted).

## Tabletop-RPG application

The aesthetic doesn't excuse bad accessibility. Parchment-on-cream still has to hit AA — and that's the *first* thing the design critic checks (per CLAUDE.md item 7: tests are veto signals). When the aesthetic fights AA, the aesthetic loses; the prompt-translator routes the critique to `screen.edit` with `--aspect color`.
