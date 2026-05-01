---
description: Outer loop orchestrator — generate via Stitch, converge code via inner loop, run combined tests, dispatch design-critic, branch on verdict.
argument-hint: --component <Name> --story <storyId> [--device DESKTOP|MOBILE|TABLET] [--aesthetic <key>] [--template <stitchTemplate>] [--brief "<prose>"] [--max-design-iters 4] [--max-code-iters 6] [--resume]
---

# /design-loop

Orchestrates the **outer loop** for a single story. Wraps the inner loop (`/redesign-iter`) and the design critique step.

## Args
- `--component <Name>` — React component name (PascalCase). Required unless `--resume`.
- `--story <storyId>` — kebab-case story id, e.g. `character-sheet--default`. Required.
- `--device DESKTOP|MOBILE|TABLET` — Stitch device hint. Default: `DESKTOP`.
- `--aesthetic <key>` — aesthetic manifest, e.g. `high-fantasy-parchment`. Default: read from CLAUDE.md (`high-fantasy-parchment`).
- `--template <name>` — file in `prompts/stitch/`. Default: derived from component name (e.g., `CharacterSheet` → `character-sheet`).
- `--brief "<prose>"` — extra natural-language brief; substitutes `{{BRIEF}}` in the template.
- `--max-design-iters 4` — cap on outer-loop revisions.
- `--max-code-iters 6` — cap on inner-loop revisions per design.
- `--resume` — resume from `.stitch/pending-pick.json` after a human picks a variant.

## Procedure

1. **Resolve prompt.**
   - Apply the `stitch-prompting` skill.
   - Read `prompts/stitch/<template>.md` and `prompts/aesthetics/<aesthetic>.md`.
   - Substitute `{{BRIEF}}` with `--brief` (or empty).
   - Substitute `{{MOCK_DATA}}` with the template's mock-data block.
   - Reject any prompt containing contradictory adjectives (regex against the anti-pattern list in the skill).

2. **Ensure Stitch project + DesignSystem.**
   - `pnpm stitch:init` (idempotent).
   - If `dist/tokens/tailwind.preset.js` is newer than `.stitch/design-system.json`, run `pnpm stitch:sync-ds`.

3. **Generate baseline.**
   - `pnpm stitch:generate -- --story <storyId> --device <device> --prompt <resolved-prompt-path>`.
   - The script writes `.stitch/screens/<storyId>/{screen.id, prompt.txt, html/, screenshot.png, edit-history.jsonl}`, downloads CDN assets to `public/assets/stitch/<storyId>/`, and renders per-viewport baselines into `.lostpixel/baseline/<storyId>/`.
   - For `MOBILE`, also re-prompt at desktop and store the desktop variant under `.stitch/screens/<storyId>--desktop/` for cross-device reference.

4. **Inner loop.**
   - Invoke `/redesign-iter --component <Name> --story <storyId> --max-iters <max-code-iters>` with hints from prior critic verdicts (if any) injected.

5. **Combined tests.**
   - `pnpm test:isolated` — Vitest unit + Storybook test-runner (stories + axe).
   - `pnpm test:combined` — Playwright scenarios.
   - `pnpm test:a11y` — axe project.
   - `pnpm test:perf` — Lighthouse CI assertions.
   - Capture all reports under `playwright-report/` and `.lighthouseci/`.

6. **Design critique.**
   - Spawn `design-critic` subagent with the full evidence bundle (paths to the screenshots, axe report, lighthouse report, console errors, scenario results, brief, aesthetic key).
   - Parse the verdict JSON.

7. **Branch on verdict.**
   - **`SHIP`**: log success; offer to run `/figma-publish <storyId>` and `/port-to-svelte <storyId>`. Stop.
   - **`REVISE_IMPL`**: increment inner-loop counter; re-enter step 4 with `criticHints` injected. Cap at `--max-code-iters`.
   - **`REVISE_DESIGN`**:
     - Increment outer-loop counter; if at cap, surface latest evidence and stop.
     - Spawn `feedback-translator` subagent with `{ critique, currentStitchScreenshot, currentReactRender, aestheticKey, preferredAspect: suggestedAspects[0] }`.
     - Receive `editPrompt` + `aspect`.
     - `pnpm stitch:edit -- --story <storyId> --feedback "<editPrompt>" --aspect <aspect>`.
     - Re-render baselines.
     - Re-enter step 4. Inner-loop counter resets (new baseline → fresh convergence).
   - **`EXPLORE_VARIANTS`**:
     - `pnpm stitch:variants -- --story <storyId> --range <suggestedCreativeRange> --aspects <suggestedAspects> --count 3`.
     - Open the gallery HTML at `.stitch/galleries/<storyId>-<timestamp>.html`.
     - Write a marker to `.stitch/pending-pick.json` with `{ storyId, generatedAt }`.
     - **Stop and ask the user** to pick a variant. Do not auto-resume.
     - On `--resume`, read the marker, copy the picked variant's HTML / screenshot / assets into the canonical screen location, and re-enter step 4.

## Caps and idempotency

- Outer-loop counter is in `.stitch/screens/<storyId>/edit-history.jsonl` (one entry per outer-loop revision).
- Inner-loop counter is local to step 4.
- Re-running `/design-loop` for an existing story without `--resume` first prompts: "Existing screen at .stitch/screens/<storyId> — continue iterating, restart, or cancel?"

## Story-level lock

While `/design-loop` is running for a story, write `.stitch/screens/<storyId>/lock` with PID and timestamp. The `/design-from-feedback` command refuses if the lock is held. Release on exit.

## Failure modes

- Stitch generate returns 5xx → retry once with backoff; if still failing, surface the API error and stop.
- Lost Pixel diff exceeds threshold after `--max-code-iters` → outer loop logs as `REVISE_IMPL` exhausted; emit "needs human design intervention" and stop.
- Critic emits malformed JSON → retry the critic call once with a stricter format reminder; if still malformed, fall back to `REVISE_IMPL` with hints `["critic output malformed; treating as code-side issue"]` and stop after one more inner-loop pass.
