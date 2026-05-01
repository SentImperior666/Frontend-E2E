---
description: Explore variants of an existing screen via Stitch `screen.variants(...)` and emit a side-by-side gallery for human pick.
argument-hint: <storyId> --range REFINE|EXPLORE|REIMAGINE [--aspects layout|color|fonts|images|text,...] [--count 1..5]
---

# /design-variants

## Args
- `<storyId>` — positional, required.
- `--range REFINE|EXPLORE|REIMAGINE` — required. `REFINE` for small variations on the current screen, `EXPLORE` for moderately different alternatives, `REIMAGINE` for from-scratch riffs on the same brief.
- `--aspects` — comma-separated list of aspects to vary. Default: all five if omitted.
- `--count` — 1..5; default 3.

## Procedure

1. Verify `.stitch/screens/<storyId>/` exists.
2. Verify the story-level lock is not held.
3. `pnpm stitch:variants -- --story <storyId> --range <range> --aspects <list> --count <n>`.
4. The script writes each variant to `.stitch/screens/<storyId>/variants/<idx>/` and emits an HTML gallery to `.stitch/galleries/<storyId>-<timestamp>.html`. Each tile shows the variant screenshot + a "pick" link.
5. Open the gallery in the system browser (or surface the path to the operator).
6. Write `.stitch/pending-pick.json` with `{ storyId, generatedAt }`.
7. Stop. The operator picks; resume via `/design-loop --story <storyId> --resume`.

## When to use which range

- **REFINE** — you converged on a direction and want minor wiggle room ("try the same layout with three slightly different border ornaments").
- **EXPLORE** — same brief, different concrete take ("try three different ways to lay out the spell list").
- **REIMAGINE** — you've lost confidence the current direction is right and want to see fundamentally different riffs on the brief. Expect bigger jumps.
