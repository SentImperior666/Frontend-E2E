---
name: react-best-practices
description: Vercel's react-best-practices skill — composition over inheritance, Server Components defaults, hooks discipline. Vendored from vercel-labs/agent-skills.
when_to_use: When authoring React components in the workshop.
---

# React best practices (vendored placeholder)

> **Vendor source.** Replace with upstream `vercel-labs/agent-skills` content in step 6 of the implementation order.

## Working principles (placeholder)

- **Server Components by default** in Next.js App Router. Only mark `"use client"` when the component needs state, effects, browser APIs, or event handlers.
- **Composition over props-soup.** A component with > 8 props probably wants composition (slots) instead. RPG character sheets are tempted to be prop-soups; resist.
- **Hooks discipline.** Custom hooks for stateful logic worth a name. Prefix with `use`. Don't extract a hook for a single useState.
- **Stable keys.** Keys for `.map()` are stable IDs, never array indices, never `Math.random()`.
- **Avoid `useEffect` as a synchronization workaround.** Most "I need to sync state with a prop" cases want `useMemo`, derived state, or moving state up.
- **Don't render in a loop with side effects.** Pure renders, side effects in event handlers or effects.
- **Forwarded refs only when necessary.** With React 19, `ref` is a regular prop on function components — don't reach for `forwardRef` reflexively.

## Tabletop-RPG application

- Character sheets are large but composable. Build `<CharacterSheet>` as a slot-shaped layout (`<CharacterSheet><CharacterSheet.StatBlock /><CharacterSheet.Equipment />...</CharacterSheet>`) so the same shell carries different systems (5e / PF2 / Savage Worlds).
- Dice rolls are inherently stateful with derived history; the dice tray is `"use client"`.
- Spell lists are large; virtualize when known spell counts > 50 (a wizard's compendium).
- Server Components are excellent for journal entries, world wikis, and public lobby lists; they eliminate the JS for read-mostly screens.
