---
name: svelte-port
description: How to port a converged React+Tailwind workshop component to a Svelte 4 or Svelte 5 component for the target site, including reactivity, props, slots, events, and Tailwind class parity.
when_to_use: Triggered by `/port-to-svelte` and by `svelte-port-reviewer` when iterating a `.svelte` against a parity diff.
---

# Svelte port

## Step 0 — detect dialect

Read `$TARGET_REPO_PATH/package.json`. If `dependencies.svelte` (or `devDependencies.svelte`) starts with `^5`, `~5`, or `5.`, use **Svelte 5 (runes)**. Otherwise use **Svelte 4 (legacy reactive declarations)**. The graph also caches this as `svelteVersion` — prefer the graph if present and fresh.

Never mix dialects in one file. Never output runes for a Svelte 4 target. Never output `$:` reactive blocks for a Svelte 5 target.

## Mapping table

| React + Tailwind | Svelte 4 | Svelte 5 |
|---|---|---|
| `function Foo({ a, b }: Props)` | `<script lang="ts"> export let a; export let b; </script>` | `<script lang="ts"> let { a, b } = $props(); </script>` |
| `const [n, setN] = useState(0)` | `let n = 0;` (mutate directly) | `let n = $state(0);` |
| `useMemo(() => f(a), [a])` | `$: m = f(a);` | `let m = $derived(f(a));` |
| `useEffect(() => { ... }, [a])` | `$: if (a) { ... }` or `onMount` | `$effect(() => { ... a; })` |
| `onClick={handler}` | `on:click={handler}` | `onclick={handler}` |
| `children` prop | `<slot />` | `{@render children?.()}` with `let { children } = $props()` |
| `className={cn(...)}` | `class={cn(...)}` | `class={cn(...)}` |
| `style={{ color: x }}` | `style:color={x}` or `style="color: {x}"` | same as Svelte 4 |
| Conditional render `{cond && <X />}` | `{#if cond}<X />{/if}` | `{#if cond}<X />{/if}` |
| `array.map(...)` | `{#each array as item (item.id)}...{/each}` | same |
| Forwarded refs / DOM access | `bind:this={el}` | `let el; <div bind:this={el} />` (state-driven via `$state`) |
| Context (createContext) | `setContext` / `getContext` | `setContext` / `getContext` |
| `dangerouslySetInnerHTML` | `{@html ...}` | `{@html ...}` |

## Tailwind classes

Tailwind v4 classes carry over verbatim. Two pitfalls:

1. **Class merging.** React often uses `cn(...)` (clsx + tailwind-merge). Svelte targets often use `clsx` alone or a local helper. Match the target's import — check what neighbors use before adding a new dependency.
2. **Conditional classes.** Svelte's `class:` directive is idiomatic and shorter than ternary string concatenation. Prefer:
   ```svelte
   <div class="base" class:active={isActive} />
   ```
   over the React-style port `class={`base ${isActive ? 'active' : ''}`}`. The reviewer will flag the latter.

## Tokens

Token modules are generated as both `dist/tokens/tokens.css` and `dist/tokens/tokens.ts` in the workshop, and synced into the target via `pnpm sync:target-tokens`. The Svelte component imports the same token names as the React component — no remapping. If the React component uses a CSS variable directly (`var(--color-parchment-50)`), the Svelte component does the same.

## Events

The React `onSubmit={(e) => ...}` prop becomes a Svelte event:

- Svelte 4: emit via `createEventDispatcher`, listen via `on:submit={handler}`.
- Svelte 5: pass a callback prop `onsubmit` (lowercase), invoke directly.

Match the target's existing event style — some Svelte 5 codebases still use dispatcher-style events for compatibility.

## Slots vs children

- Svelte 4 default slot: `<slot />`. Named slots: `<slot name="header" />`.
- Svelte 5: callbacks via `$props()` and `{@render children?.()}` (and named-snippet equivalents).

If the React component uses a `header`/`footer` render-prop, port to named slots (Svelte 4) or named snippets (Svelte 5).

## Reactivity gotchas

- **Svelte 4**: `$:` blocks run on every dependency change. Don't put side effects with cleanup in there — use `onMount` / `onDestroy`.
- **Svelte 5**: `$state` mutations to nested arrays/objects are reactive (proxied). React's `setState` patterns that recreate the array are unnecessary; prefer in-place mutation when porting an `array.push(...)` style update.
- **Svelte 5**: `$derived` is lazy. If a derived value has side effects (don't), use `$effect` instead.

## File layout

The file goes wherever `find-component-placement` says. Inside the file:

```svelte
<script lang="ts">
  // 1. type imports
  // 2. value imports (utils, child components, tokens)
  // 3. props (Svelte 4 export let, Svelte 5 $props)
  // 4. local state
  // 5. derived / reactive
  // 6. handlers
</script>

<!-- markup -->

<style>
  /* prefer Tailwind classes; only use <style> for things Tailwind can't express
     (complex selectors, animations needing keyframes the design system doesn't ship). */
</style>
```

## Things not to port

- React-specific dependencies (e.g., `framer-motion`). Replace with Svelte equivalents (`svelte/motion`, `svelte/transition`) only when the target already uses them; otherwise the parity loop will tolerate a static port and the operator decides whether to add motion.
- React-specific hooks (`useId`, `useTransition`). Replace with `crypto.randomUUID()` or local state.
- Storybook-only props (e.g., `storyMode`).

## Parity test stub

Every port emits `<TARGET_PARITY_PATH>/<Name>.parity.spec.ts`. The stub mounts the ported component on a route (real or synthetic — see `target-conventions/SKILL.md` rule for parity routes), screenshots at 4 viewports, and diffs against the workshop's converged `.lostpixel/current/<storyId>--<viewport>.png`. Threshold: 0.01 (1%).

If parity exceeds threshold, the `svelte-port-reviewer` subagent receives `{ react, svelte, plannedPath, parityDiffPng }` and emits a patch.
