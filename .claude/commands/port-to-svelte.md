---
description: Port a converged workshop component (.tsx + story + tokens) to a `.svelte` file in the target site, with placement discovery, parity tests, and reviewer-driven iteration.
argument-hint: <storyId> [--target-path <abs path>] [--family <hint>] [--max-iters 6] [--threshold 0.01]
---

# /port-to-svelte

## Args
- `<storyId>` — required (positional).
- `--target-path <abs>` — overrides `TARGET_REPO_PATH`.
- `--family <hint>` — biases `find-component-placement.ts` toward folders containing the hint (e.g. `combat`, `character`).
- `--max-iters 6` — porting-loop cap.
- `--threshold 0.01` — parity threshold (default 1%).

## Procedure

1. **Resolve target.** Use `--target-path` or `$TARGET_REPO_PATH`. Read its `package.json` → detect Svelte version. Cache as `svelteVersion`.
2. **Refresh graph.** If `.harness/target-graph.json` is missing or older than `TARGET_GRAPH_TTL_MINUTES`, run `pnpm scan:target`. The graph's cached `svelteVersion` cross-checks step 1.
3. **Read sources.** `src/components/<Name>.tsx`, `src/stories/<Name>.stories.tsx`, and any tokens used by the component.
4. **Discover placement.** Call `pnpm placement:find -- --name <Name> --family <hint?> --similar-to-react <reactPath>`. Surface the suggested path AND the rationale to the operator. If the rationale is `"no clear convention; using fallback"`, **stop and ask** the operator before proceeding. Apply `target-conventions` skill rules (co-location, route-vs-shared, naming case, barrel detection).
5. **Author the .svelte file.** Apply the `svelte-port` skill. Write to the suggested path. Match the destination folder's import style (alias / relative / barrel).
6. **Update barrel.** If neighboring components are re-exported from an `index.ts` / `index.js`, append the new export. If no barrel exists, do not introduce one.
7. **Parity route.** From the graph, prefer an existing route that already imports the analogous component (if any); otherwise emit a synthetic stub at `<TARGET_PARITY_PATH>/_routes/<Name>/+page.svelte` that mounts `<Component {...defaultArgs} />`.
8. **Parity test.** Emit `<TARGET_PARITY_PATH>/<Name>.parity.spec.ts` from a template; the spec navigates to the parity route at 4 viewports, screenshots into `tests/parity/__captures__/<storyId>--<viewport>.png`, and diffs against `.lostpixel/current/<storyId>--<viewport>.png`.
9. **Sync tokens + assets.** `pnpm sync:target-tokens && pnpm sync:target-assets`.
10. **Run parity.** `pnpm --dir <TARGET> playwright test <TARGET_PARITY_PATH>/<Name>.parity.spec.ts`.
11. **Loop.** If max(parity diff) < threshold, done. Else spawn `svelte-port-reviewer` subagent with `{ storyId, reactComponentPath, svelteComponentPath, plannedPath, svelteVersion, viewport, reactRenderPath, svelteRenderPath, parityDiffPath, iteration, maxIterations, graphPath, skillPaths }`. Apply patch, re-run parity. Loop until threshold or `--max-iters`.
12. **PR description hooks.** After convergence, append `importedBy` notes (the new component's neighbors and any routes it touches via the parity route) to a file `.harness/last-port.md` so the harness PR description can include the blast radius.

## Refusals

- If the workshop component has not converged (no `.lostpixel/current/<storyId>--*.png` files within tolerance) → refuse with "Run /design-loop or /redesign-iter to convergence first."
- If `$TARGET_REPO_PATH` is missing → refuse.
- If the suggested path collides with an existing file → ask the operator (overwrite vs different name vs different folder).
