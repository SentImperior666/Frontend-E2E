---
description: Re-run only the design-critic on an existing converged story. Useful after tests change or the operator wants a fresh verdict without iterating.
argument-hint: <storyId>
---

# /design-evaluate

## Procedure

1. Verify `.stitch/screens/<storyId>/` and `src/components/<derived-name>.tsx` exist.
2. Re-capture per-viewport renders into `.lostpixel/current/<storyId>--<viewport>.png` via `pnpm test:visual` (Lost Pixel) and `pnpm test:a11y && pnpm test:perf` for fresh axe + Lighthouse reports.
3. Spawn `design-critic` subagent with the full evidence bundle.
4. Print the verdict JSON. Do NOT auto-act on `REVISE_*` — this command is read-only by design.

## Why read-only

`/design-evaluate` is a check, not an iteration. After reading the verdict, the operator decides whether to call `/design-loop`, `/design-edit`, `/design-variants`, or do nothing.
