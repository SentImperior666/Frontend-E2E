---
name: composition-patterns
description: Vercel's composition-patterns skill — slot layouts, compound components, render props, controlled vs uncontrolled. Vendored from vercel-labs/agent-skills.
when_to_use: When designing component APIs that will see varied use across many screens.
---

# Composition patterns (vendored placeholder)

> **Vendor source.** Replace with upstream `vercel-labs/agent-skills` content in step 6 of the implementation order.

## Working playbook (placeholder)

- **Slot layouts** — a parent owns spacing and structure; children fill named regions. `<Sheet><Sheet.Header /><Sheet.Body /><Sheet.Footer /></Sheet>`. Replaces a fat parent with 12 boolean toggles.
- **Compound components** — share state via context internally so consumers compose freely. `<Tabs><Tabs.List><Tabs.Trigger /></Tabs.List><Tabs.Panel /></Tabs>`.
- **Render props** — for components that own state but want callers to control rendering. `<DiceRoll>{({ result, rolling }) => ...}</DiceRoll>`. Use sparingly; named slots usually beat render props for readability.
- **Controlled vs uncontrolled** — a component with internal state should also accept a `value` + `onChange` pair so callers can lift state. Use the React community convention: prop is controlled iff `value !== undefined`.
- **Polymorphic `as` prop** — only when the underlying element genuinely varies (button vs link). For RPG UI, this rarely matters.

## Tabletop-RPG application

- `<CharacterSheet>` is a slot layout. The system (5e / PF2) decides which children to mount.
- `<DiceTray>` is compound: `<DiceTray><DiceTray.Pool /><DiceTray.History /><DiceTray.Modifiers /></DiceTray>`.
- `<CombatTracker>` is compound + controlled: callers can drive `currentInitiativeIndex` from server state.
- Spell cards are leaf components — composition isn't worth it for a fixed shape.
