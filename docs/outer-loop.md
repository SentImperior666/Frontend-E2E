# Outer loop — design iteration with humans in the loop

The outer loop is the harness's defining capability: a design-critic-driven feedback cycle that decides whether to ship, revise the implementation, revise the design, or explore variants. This doc explains the cycle in operator terms and documents the GitHub Action that ingests human PR comments back into it.

## The cycle

```
       brief + aesthetic + template
                 │
                 ▼
       Stitch.generate ─────────────► HTML + screenshot (baseline)
                 │
                 ▼
   ┌────── inner loop ───────────┐
   │ write/patch React           │
   │ capture @ 4 viewports       │
   │ lost-pixel diff vs baseline │
   │ converge (< 0.5%) or cap    │
   └─────────────┬───────────────┘
                 ▼
       combined tests (vitest, playwright, axe, lighthouse)
                 │
                 ▼
       design-critic verdict
                 │
   ┌─────────────┼─────────────┬─────────────────────┐
   ▼             ▼             ▼                     ▼
 SHIP       REVISE_IMPL   REVISE_DESIGN        EXPLORE_VARIANTS
                │             │                     │
   inner loop ◄─┘             ▼                     ▼
                       feedback-translator    Stitch.variants
                              │                     │
                              ▼                     ▼
                       Stitch.edit (1 aspect)  human picks one
                              │                     │
                              └────► back to top ◄──┘
```

## Verdicts in detail

- **`SHIP`** — implementation honors the brief and aesthetic, no veto-rule trigger. `/figma-publish` becomes available; `/port-to-svelte` becomes available.

- **`REVISE_IMPL`** — design intent is correct, code drifted. The critic emits `hints[]` ("the spell list wraps incorrectly on mobile", "candle-glow on the active actor row is missing"). Inner loop re-enters with hints injected; `visual-diff-reviewer` prioritizes hinted regions before others.

- **`REVISE_DESIGN`** — design itself has a problem. The critic emits a `critique` describing the issue and a single `suggestedAspects[0]`. `feedback-translator` rewrites the critique as a Stitch-friendly single-aspect edit prompt. `screen.edit(...)` runs. New baseline. Inner loop re-enters from scratch (new baseline → fresh convergence).

- **`EXPLORE_VARIANTS`** — uncertainty about a dimension. The critic emits `suggestedCreativeRange` (REFINE / EXPLORE / REIMAGINE) and `suggestedAspects`. `screen.variants(...)` produces a gallery; the harness pauses and writes `.stitch/pending-pick.json`. Operator inspects the gallery and resumes via `/design-loop --story <id> --resume`.

## Veto rules

The critic's output is constrained: any of these forces a non-SHIP verdict regardless of visual fidelity.

- Any axe-core violation with `impact: serious | critical`.
- Any `lighthouserc.json` assertion failure (LCP, CLS, TBT, JS bundle, image bytes).
- Any console error during scenario tests.
- Any scenario test failure.

This is the `tests are veto signals` rule from CLAUDE.md.

## Iteration caps

- Inner loop: 6 iterations per outer-loop revision.
- Outer loop: 4 design revisions per `/design-loop` run.

On cap, the orchestrator surfaces the latest evidence (baseline screenshot, current render, diff PNG, test reports) and **stops**. It does not silently extend.

## Human PR-comment ingress

Reviewers comment on the harness PR with `/design-feedback`-prefixed text. The `design-feedback` GitHub Action (`.github/workflows/design-feedback.yml`) listens to `issue_comment` and `pull_request_review_comment` events and dispatches the `/design-from-feedback` Claude command.

### Comment format

```
/design-feedback REVISE_DESIGN story:character-sheet--default
spell list looks too modern, give the cards illuminated drop-caps and a slight aged texture
```

```
/design-feedback REVISE_IMPL story:dice-tray--default
the dice are clipping at the bottom on mobile
```

```
/design-feedback EXPLORE_VARIANTS story:lobby-list--default aspects:color,fonts count:3
```

### Action behavior

1. Action fires on comment creation.
2. Action checks out the harness repo and runs `/design-from-feedback <comment-api-url>`.
3. The orchestrator parses the comment, checks the story-level lock at `.stitch/screens/<storyId>/lock`, and routes to the appropriate flow:
   - **REVISE_IMPL** → `/design-loop --story <id> --resume` with body as `criticHints`.
   - **REVISE_DESIGN** → `feedback-translator` → `/design-edit` → `/design-loop --resume-after-edit`.
   - **EXPLORE_VARIANTS** → `/design-variants`.
4. After convergence (or pause for variant pick), Action posts a reply on the original PR comment with the new Stitch screenshot and converged React render.

### Lock + rate limiting

Two safety properties:

- **Story-level lock.** While `/design-loop` is running for a story, `.stitch/screens/<storyId>/lock` is held. If a `/design-feedback` comment arrives during that window, the Action posts "design-loop currently running for this story; re-comment when it finishes" and exits. **Comments are not queued.**
- **Per-comment one-shot.** Each `/design-feedback` comment triggers one Action run. If the operator wants to re-route after a SHIP verdict, they re-comment with a fresh directive.

### Required secrets

- `secrets.CLAUDE_API_KEY` (or your preferred Claude Code auth)
- `secrets.STITCH_API_KEY`
- `secrets.FIGMA_API_TOKEN`
- `secrets.LHCI_GITHUB_APP_TOKEN` (optional, for Lighthouse CI uploads)
- `secrets.LOST_PIXEL_API_KEY` and `secrets.LOST_PIXEL_PROJECT_ID` (optional, for Lost Pixel cloud)
- `secrets.ARGOS_TOKEN` (optional)
- `secrets.TARGET_REPO_DEPLOY_KEY` (read-only sufficient for parity; read-write if you also want the Action to push the target-side PR)

### Required vars

- `vars.TARGET_REPO_SLUG` — `owner/repo` of the target site (parity workflow).

## What the human reviewer sees

A `/design-feedback` comment triggers a sequence:

1. Action acknowledges with a 👀 reaction (best practice; up to the implementer).
2. The harness runs the requested route. Time depends on the verdict (REVISE_IMPL is fastest, EXPLORE_VARIANTS is fastest *until* the human picks, REVISE_DESIGN is slowest because it includes the inner loop).
3. Action posts a reply with:
   - The new Stitch screenshot (or `n/a` for REVISE_IMPL).
   - The new converged React render at 1280.
   - A summary line: `"converged at iter 3, parity 0.4%, axe ✓, lighthouse ✓"`.
   - The next-step affordance: `/design-feedback SHIP story:<id>` to advance, or `/design-feedback REVISE_DESIGN story:<id>` to keep iterating.

If the harness hits the outer-loop iteration cap without converging, the reply says so, links to the latest evidence, and asks the reviewer to either redirect (different aesthetic key, different brief) or escalate.

## When humans should override the critic

The critic is conservative. It will hold to `REVISE_IMPL` longer than necessary on small visual mismatches. If the reviewer believes the screen is good enough to ship despite the critic, they comment:

```
/design-feedback SHIP story:<id> override
```

This explicit override bypasses the critic for one cycle and proceeds to `/figma-publish` and `/port-to-svelte`. The override is logged in `.stitch/screens/<storyId>/edit-history.jsonl` so the next `/design-evaluate` run can see that a human signed off.

## Out-of-scope on Claude Code on the web

The full convergence flow requires local Playwright. Web Claude Code sessions can:

- Trigger Stitch generations and edits.
- Review PRs (read).
- Author skills, prompt templates, manifests.

Web sessions **cannot**:

- Run the inner loop (no headless browser).
- Run parity tests.
- Run Lighthouse / axe.

For the full loop, use a local Claude Code session or the GitHub Action.
