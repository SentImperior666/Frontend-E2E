---
description: Parse a PR review comment that begins with `/design-feedback` and route it through `feedback-translator` → `screen.edit` → outer loop. Designed for invocation by a GitHub Action.
argument-hint: <comment-url-or-file> [--story <storyId>]
---

# /design-from-feedback

## Args
- `<comment-url-or-file>` — either a `gh api`-fetchable URL like `repos/owner/repo/pulls/comments/12345` or a local file path containing the comment body.
- `--story <storyId>` — required if the comment doesn't include `story:<id>` in its body.

## Comment format

The harness expects PR comments in this shape:

```
/design-feedback REVISE_DESIGN story:character-sheet--default
spell list looks too modern, give the cards illuminated drop-caps and a slight aged texture
```

Or:

```
/design-feedback REVISE_IMPL story:dice-tray--default
the dice are clipping at the bottom on mobile
```

Or:

```
/design-feedback EXPLORE_VARIANTS story:lobby-list--default aspects:color,fonts count:3
```

## Procedure

1. Fetch the comment body. Parse:
   - Required: `/design-feedback` prefix, verdict word (`REVISE_DESIGN | REVISE_IMPL | EXPLORE_VARIANTS`), `story:<id>`.
   - Optional: `aspects:<csv>`, `count:<n>`, `range:<REFINE|EXPLORE|REIMAGINE>`.
2. Verify `.stitch/screens/<storyId>/` exists.
3. **Check the story-level lock** at `.stitch/screens/<storyId>/lock`. If held, post a reply on the PR comment ("design-loop currently running for this story; re-comment when it finishes") and exit non-zero.
4. Branch on verdict word:
   - **REVISE_IMPL**: extract the prose body (everything after the directive line). Inject into `/design-loop --story <storyId> --resume` as `criticHints`.
   - **REVISE_DESIGN**: spawn `feedback-translator` with `{ critique: <body>, ... }`. Take the resulting `editPrompt` + `aspect` and call `/design-edit <storyId> --feedback "<editPrompt>" --aspect <aspect>`. Then call `/design-loop --story <storyId> --resume-after-edit`.
   - **EXPLORE_VARIANTS**: parse `aspects:`, `count:`, `range:` (defaults: all aspects, count 3, range EXPLORE). Call `/design-variants <storyId> --range <range> --aspects <list> --count <count>`.
5. After the loop converges (or pauses for variant pick), post a reply to the original PR comment with:
   - The new Stitch screenshot URL (uploaded as a comment image attachment).
   - The new converged React render URL (same).
   - A summary line ("converged at iter 3, parity 0.4%").

## Action wiring

A GitHub Action listens to `issue_comment` (and `pull_request_review_comment`) events whose body starts with `/design-feedback` and dispatches `workflow_dispatch` carrying the comment payload. The Action runs `claude --command "/design-from-feedback <comment-api-url>"` in a job environment with `STITCH_API_KEY`, `FIGMA_API_TOKEN`, and `TARGET_REPO_PATH` (deploy key). See `docs/outer-loop.md` for the full wiring.

## Rate limit

If a comment lands while the lock is held, do not queue. Reply once, exit. Operators re-comment.
