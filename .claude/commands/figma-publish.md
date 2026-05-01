---
description: Publish a converged screen back to Figma as a new frame, so the Figma file remains the canonical design record.
argument-hint: <storyId>
---

# /figma-publish

## Procedure

1. Verify `FIGMA_WRITE_TOKEN` is set (with `file_content:write` scope). Bail otherwise.
2. Verify the story has converged AND the latest critic verdict is `SHIP`. Read `.stitch/screens/<storyId>/edit-history.jsonl` to confirm. If the latest entry isn't a SHIP verdict, refuse with "Latest critic verdict is <verdict>; only SHIP screens publish."
3. Run `pnpm figma:publish -- --story <storyId>`. The script:
   - Reads `.stitch/screens/<storyId>/screenshot.png` (or the latest `current` render — see `docs/code-connect.md` for the choice).
   - Creates a new frame in `FIGMA_FILE_KEY` named `Stitch Export — <storyId>`.
   - Embeds the screenshot as the frame's image fill.
   - Adds a sticky note with the prompt history and the converged React component path.
   - Updates `scripts/figma-mapping.ts`'s exported `MAPPING` constant with the new `{ storyId, fileKey, nodeId }`.
4. Surface the new frame URL.

## Why post-SHIP only

A frame in Figma is a record. Pre-SHIP screens churn — publishing every iteration would noise up the file. Designers reviewing Figma should see only the screens the harness signed off on.

## When the canonical Figma frame already exists

If `figma-mapping.ts` already has a mapping for `<storyId>`, the script updates the existing frame in place rather than creating a new one. The prompt-history sticky is appended, not replaced.
