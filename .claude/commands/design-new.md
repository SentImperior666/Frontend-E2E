---
description: Convenience wrapper — assemble a fresh Stitch prompt from brief + aesthetic + template, generate, then drop into the inner loop. Equivalent to `/design-loop` for the first generation.
argument-hint: --component <Name> --story <storyId> [--device DESKTOP|MOBILE|TABLET] [--aesthetic <key>] [--template <name>] [--brief "<prose>"]
---

# /design-new

Wrapper around `/design-loop` for the first-generation case. Use this when you've decided what you want, you have a brief, and you want to skip the "should I iterate or restart?" prompt that `/design-loop` shows for existing stories.

## Procedure

1. Refuse if `.stitch/screens/<storyId>/` already exists. Suggest `/design-loop --story <storyId>` (to continue) or `/design-edit <storyId> ...` (to edit) or move-aside and re-run.
2. Otherwise, dispatch to `/design-loop` with the same args.

## Why this exists

`/design-loop` is the canonical orchestrator. `/design-new` exists only to make first-generation invocations less ambiguous — most operators understand "new" faster than "loop with no prior state". They share the same implementation.
