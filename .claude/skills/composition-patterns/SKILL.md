---
name: vercel-composition-patterns
description: React composition patterns that scale. Use when refactoring components with boolean prop proliferation, building flexible component libraries, or designing reusable APIs. Triggers on tasks involving compound components, render props, context providers, or component architecture. Includes React 19 API changes.
license: MIT
source: https://github.com/vercel-labs/agent-skills/tree/main/skills/composition-patterns (vendored verbatim)
metadata:
  author: vercel
  version: '1.0.0'
---

# React Composition Patterns

Composition patterns for building flexible, maintainable React components. Avoid
boolean prop proliferation by using compound components, lifting state, and
composing internals. These patterns make codebases easier for both humans and AI
agents to work with as they scale.

## When to Apply

Reference these guidelines when:

- Refactoring components with many boolean props
- Building reusable component libraries
- Designing flexible component APIs
- Reviewing component architecture
- Working with compound components or context providers

## Rule Categories by Priority

| Priority | Category                | Impact | Prefix          |
| -------- | ----------------------- | ------ | --------------- |
| 1        | Component Architecture  | HIGH   | `architecture-` |
| 2        | State Management        | MEDIUM | `state-`        |
| 3        | Implementation Patterns | MEDIUM | `patterns-`     |
| 4        | React 19 APIs           | MEDIUM | `react19-`      |

## Quick Reference

### 1. Component Architecture (HIGH)

- `architecture-avoid-boolean-props` - Don't add boolean props to customize
  behavior; use composition
- `architecture-compound-components` - Structure complex components with shared
  context

### 2. State Management (MEDIUM)

- `state-decouple-implementation` - Provider is the only place that knows how
  state is managed
- `state-context-interface` - Define generic interface with state, actions, meta
  for dependency injection
- `state-lift-state` - Move state into provider components for sibling access

### 3. Implementation Patterns (MEDIUM)

- `patterns-explicit-variants` - Create explicit variant components instead of
  boolean modes
- `patterns-children-over-render-props` - Use children for composition instead
  of renderX props

### 4. React 19 APIs (MEDIUM)

> **⚠️ React 19+ only.** Skip this section if using React 18 or earlier.

- `react19-no-forwardref` - Don't use `forwardRef`; use `use()` instead of `useContext()`

## How to Use

Read individual rule files for detailed explanations and code examples:

```
rules/architecture-avoid-boolean-props.md
rules/state-context-interface.md
```

Each rule file contains:

- Brief explanation of why it matters
- Incorrect code example with explanation
- Correct code example with explanation
- Additional context and references

## Full Compiled Document

For the complete guide with all rules expanded: `AGENTS.md`

> **Vendor note.** Only `SKILL.md` is mirrored into this repo from
> `vercel-labs/agent-skills`. The companion `rules/*.md` and `AGENTS.md` files
> live in the upstream repo. To consume them, vendor the full skill folder via
> the marketplace install (`/plugin install` flow) or `npx skills add
> vercel-labs/agent-skills` if available.

---

## Tabletop-RPG application (project addendum)

The composition rules above map cleanly to our screen catalog:

- **`architecture-avoid-boolean-props` / `architecture-compound-components`** —
  `<CharacterSheet>`, `<DiceTray>`, `<CombatTracker>` are compound components
  with named subparts (`<CharacterSheet.StatBlock />`, `<DiceTray.History />`).
  Avoid props like `showHistory`, `compact`, `withModifiers`. Compose instead.
- **`state-lift-state`** — combat state, current-actor pointers, and dice
  history live in provider components so sibling subparts can read without
  prop-drilling.
- **`patterns-explicit-variants`** — `<CharacterSheet.FiveE>` vs
  `<CharacterSheet.PF2>` are explicit variants. Don't switch on a `system`
  string inside a single mega-component.
- **`patterns-children-over-render-props`** — slot layouts beat render props
  for our screens. The exception: `<DiceRoll>{({ result, rolling }) => ...}</DiceRoll>`
  where the parent owns animation state and consumers want to render the result
  inline.
