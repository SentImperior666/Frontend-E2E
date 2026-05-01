# Code Connect — Figma ↔ workshop component mapping

The harness uses `scripts/figma-mapping.ts` as the single source of truth for which storyId corresponds to which Figma `{fileKey, nodeId}`. The mapping is consumed in two directions:

- **Workshop → Figma** (write): `/figma-publish` calls `scripts/figma-publish-frame.ts`, which pushes a converged screen back to a frame in `FIGMA_FILE_KEY`. On success it updates the `MAPPING` constant in `figma-mapping.ts`.
- **Figma → Workshop** (read, alternative baseline): when the brief comes from a designer-led Figma frame instead of a Stitch generation, `figma-export-baselines.ts` consults the mapping to pull baseline PNGs for the inner loop.

## Why not Figma's official Code Connect?

Figma's Code Connect product maps Figma components to *production* React components and surfaces "this is the component to use" hints in Figma. We want a different relationship: the **storyId** is the canonical identifier, and the Figma frame is one of two possible baseline sources (Stitch being the other). A mapping table in this repo, version-controlled alongside the components themselves, gives us the same outcome with less coupling.

If the team wants real Code Connect later, the mapping in `figma-mapping.ts` is sufficient seed data — every entry is `{ storyId, fileKey, nodeId }`, which is exactly what Code Connect needs.

## Picking which screenshot to publish

When `/figma-publish <storyId>` runs, it has two candidate images:

- `.stitch/screens/<storyId>/screenshot.png` — the latest Stitch render (HTML rendered headlessly by Stitch).
- `.lostpixel/current/<storyId>--1280.png` — the converged React render at 1280.

We publish **the converged React render**. The Stitch render exists for code-loop convergence; the React render is what ships. This keeps the Figma file aligned with the runtime, not with an intermediate artifact.

## Frame naming

Frames published by the harness are named `Stitch Export — <storyId>`. The "Stitch" prefix is historical — even when the baseline came from a Figma frame originally, the published artifact represents the converged shipping render.

## What gets attached to the frame

- The PNG fill (the converged render).
- A sticky note containing:
  - `Story: <storyId>`
  - `Published: <ISO timestamp>`
  - The full prompt history (from `.stitch/screens/<storyId>/edit-history.jsonl`).
  - The path to the converged React component (`src/components/<Name>.tsx`).

Designers reviewing the file see the run-to-run history without leaving Figma.
