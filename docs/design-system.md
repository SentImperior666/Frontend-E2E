# Design system

The canonical design system lives in **Figma**. Tokens are pulled from Figma into the harness via `pnpm tokens:sync` and emitted as three artifacts under `dist/tokens/`:

- `tokens.css` — CSS custom properties scoped to `:root`. Consumed by the workshop's `globals.css` and synced into the target's `$TARGET_TOKENS_PATH/tokens.css`.
- `tokens.json` — raw token tree. Consumed by `stitch-sync-design-system.ts` to build the Stitch DesignSystem mirror, and by tooling on the target side (e.g., a Vite plugin that bakes tokens into the build).
- `tailwind.preset.js` — Tailwind preset object. Consumed by both the workshop's `tailwind.config.ts` and the target's `tailwind.config.{ts,js}` (via the synced copy).

A typed TS module is also written to `src/tokens/index.ts` so React components can import token values directly when CSS variable indirection is undesirable.

## Token categories

| Category | Source-of-truth in Figma | CSS prefix |
|---|---|---|
| Colors | Variable collection `colors` | `--color-*` |
| Typography | Variable collection `typography` | `--font-*`, `--font-*-size`, `--font-*-lh`, `--font-*-weight` |
| Spacing | Variable collection `spacing` | `--space-*` (px) |
| Radii | Variable collection `radii` | `--radius-*` (px) |
| Shadows | Variable collection `shadows` | `--shadow-*` |

Until the canonical Figma file is in place, `scripts/update-tokens.ts` falls back to a starter token tree (warm parchment palette, Cinzel + EB Garamond type, an 8-step spacing scale) so the pipeline runs end-to-end. **Replace the Figma file as soon as design lands**, and re-run `pnpm tokens:sync`.

## Sync flow

```
Figma  ──pnpm tokens:sync──►  dist/tokens/{tokens.css, tokens.json, tailwind.preset.js}
                              │
                              ├──pnpm sync:target-tokens──►  $TARGET_REPO_PATH/$TARGET_TOKENS_PATH/
                              ├──pnpm stitch:sync-ds──────►  Stitch project DesignSystem
                              └──tailwind.config.ts──────►  workshop Tailwind preset
```

Order matters: `tokens:sync` first, then `stitch:sync-ds`, then everything else. The Stitch DesignSystem must reflect whatever tokens are current — generations against a stale DesignSystem will use the wrong palette.

## Drift audit

Run `pnpm extract:target-theme` to compare the target's current `tokens.css` against `dist/tokens/tokens.json`. The script reports tokens missing in either direction and value drift. **Run this before the first real component change** so the user knows what divergence already exists.

## Stitch DesignSystem mapping

Stitch's `project.createDesignSystem(...)` accepts a coarser schema than Figma's variables can describe. `stitch-sync-design-system.ts` logs every Figma variable that fails to round-trip; for those, prompts must compensate verbally — for example, `"use the muted parchment background #f3e9d2 for primary surfaces and the soft sepia border #5b3a1e at hairline weight"` rather than `"use the parchment-100 surface and ink-500 border"` (Stitch may not have those names available).

## Adding a new token

1. Add the variable to Figma in the appropriate collection.
2. `pnpm tokens:sync` (pulls).
3. `pnpm stitch:sync-ds` (mirrors to Stitch).
4. `pnpm sync:target-tokens` (mirrors to target).
5. (Optional) update workshop `tailwind.config.ts` if the new token needs special handling beyond the preset.
6. Reference the token by its CSS variable name OR via `import { tokens } from '@tokens/index'`.

## Removing a token

Removal is a breaking change. Run `pnpm extract:target-theme` first to see what consumes it. Open both repos in your editor, search for the token name, and migrate consumers before the next sync. The harness has no automatic migration — token removal is a coordinated change.
