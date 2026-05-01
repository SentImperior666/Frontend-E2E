---
description: Publish a converged screen back to Figma as a new frame, using the figma MCP plugin's write tool. Frame creation requires Plugin API access — REST alone cannot do this — so the actual write runs in-session.
argument-hint: <storyId>
---

# /figma-publish

## Why the wiring is split

Figma's REST API does not support creating frame nodes. Frame creation requires the Figma Plugin API, which the **figma plugin** (`/plugin install figma`) exposes to Claude Code as the `use_figma` MCP tool. That tool can only be invoked from a Claude Code session — not from a Bash script. So `/figma-publish` is two halves:

- A **prepare** script (`pnpm figma:publish prepare <storyId>`) that validates the verdict, picks the right screenshot, and emits a manifest at `.harness/figma-publish-input.json`.
- This **slash command** body, which reads the manifest, drives the figma MCP write, and calls back into the script to update `figma-mapping.ts`.

## Prerequisites

- `figma` plugin installed (`/plugin install figma`).
- `FIGMA_FILE_KEY` and `FIGMA_WRITE_TOKEN` (with `file_content:write` scope) set in `.env`.
- The story's latest critic verdict is `SHIP` (or a human override line `verdict: SHIP override` exists in `edit-history.jsonl`).

## Procedure

1. **Load the prerequisite Figma skill.** Per the figma plugin's instructions, invoke the `figma:figma-use` skill before any `use_figma` call. This is mandatory; skipping it causes hard-to-debug failures. (See the figma plugin's setup notes.)

2. **Prepare.** Run:
   ```
   Bash: pnpm figma:publish prepare <storyId>
   ```
   This writes `.harness/figma-publish-input.json` with shape:
   ```jsonc
   {
     "storyId": "...",
     "fileKey": "...",
     "screenshotPath": "/abs/path/to/png",
     "promptText": "...",
     "editHistoryTail": ["...jsonl lines..."],
     "existingNodeId": null | "...",
     "frameName": "Stitch Export — <storyId>",
     "preferredScreenshotSource": "converged" | "stitch"
   }
   ```
   The script refuses if the latest verdict isn't `SHIP`.

3. **Read the manifest.** Open `.harness/figma-publish-input.json`.

4. **Drive the figma MCP write.** Call `use_figma` (per `figma:figma-use` rules) with a script that, in the file at `manifest.fileKey`:
   - **If `manifest.existingNodeId` is null** — creates a new top-level frame named `manifest.frameName`. Sized to match the screenshot's natural dimensions (read via Bash `pnpm dlx sharp-cli metadata <screenshotPath>` or `node -e "..."` if needed). Returns the new node id.
   - **If `manifest.existingNodeId` is set** — locates that node, clears its image fill, and updates the frame name to `manifest.frameName`. Returns the same node id.

   Then in either case:
   - Loads the screenshot bytes from `manifest.screenshotPath` (read in-session via the Read tool, then pass the base64 to `use_figma`).
   - Sets the frame's image fill to those bytes.
   - Adds a sticky note next to the frame (or appends to an existing sticky if one is already attached) containing:
     ```
     Story: <storyId>
     Published: <ISO timestamp>
     Screenshot source: <converged|stitch>
     Latest converged React component: src/components/<derived-name>.tsx

     Prompt:
     <manifest.promptText>

     Recent edit history:
     <last 5 lines of manifest.editHistoryTail>
     ```

5. **Capture the node id.** The `use_figma` script must return the new (or updated) node id. Capture it as `<nodeId>`.

6. **Update the mapping.** Run:
   ```
   Bash: pnpm figma:publish update-mapping <storyId> <fileKey> <nodeId>
   ```
   This idempotently rewrites the `MAPPING` constant in `scripts/figma-mapping.ts` and commits-ready.

7. **Surface the result.** Report the new Figma frame URL: `https://www.figma.com/file/<fileKey>?node-id=<nodeId>`.

## Failure modes

- **Plugin not loaded.** If `figma:figma-use` skill isn't available, refuse with "install the figma plugin first: `/plugin install figma`."
- **No converged screenshot.** The prepare script falls back to the Stitch screenshot if `.lostpixel/current/<storyId>--1280.png` is missing. If both are missing, it errors — converge first.
- **Verdict isn't SHIP.** Prepare refuses. To override, append a `{"verdict":"SHIP","override":true,...}` line to `.stitch/screens/<storyId>/edit-history.jsonl` — the prepare script accepts the most recent verdict line regardless of override flag.
- **`use_figma` write fails.** Don't update the mapping. Surface the MCP error verbatim.

## Idempotency

Re-running `/figma-publish` for an existing story:
- Updates the *same* frame (via `manifest.existingNodeId`).
- Does **not** create a duplicate.
- Sticky note is appended, not replaced — designers reviewing the file see the run-to-run history.

## Why post-SHIP only

A frame in Figma is a record. Pre-SHIP screens churn — publishing every iteration would noise up the file. Designers reviewing Figma should see only the screens the harness signed off on.
