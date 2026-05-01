# Tabletop RPG Site — Workshop & Porting Harness

This repo is a **harness**, not the site. The runtime site lives at `$TARGET_REPO_PATH` (Vite + Svelte + Tailwind). Here we generate, iterate, and converge rich game-style UI in a Next.js + React + Tailwind v4 + Storybook 8 workshop, then port converged components into the target repo.

## 1. Project type
Online tabletop RPG site — character sheets, dice rollers, spell cards, combat trackers, lobbies, world journals, NPC dialogue. **Visual priority: rich, themed, atmospheric** (parchment, runes, leather, candlelight, ornate borders), not minimalist business SaaS. **Default aesthetic key**: `high-fantasy-parchment`. Override per `/design-loop` invocation.

## 2. Two repos, one harness
- Workshop: this repo. React components live under `src/components/`. Stories under `src/stories/`. Generated baselines under `.lostpixel/baseline/`.
- Runtime: `$TARGET_REPO_PATH`. Never write outside the configured target paths (`TARGET_TOKENS_PATH`, `TARGET_PARITY_PATH`, `TARGET_ASSETS_PATH`, plus the per-component path returned by `find-component-placement`).

## 3. Two loops
- **Outer loop** (`/design-loop`) — drives design generation + critique. Stitch generates → inner loop converges → critic verdicts → maybe revise design → maybe explore variants → ship.
- **Inner loop** (`/redesign-iter`) — drives code convergence against a fixed baseline (Stitch screenshot or Figma frame).

New visual work always starts at the outer loop. Hand-authoring a `.tsx` blank-file for non-trivial visual work is forbidden.

## 4. Stitch is the design generator
Every new screen begins with `/design-loop`. The Stitch SDK produces HTML + screenshots that become the baseline for the inner code-iteration loop. Stitch HTML is **not** transpiled to React — the inner loop converges hand-authored React *to look like* the HTML.

## 5. Stitch DesignSystem mirrors Figma
Re-sync after any token change with `pnpm tokens:sync && pnpm stitch:sync-ds`. The Stitch DesignSystem schema may not accept every Figma variable; unmapped variables are logged and must be compensated for verbally in prompts (see `docs/stitch-playbook.md`).

## 6. One change per Stitch edit
The `stitch-prompting` skill enforces this. If `/design-edit --feedback` mentions multiple categories (color + layout, fonts + images), the command refuses and asks for a split. High-level then drill down: first call sets the bones, subsequent edits refine sections by name.

## 7. Tests are veto signals
The `design-critic` subagent must downgrade `SHIP` to `REVISE_IMPL` or `REVISE_DESIGN` on:
- any serious/critical axe-core violation,
- any breach of the Lighthouse budget in `lighthouserc.json`.

Visual diff alone is not enough. The critic reads `{ stitchScreenshot, viewportRenders[], axeReport, lighthouseReport, consoleErrors, scenarioResults, brief, aestheticKey }` and emits a verdict JSON.

## 8. Skill priority
When skills conflict, prefer in this order:
1. `game-ui-patterns` (project-local; tabletop conventions)
2. `stitch-prompting` (project-local; prompt-guide rules)
3. `svelte-port` (project-local; React→Svelte rules)
4. `target-conventions` (project-local; how to read the target graph)
5. `frontend-design` (anthropics/skills)
6. `impeccable` (pbakaus/impeccable)
7. `web-design-guidelines` (vercel-labs/agent-skills)
8. `react-best-practices` (vercel-labs/agent-skills)
9. `composition-patterns` (vercel-labs/agent-skills)

## 9. Threshold defaults
- Lost Pixel (code ↔ Stitch baseline): `0.005` (0.5%).
- Parity (React workshop ↔ Svelte target render): `0.01` (1%).
- Critic perf/a11y: pass/fail (not thresholded).

## 10. Iteration caps
- Inner loop: 6 iters.
- Outer loop: 4 design revisions.
- On cap, surface latest evidence and stop. Do not silently extend.

## 11. Figma write enabled
`/figma-publish` runs only after critic verdict `SHIP`. Requires `FIGMA_WRITE_TOKEN` with `file_content:write` scope.

## 12. Human-in-the-loop
PR comments starting with `/design-feedback` route through `/design-from-feedback` (driven by a GitHub Action). See `docs/outer-loop.md` for the wiring. The Action must rate-limit and refuse during a running outer-loop pass for the same story (lock at `.stitch/screens/<storyId>/lock`).

## 13. Aesthetic continuity
Re-using a screen's aesthetic key is mandatory. The harness warns if a new screen specifies a different key from sibling screens. Aesthetic drift across screens is a known risk — periodic `pnpm scripts:audit-aesthetic` (TBD) flags outliers.

## 14. Out-of-scope on Claude Code on the web
Generation calls (Stitch) work in any Claude Code session. Visual + parity loops require local Playwright. Web sessions can drive design edits and review PRs but cannot run the full convergence flow.

## 15. Target component discovery
The target's `.svelte` files are scattered across feature folders, route folders, and ad-hoc locations. Before `/port-to-svelte` writes anything:
1. `scripts/scan-target-components.ts` walks `$TARGET_REPO_PATH/**/*.svelte`, parses imports/props, and emits `.harness/target-graph.json`.
2. `scripts/find-component-placement.ts` consults the graph to pick a destination directory based on name-token overlap, family hint, and folder concentration.
3. The `target-conventions` skill codifies route-vs-shared, barrel re-export detection, and naming case rules.

The graph is auto-refreshed by `/port-to-svelte` if older than `TARGET_GRAPH_TTL_MINUTES` (default 60). The graph is also used for impact analysis (importedBy walks) and reverse search (consistency anchors for new prompts).

## 16. Running the loops
- `/scan-target [--force]` — refresh the target graph.
- `/design-loop --component <Name> --story <id> --device DESKTOP|MOBILE|TABLET --aesthetic <key> --template <prompts/stitch/file>` — outer loop.
- `/design-edit <storyId> --feedback "<text>" --aspect color|layout|fonts|images|text` — single-aspect Stitch edit.
- `/design-variants <storyId> --range REFINE|EXPLORE|REIMAGINE [--aspects ...] [--count 1..5]` — gallery.
- `/design-evaluate <storyId>` — re-run critic only.
- `/port-to-svelte <storyId> [--family <hint>]` — port to target with placement discovery.
- `/figma-publish <storyId>` — publish converged screen to Figma (post-SHIP only).

## 17. Sources
See the §1 "Required reading" section in the implementation plan for canonical Stitch SDK docs and the Stitch Prompt Guide. The `stitch-prompting` skill must transcribe canonical rules verbatim with attribution; do not paraphrase.
