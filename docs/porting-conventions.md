# Porting conventions — workshop React → target Svelte

This is the operator-facing companion to `.claude/skills/svelte-port/SKILL.md` and `.claude/skills/target-conventions/SKILL.md`. The skills tell Claude how to port; this doc tells the operator what to expect and how to intervene.

## What `/port-to-svelte` does

Given a converged storyId:

1. Detects the target's Svelte version from `$TARGET_REPO_PATH/package.json`.
2. Refreshes `.harness/target-graph.json` if stale.
3. Calls `find-component-placement` to suggest a destination directory based on:
   - name-token overlap with neighbors (50% of score),
   - family hint match against path segments (30%),
   - folder concentration of similar components (20%).
4. **Surfaces the suggestion + rationale to you.** If the rationale is `"no clear convention; using fallback"`, the loop **stops and asks** before writing.
5. Authors the `.svelte` file in the suggested folder with the dialect (Svelte 4 reactive statements vs Svelte 5 runes) determined in step 1.
6. Updates the local barrel (`index.ts` / `index.js`) if neighbors use one.
7. Resolves a parity route (existing, or stubbed under `tests/parity/_routes/<Name>/+page.svelte`).
8. Emits `<TARGET_PARITY_PATH>/<Name>.parity.spec.ts` from a template.
9. Syncs tokens and Stitch assets to the target.
10. Runs the parity test. If max diff > threshold, hands the diff to `svelte-port-reviewer`, which patches the `.svelte` file. Loop until threshold or `--max-iters`.

## When to override placement

The placement script returns `{ suggestedPath, rationale, neighbors }`. **Override** when:

- The user knows of a recent rename / reorganization not yet reflected in the graph.
- The component is structurally different from its name-token neighbors (e.g., `Token` for an RPG game piece vs `TokenInput` for a form).
- The rationale is "no clear convention" and the fallback isn't where you want it.

To override, re-run `/port-to-svelte <storyId> --target-path <abs-path-to-folder>` (the operator can also pass a *file* path; the harness uses its containing folder).

## Barrel files

If the destination folder has an `index.ts` or `index.js` that re-exports neighbors, the harness appends the new component. If there's no barrel, **the harness will not introduce one** — match the local style.

If you want to add a barrel where there isn't one, do it manually before re-running `/port-to-svelte`. The next run will detect the new barrel and append.

## Parity test routes

The parity test mounts the ported component on a route. The harness picks:

1. **An existing route from the graph** that imports the analogous component (when porting a re-converged version of an already-ported component). The parity spec navigates to that route in the target preview server and screenshots.
2. **A synthetic stub route** if no existing route mounts the component. Stubbed under `tests/parity/_routes/<Name>/+page.svelte` in the target. The stub mounts `<Component {...defaultArgs} />` where `defaultArgs` is derived from the workshop story's default args.

The synthetic-stub path is gated behind a query parameter (`?_parity=1`) so production routes don't accidentally serve it.

## Threshold

Parity threshold defaults to `0.01` (1%). Cross-framework rendering of the same component will have small text-rendering and antialiasing differences; this slack absorbs them. If a component's parity diff hovers around 1% legitimately (e.g., due to font fallback), document the cause in the harness PR description.

## What never gets ported

- React-specific dependencies (`framer-motion`, etc.). Replace with Svelte equivalents only when the target already uses them.
- React-specific hooks (`useId`, `useTransition`). Replace with `crypto.randomUUID()` or local state.
- Storybook-only props.

## What if the target has its own design system

The harness assumes the target consumes the *same* token CSS as the workshop. If the target has a separate design system (different token names, different palette), the parity loop will fail spectacularly. In that case:

1. Reconcile the design systems first (run `pnpm extract:target-theme`, fix drift, sync tokens).
2. Or scope `/port-to-svelte` to a single workspace with shared tokens.

The harness does not auto-translate between design systems.

## Two PRs, one feature

Because the harness writes into both repos:

- The **harness PR** carries `src/components/<Name>.tsx`, `src/stories/<Name>.stories.tsx`, `.lostpixel/baseline/<storyId>/*`, `.stitch/screens/<storyId>/*`, and any new prompt-template / aesthetic edits.
- The **target PR** carries `<destination>/<Name>.svelte`, `<TARGET_PARITY_PATH>/<Name>.parity.spec.ts`, optional barrel update, optional synthetic stub route, and a tokens / assets bump.

Each PR description should reference the other (commit shared issue numbers, paste the URL). Reviewers should hold off merging the target PR until the harness PR's parity check has passed against it.
