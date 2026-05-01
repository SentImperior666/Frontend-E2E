---
description: Inner code-iteration loop — write/patch the React component to converge against the Stitch (or Figma) baseline at four viewports.
argument-hint: --component <Name> --story <storyId> [--max-iters 6] [--threshold 0.005] [--baseline stitch|figma]
---

# /redesign-iter

## Args
- `--component <Name>` — required.
- `--story <storyId>` — required.
- `--max-iters 6` — cap.
- `--threshold 0.005` — Lost Pixel threshold (default 0.5%).
- `--baseline stitch|figma` — which baseline source to use. Default: `stitch` if `.stitch/screens/<storyId>/` exists, else `figma`.

## Procedure

1. Verify the baseline images exist under `.lostpixel/baseline/<storyId>/{375,768,1280,1920}.png`. If `--baseline figma`, run `pnpm figma:export-baselines -- --story <storyId>` first.
2. If `src/components/<Name>.tsx` does **not** exist, scaffold it from the relevant inner-loop template. Apply skills in priority order: `game-ui-patterns` → `frontend-design` → `web-design-guidelines` → `react-best-practices` → `composition-patterns`. Author the matching `src/stories/<Name>.stories.tsx`.
3. Build Storybook static once: `pnpm storybook:build` (incremental on subsequent iterations).
4. Capture per-viewport screenshots via Playwright into `.lostpixel/current/<storyId>--<viewport>.png` for each of {375, 768, 1280, 1920}.
5. Diff against baseline via `pnpm test:visual` (Lost Pixel writes `.lostpixel/diff/`).
6. If `max(diff) < threshold` for all viewports → done.
7. Else spawn `visual-diff-reviewer` subagent with `{ storyId, viewport: <largest-diff>, componentPath, storyPath, baselinePath, currentPath, diffPath, iteration, maxIterations, criticHints }`.
8. After the reviewer's edit, re-capture and re-diff. Increment iteration. Loop until threshold or `--max-iters`.
9. On cap, surface latest baseline / current / diff PNGs and the iteration trail; do not silently continue.

## Inputs from outer loop

When called by `/design-loop`, the outer loop may inject `criticHints: [...]` and `priorIteration: <n>` so the reviewer focuses on hinted regions.

## Convergence semantics

- "Converged" means `max(diff)` over all four viewports < threshold for **two consecutive** iterations OR a single iteration that reached < (threshold / 2). The two-iteration rule prevents accidental thresholding when one iteration overshot.
- If a viewport has no Stitch baseline (e.g., `MOBILE` was skipped), do not synthesize one — exclude that viewport from the convergence check.
