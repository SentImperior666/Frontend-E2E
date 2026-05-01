---
description: Refresh `.harness/target-graph.json` by walking `$TARGET_REPO_PATH/**/*.svelte` and parsing imports, props, and aliases.
argument-hint: [--force]
---

# /scan-target

## Procedure

1. Verify `$TARGET_REPO_PATH` is set; bail if not.
2. If `.harness/target-graph.json` exists and was written within `TARGET_GRAPH_TTL_MINUTES` minutes, skip and print "graph fresh, --force to override".
3. Run `pnpm scan:target` (which executes `tsx scripts/scan-target-components.ts`).
4. Print a one-line summary:
   ```
   target-graph @ <root>: <N> routes, <M> components, svelte v<X>, aliases: { ... }, top imports: A, B, C, D, E
   ```

## Args
- `--force` — bypass the staleness check.

## When the graph matters

The graph is read by:
- `/port-to-svelte` (via `find-component-placement.ts`) to choose a destination directory.
- The `target-conventions` skill to detect import / barrel / file-name conventions.
- `svelte-port-reviewer` to surface impact (`importedBy`).
- `/design-loop`'s reverse-search ("are there existing components similar to this brief?") so prompts can reuse names and prop shapes.

When in doubt, run `/scan-target --force`. Targets edit themselves between harness runs; stale graphs cause silent placement errors.
