---
name: target-conventions
description: How to read .harness/target-graph.json, resolve aliases, pick component placement, and respect the target's barrel / naming / co-location conventions when porting Svelte components.
when_to_use: Triggered automatically whenever any tool reads `.harness/target-graph.json`. Consulted by `/port-to-svelte` for placement and by `svelte-port-reviewer` for import / barrel / file-name style.
---

# Target conventions

The target Svelte site does not collect components under a single `src/lib/components/` directory. `.svelte` files are scattered across feature folders, route folders, and ad-hoc locations. This skill encodes how to read the target graph emitted by `scripts/scan-target-components.ts` and pick a destination that matches the target's existing conventions.

## Reading the graph

`.harness/target-graph.json` shape:

```jsonc
{
  "scannedAt": "ISO-8601",
  "rootPath": "/abs/path/to/target",
  "svelteVersion": 4 | 5,
  "aliases": { "$lib": "src/lib", ... },
  "files": {
    "<relative>.svelte": {
      "name": "<base name>",
      "kind": "route" | "component",
      "props": ["..."],
      "imports": [{ "from": "...", "names": ["default"], "resolvedPath": "..." }],
      "importedBy": ["..."]
    }
  }
}
```

- `rootPath` is the absolute path to `$TARGET_REPO_PATH` at scan time.
- `aliases` is the merged result of `tsconfig.json` `paths`, `svelte.config.js` `kit.alias`, and `vite.config.{ts,js,mjs}` `resolve.alias`. Resolution is longest-match-first.
- `kind: route` matches files under `src/routes/` and includes `+page.svelte` / `+layout.svelte` / `+error.svelte`.
- `importedBy` is the inverted graph; useful for impact analysis.

If the graph is missing or older than `TARGET_GRAPH_TTL_MINUTES`, refresh with `pnpm scan:target` (or `/scan-target`).

## Placement decision rules

When porting a new component, `find-component-placement.ts` returns a `suggestedPath`. Override only if one of these rules applies:

### Rule 1 — Co-location
If the target's existing components ship next to test files (`*.test.ts`), story files (`*.stories.ts`), or per-component index re-exports (`index.ts` exporting only that component), the new component must follow the same pattern. Don't drop a bare `.svelte` into a folder where every neighbor has a sibling test file.

### Rule 2 — Route-vs-shared
- A component used by **exactly one route** lives next to that route (e.g., `src/routes/character/StatBlock.svelte`).
- A component imported by **two or more routes** lives under `$lib` (or whichever shared alias the target uses).
- Compute this from the graph's `importedBy` field on the closest existing analog.

### Rule 3 — Naming case
Detect from the graph:
- If neighbor files are `PascalCase.svelte`, use PascalCase.
- If they're `kebab-case.svelte`, use kebab-case.
- If folders use `kebab-case/PascalCase.svelte`, mirror both.

Do not mix conventions in the same folder.

### Rule 4 — Index barrel
If the destination folder has an `index.ts` (or `index.js`) that re-exports the neighboring components, append the new component to the same barrel. If the folder has **no** barrel, do not introduce one — match the local style.

### Rule 5 — Family hint
When the operator passes `--family <hint>` to `/port-to-svelte`, the placement script biases toward folders whose path contains that segment. The skill should respect the bias unless rule 1 or 2 contradicts it; in conflict, surface both options to the operator.

### Rule 6 — Fallback
When the placement score is below threshold, the script returns `TARGET_DEFAULT_COMPONENT_PATH` with rationale `"no clear convention"`. The skill instructs the operator: **stop and ask** — don't write into the fallback silently. The user knows their site better than the heuristic.

## Import-style detection

When emitting the `.svelte` file, match the local import style:
- `import X from '$lib/components/X.svelte'` — alias-style.
- `import X from '../X.svelte'` — relative.
- `import { X } from '$lib/components'` — barrel.

Pick by majority among the destination folder's neighbors. Do not invent a style the target hasn't used elsewhere.

## Reverse search (consistency anchor)

Before generating a new screen with Stitch, query the graph for prior similar components by name-token overlap. Feed their props and structure into the Stitch prompt as a "consistency anchor": "the spell list shares its row shape with the existing `SpellList` component which exposes `{ spells, knownSpellIds, preparedSpellIds }`."

## Impact analysis

When modifying a component already ported (re-running `/port-to-svelte` on a converged story), surface its `importedBy` set in the harness PR description. Reviewers need to see the blast radius before merging.
