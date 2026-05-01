---
description: Single-aspect Stitch edit on an existing screen. Refuses multi-aspect feedback and asks for a split.
argument-hint: <storyId> --feedback "<text>" [--aspect layout|color|fonts|images|text]
---

# /design-edit

## Args
- `<storyId>` — positional, required.
- `--feedback "<text>"` — required.
- `--aspect <one>` — optional; if omitted, the `feedback-translator` subagent infers it.

## Procedure

1. Verify `.stitch/screens/<storyId>/` exists. If not, refuse with "Run /design-new first."
2. Verify the story-level lock at `.stitch/screens/<storyId>/lock` is not held. If held, refuse with "design-loop currently running for this story."
3. Apply the `stitch-prompting` skill's regex check on `--feedback`: if the text mentions more than one of {color, layout, font/typography, image/asset, text/copy}, refuse with:
   > Multi-aspect feedback detected: {detected aspects}. Stitch edits change one aspect per call. Split into sequential `/design-edit` invocations.
4. Spawn `feedback-translator` subagent with `{ storyId, critique: <feedback>, currentStitchScreenshotPath, currentReactRenderPath, aestheticKey, preferredAspect: <aspect> | null }`.
5. Receive `editPrompt` + `aspect`. Refuse if `rejectedReason` is set.
6. `pnpm stitch:edit -- --story <storyId> --feedback "<editPrompt>" --aspect <aspect>`.
7. The script appends to `.stitch/screens/<storyId>/edit-history.jsonl`, replaces local HTML / screenshot, re-renders baselines.
8. Surface the new baseline screenshot path and offer to run `/design-loop --story <storyId> --resume-after-edit` (which re-enters the inner loop with the new baseline).

## Examples

```
/design-edit dice-tray--default --feedback "darken the felt to oxblood" --aspect color
```

```
/design-edit character-sheet--default --feedback "spell list looks too modern, illuminated drop-caps and aged texture"
```
(infers `--aspect images`)

```
/design-edit character-sheet--default --feedback "make it darker and rearrange the layout"
```
→ refused; split.
