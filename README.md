# Frontend-E2E

> A Stitch + Figma-driven workshop and Svelte porting harness for a tabletop-RPG site. Generate atmospheric game-style UI with Google's Stitch SDK, iterate it in a Next.js + React + Tailwind v4 + Storybook 8 workshop, critique it with an agent, and ship it as `.svelte` components into a separate Vite + Svelte + Tailwind site.

[![ci](https://img.shields.io/badge/ci-green)](#ci)
[![lost-pixel](https://img.shields.io/badge/visual--regression-Lost%20Pixel-blueviolet)](https://github.com/lost-pixel/lost-pixel)
[![axe](https://img.shields.io/badge/a11y-axe--core-success)](https://github.com/dequelabs/axe-core)
[![lighthouse](https://img.shields.io/badge/perf-Lighthouse%20CI-orange)](https://github.com/GoogleChrome/lighthouse-ci)
[![license](https://img.shields.io/badge/license-MIT-lightgrey)](LICENSE)

This repo is a **harness**, not the runtime site. The runtime — character sheets, dice rollers, spell cards, combat trackers, lobbies, world journals, NPC dialogue — lives at `$TARGET_REPO_PATH` in a separate Vite + Svelte + Tailwind project. Here, components are generated, iterated, and converged in a high-AI-density Next.js workshop, then ported into the runtime.

---

## Table of contents

- [Why this exists](#why-this-exists)
- [Highlights](#highlights)
- [Architecture](#architecture)
- [Quickstart](#quickstart)
- [Workflows](#workflows)
- [Project structure](#project-structure)
- [Configuration](#configuration)
- [Skills, commands, and subagents](#skills-commands-and-subagents)
- [Testing](#testing)
- [CI](#ci)
- [Aesthetics catalog](#aesthetics-catalog)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

---

## Why this exists

Tabletop-RPG UI lives in a different design register from typical SaaS. Parchment, runes, leather, candlelight, ornate borders — every screen needs an aesthetic point of view. Generating that with `<Button variant="primary" />` and a generic component library produces a soulless site.

This harness pairs:

- A **design generator** (Stitch SDK) that authors HTML + screenshots from natural-language prompts, constrained by a DesignSystem mirroring Figma's tokens.
- A **code-iteration loop** that converges hand-authored React against the generated screenshot at four viewports.
- A **design critic** (LLM subagent) that reads the converged render alongside test reports (axe, Lighthouse, console, scenarios) and decides: ship, revise the implementation, revise the design, or explore variants.
- A **porting loop** that walks the target repo's `.svelte` files, picks an idiomatic placement for the new component, ports it dialect-aware (Svelte 4 vs 5), and runs a parity diff between the React render and the Svelte render.

The result: AI-generated screens that honor the aesthetic, ship as production Svelte components, and never bypass accessibility or performance budgets.

---

## Highlights

- 🎨 **Stitch SDK integration** — `/design-loop`, `/design-edit`, `/design-variants` drive `@google/stitch-sdk` with project-local prompt templates and aesthetic manifests.
- 🔁 **Two nested feedback loops** — outer loop iterates the *design*; inner loop converges *code* against a fixed baseline.
- 🧠 **Design critic + feedback translator** — two subagents that route between SHIP / REVISE_IMPL / REVISE_DESIGN / EXPLORE_VARIANTS verdicts.
- 🛡 **Tests are veto signals** — axe-core (a11y) and Lighthouse CI (perf) failures block SHIP regardless of visual fidelity.
- 🧭 **Target-aware porting** — scans the target's `.svelte` files, builds an import graph, and recommends a destination directory based on name overlap, family hint, and folder concentration. No hard-coded paths.
- 🧵 **Two PRs, one feature** — harness PR carries the React workshop component; target PR carries the Svelte component, parity test, token sync.
- 💬 **Human-in-the-loop via PR comments** — `/design-feedback` comments trigger a GitHub Action that re-enters the outer loop.
- 🎭 **Six aesthetic keys** — `high-fantasy-parchment` (default), `gritty-grimdark`, `ethereal-arcane`, `steampunk`, `scifi-rpg`, `modern-vtt`. Add your own.

---

## Architecture

```
┌──────────────── OUTER (design) loop ───────────────────────────────────────┐
│                                                                            │
│   Brief / aesthetic key                                                    │
│     │                                                                      │
│     ▼                                                                      │
│   Stitch.generate(prompt, designSystem) ──► HTML + screenshot              │
│     │                                                                      │
│     ▼                                                                      │
│   ┌────── INNER (code) loop ──────────────────────────────────────┐        │
│   │   Stitch screenshot is the baseline                           │        │
│   │     ▼                                                         │        │
│   │   write/patch React component + Storybook story               │        │
│   │     ▼                                                         │        │
│   │   Playwright capture @ 4 viewports                            │        │
│   │     ▼                                                         │        │
│   │   lost-pixel diff vs Stitch baseline                          │        │
│   │     ▼                                                         │        │
│   │   diff < threshold? ─── no ──► visual-diff-reviewer ──► patch │        │
│   │     │ yes                                                     │        │
│   └─────┼─────────────────────────────────────────────────────────┘        │
│         ▼                                                                  │
│   Combined tests: Vitest, Playwright flow, axe-core a11y, Lighthouse perf  │
│         ▼                                                                  │
│   design-critic subagent                                                   │
│         ▼                                                                  │
│   verdict ∈ { SHIP, REVISE_IMPL, REVISE_DESIGN, EXPLORE_VARIANTS }         │
│     │           │              │                  │                        │
│     │           ▼              ▼                  ▼                        │
│     │      back to inner   feedback-translator    screen.variants(         │
│     │      loop with       → screen.edit(prompt)    creativeRange,aspects) │
│     │      hints             ──► back to top       ──► present to human    │
│     │                                                                      │
│     ▼                                                                      │
│   /port-to-svelte → emit .svelte + parity test → target repo PR            │
│                                                                            │
└────────────────────────────────────────────────────────────────────────────┘

Human ingress: PR comments on harness PR → /design-feedback parses comment,
                routes to feedback-translator → screen.edit(...) → re-enter outer loop.
```

For detail, see [`docs/outer-loop.md`](docs/outer-loop.md).

---

## Quickstart

### Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| Node.js | ≥ 20.10 | Runtime for the workshop and scripts |
| pnpm | ≥ 9 | Package manager |
| Claude Code | latest | Drives the design loops, orchestrates subagents and slash commands |
| A Stitch API key | — | `STITCH_API_KEY` env var |
| A Figma API token | read scope, write scope optional | `FIGMA_API_TOKEN`, `FIGMA_WRITE_TOKEN` |
| A target Svelte repo | Vite + Svelte 4/5 + Tailwind | Path set via `TARGET_REPO_PATH` |

### Install

```bash
# 1. Clone
git clone https://github.com/<owner>/Frontend-E2E.git
cd Frontend-E2E

# 2. Install deps
pnpm install

# 3. Install Playwright browsers
pnpm dlx playwright install chromium

# 4. Configure .env
cp .env.example .env
# edit .env: STITCH_API_KEY, FIGMA_FILE_KEY, FIGMA_API_TOKEN, TARGET_REPO_PATH, ...

# 5. Install Claude Code plugins (these live outside .mcp.json and are user-installed)
#    From a Claude Code session:
#       /plugin install figma
#       /plugin marketplace add ChromeDevTools/chrome-devtools-mcp
#       /plugin install chrome-devtools-mcp

# 6. Sanity check
pnpm typecheck
pnpm storybook:build
```

### First run

```bash
# Pull tokens from Figma → dist/tokens/{tokens.css, tokens.json, tailwind.preset.js}
pnpm tokens:sync

# Mirror tokens into the Stitch project's DesignSystem
pnpm stitch:init
pnpm stitch:sync-ds

# Mirror tokens into the target site
pnpm sync:target-tokens

# Walk the target's .svelte files into .harness/target-graph.json
pnpm scan:target
```

### Generate your first screen

From a Claude Code session:

```
/design-loop --component DiceTray --story dice-tray--default --device DESKTOP --aesthetic high-fantasy-parchment --template dice-roller
```

The orchestrator generates a Stitch baseline, converges a React `<DiceTray>` against it across four viewports, runs a11y + perf gates, dispatches the `design-critic` subagent, and either ships, revises, or asks you to pick a variant.

---

## Workflows

### Authoring a new screen

```
/design-loop --component <Name> --story <id> --device DESKTOP --aesthetic <key> --template <prompts/stitch/file>
```

1. **Prompt assembly** — combines `prompts/stitch/<template>.md` + `prompts/aesthetics/<key>.md` + your `--brief`. Enforces the Stitch Prompt Guide rules (single anchor, no contradictions, ≤5,000 chars).
2. **Stitch generate** — produces HTML + screenshot. Cached under `.stitch/screens/<storyId>/`.
3. **Asset localization** — CDN-hosted images downloaded to `public/assets/stitch/<storyId>/`.
4. **Per-viewport baselines** — headless Chromium renders the HTML at 375 / 768 / 1280 / 1920.
5. **Inner code loop** — `/redesign-iter` writes/patches React; iterates until Lost Pixel diff < 0.5%.
6. **Combined tests** — Vitest, Playwright scenarios, axe-core, Lighthouse CI.
7. **Design critic** — verdict JSON.
8. **Branch** — SHIP, REVISE_IMPL (back to inner loop with hints), REVISE_DESIGN (feedback-translator → `/design-edit`), or EXPLORE_VARIANTS (gallery + human pick).

### Editing an existing screen

```
/design-edit dice-tray--default --feedback "darken the felt to oxblood" --aspect color
```

`/design-edit` enforces the canonical Stitch rule: one aspect per call. Multi-aspect feedback ("darker AND wider AND switch the font") is refused; queue sequential edits.

### Porting to the target Svelte site

```
/port-to-svelte dice-tray--default --family combat
```

1. Auto-refreshes `.harness/target-graph.json` if stale (default TTL 60 min).
2. `find-component-placement` scores existing locations by name-token overlap (50%), family match (30%), and folder concentration (20%).
3. Surfaces the suggested path + rationale; stops if no convention emerges.
4. Authors the `.svelte` file in the matching dialect (Svelte 4 reactive vs Svelte 5 runes, detected from the target's `package.json`).
5. Updates the local `index.ts` barrel if neighbors use one.
6. Emits a parity test that diffs the target's render against the workshop's converged screenshots.
7. Iterates with `svelte-port-reviewer` until parity diff < 1%.

### Publishing to Figma

```
/figma-publish dice-tray--default
```

Only runs after a `SHIP` verdict. Uses the figma plugin's `use_figma` MCP tool to create (or update) a frame in `FIGMA_FILE_KEY`, attach the converged screenshot as an image fill, and append a sticky note with the prompt history. Updates `scripts/figma-mapping.ts` with the new `{storyId, fileKey, nodeId}`.

### Human-in-the-loop via PR comments

Comment on a harness PR:

```
/design-feedback REVISE_DESIGN story:character-sheet--default
spell list looks too modern, give the cards illuminated drop-caps and a slight aged texture
```

The `design-feedback` GitHub Action parses, locks the story, dispatches `/design-from-feedback`, and replies on the PR with the new converged render once the loop settles.

---

## Project structure

```
.
├── .claude/
│   ├── settings.json                  # workshop permissions, env defaults
│   ├── commands/                      # slash commands (/design-loop, /design-edit, /port-to-svelte, ...)
│   ├── agents/                        # subagents (design-critic, feedback-translator, ...)
│   └── skills/                        # 4 project-local + 5 vendored skills
├── .github/workflows/                 # ci, lost-pixel, parity, a11y, perf, design-feedback
├── .lostpixel/                        # baseline (committed) + current/diff (gitignored)
├── .stitch/                           # Stitch state cache (projects.json, screens/, galleries/)
├── .harness/                          # local caches (target-graph.json, figma-publish-input.json) — gitignored
├── .storybook/                        # main / preview / test-runner config
├── docs/                              # design-system, code-connect, porting, stitch-playbook, aesthetics, outer-loop
├── prompts/
│   ├── stitch/                        # 10 per-screen-type prompt templates (character-sheet, dice-roller, ...)
│   └── aesthetics/                    # 6 aesthetic manifests
├── public/assets/stitch/              # localized Stitch CDN assets
├── scripts/                           # 17+ pipeline scripts (stitch-*, figma-*, scan-target-*, sync-target-*)
├── src/
│   ├── app/                           # Next.js App Router (workshop dev surface)
│   ├── components/                    # React components (auto-generated by /design-loop)
│   ├── stories/                       # Storybook stories
│   └── tokens/                        # generated TS module from update-tokens.ts
├── tests/
│   ├── a11y/                          # Playwright axe project specs
│   ├── parity/                        # parity specs emitted by /port-to-svelte
│   ├── scenarios/                     # Playwright user-flow specs
│   └── visual/                        # per-story visual specs
├── dist/tokens/                       # tokens.css + tokens.json + tailwind.preset.js (generated)
├── CLAUDE.md                          # operating rules — read this when joining the project
├── package.json
├── tsconfig.json
├── tailwind.config.ts                 # consumes dist/tokens/tailwind.preset.js
├── playwright.config.ts               # axe / scenarios / visual / parity projects
├── lostpixel.config.ts
├── lighthouserc.json                  # perf budgets (LCP ≤ 3500ms, CLS ≤ 0.1, JS ≤ 350kb, ...)
└── .mcp.json                          # playwright MCP server
```

---

## Configuration

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Purpose |
|---|---|---|
| `STITCH_API_KEY` | yes (or OAuth pair) | Stitch SDK auth |
| `STITCH_PROJECT_ID` | no (auto-populated) | Cached on first `pnpm stitch:init` |
| `STITCH_PROJECT_PURPOSE` | no | Defaults to `rpg-site` |
| `FIGMA_FILE_KEY` | yes | Source of canonical tokens; destination of `/figma-publish` |
| `FIGMA_API_TOKEN` | yes | Read tokens from Figma |
| `FIGMA_WRITE_TOKEN` | only for `/figma-publish` | `file_content:write` scope |
| `TARGET_REPO_PATH` | yes for `/port-to-svelte` | Absolute path to the runtime Svelte site |
| `TARGET_TOKENS_PATH` | no | Defaults to `src/lib/tokens` |
| `TARGET_DEFAULT_COMPONENT_PATH` | no | Fallback when placement heuristic has no signal |
| `TARGET_PARITY_PATH` | no | Defaults to `tests/parity` |
| `TARGET_ASSETS_PATH` | no | Defaults to `static/assets/stitch` |
| `TARGET_GRAPH_TTL_MINUTES` | no | Auto-refresh threshold for the target graph (default 60) |
| `ARGOS_TOKEN` | no | Argos visual review uploads |
| `LHCI_GITHUB_APP_TOKEN` | no | Lighthouse CI GitHub status posting |

---

## Skills, commands, and subagents

### Slash commands

| Command | What it does |
|---|---|
| `/design-loop` | Outer loop — generate, converge, critique, branch on verdict |
| `/design-new` | First-generation wrapper around `/design-loop` |
| `/design-edit` | Single-aspect Stitch edit on an existing screen |
| `/design-variants` | Stitch `screen.variants(...)` → side-by-side gallery |
| `/design-evaluate` | Re-run `design-critic` on an existing converged story |
| `/design-from-feedback` | Parse a PR comment → route to inner/outer loop |
| `/scan-target` | Refresh `.harness/target-graph.json` |
| `/redesign-iter` | Inner code loop (lost-pixel diff vs baseline) |
| `/port-to-svelte` | Workshop component → target `.svelte` + parity test |
| `/figma-publish` | Publish converged screen to Figma (post-SHIP) |

### Subagents

| Agent | Role |
|---|---|
| `design-critic` | Reads renders + tests; emits verdict JSON |
| `feedback-translator` | Prose critique → single-aspect Stitch edit prompt |
| `visual-diff-reviewer` | Lost Pixel diff → CSS/JSX patch (inner loop) |
| `svelte-port-reviewer` | Parity diff → `.svelte` patch (porting loop) |

### Skills

| Skill | Source | Purpose |
|---|---|---|
| `stitch-prompting` | project-local | Stitch Prompt Guide rules (transcribed) + harness rules |
| `game-ui-patterns` | project-local | Tabletop-RPG conventions (stat blocks, dice trays, ...) |
| `target-conventions` | project-local | How to read `target-graph.json`; placement rules |
| `svelte-port` | project-local | React → Svelte 4 / 5 dialect mapping |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) | Anthropic's design taste/discipline |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Web Interface Guidelines compliance |
| `react-best-practices` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | React/Next perf rules |
| `composition-patterns` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | Compound components, slot layouts |
| `impeccable` | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Design taste guardrails (vendor `npx skills add` for full functionality) |

When skills conflict, the priority is: `game-ui-patterns` > `stitch-prompting` > `svelte-port` > `target-conventions` > `frontend-design` > `impeccable` > `web-design-guidelines` > `react-best-practices` > `composition-patterns`.

---

## Testing

```bash
# Unit
pnpm test                         # vitest

# Storybook + per-story axe
pnpm storybook:test

# Playwright projects
pnpm test:combined                # scenario specs
pnpm test:a11y                    # axe project
pnpm test:visual                  # lost-pixel
pnpm test:parity                  # parity loop (requires target preview server)

# Performance
pnpm test:perf                    # Lighthouse CI against storybook-static
```

**Veto rules** — the `design-critic` subagent forces a non-SHIP verdict on:

- any axe-core violation with `impact: "serious"` or `impact: "critical"`,
- any `lighthouserc.json` assertion failure (LCP, CLS, TBT, JS bundle, image size),
- any console error during scenario tests,
- any scenario test failure.

Visual fidelity alone is never enough.

---

## CI

Six workflows under `.github/workflows/`:

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | push, PR | typecheck, lint, build, unit tests |
| `lost-pixel.yml` | PR touching components/stories/tokens | Visual regression vs committed baselines |
| `parity.yml` | PR touching components/stories | Checks out target via deploy key, syncs tokens, runs parity specs |
| `a11y.yml` | PR touching src | Storybook test-runner per-story axe + Playwright axe project |
| `perf.yml` | PR touching src/tokens/lighthouserc | Lighthouse CI gates |
| `design-feedback.yml` | `issue_comment` / `pull_request_review_comment` starting with `/design-feedback` | Routes to `/design-from-feedback` |

---

## Aesthetics catalog

| Key | Use when |
|---|---|
| `high-fantasy-parchment` *(default)* | D&D 5e, Pathfinder, classical fantasy systems |
| `gritty-grimdark` | Mörk Borg, Warhammer Fantasy, Soulslike adaptations |
| `ethereal-arcane` | Spell descriptions, lore, planar travel, divinations |
| `steampunk` | Iron Kingdoms, Eberron, Dishonored-tone settings |
| `scifi-rpg` | Lancer, Cyberpunk RED, Mothership |
| `modern-vtt` | Companion app, GM tools, scheduler — places where rich aesthetic would be noise |

Each manifest under `prompts/aesthetics/` carries: ambiance adjectives, mature-tool style refs, color/material palette in prose, typographic intent, motion intent, and anti-patterns. See [`docs/aesthetics.md`](docs/aesthetics.md).

---

## Troubleshooting

### "stitch credentials missing"
Set `STITCH_API_KEY` in `.env`, or use the OAuth pair (`STITCH_ACCESS_TOKEN` + `GOOGLE_CLOUD_PROJECT`).

### "No Stitch project initialized"
Run `pnpm stitch:init`. The script idempotently creates a project via `stitch.callTool("create_project", {...})` and persists the id to `.stitch/projects.json`.

### "Refusing to sync: target repo has uncommitted changes"
The token/asset sync scripts guard against silently stomping local design work in the target repo. Commit or stash in the target, then re-run.

### "No clear convention; using fallback"
The placement heuristic couldn't pick a folder. The harness will warn and stop. Either pass `--family <hint>` (e.g., `combat`, `character`) to bias the score, or pass `--target-path <abs-folder>` to override.

### Stitch generation produces drift from the aesthetic
Check `.stitch/design-system.json` — `pnpm stitch:sync-ds` logs unmapped Figma variables. Compensate verbally in the prompt with hex codes, e.g., `"use the muted parchment background #f3e9d2"` instead of `"use the parchment-100 surface"`.

### Outer loop hits the iteration cap
The orchestrator stops at 4 design revisions and surfaces the latest evidence. This usually means the aesthetic key, the brief, or the template needs to change — not that the loop should be extended.

### Parity diff hovers around 1% legitimately
Cross-framework rendering produces small text-rendering differences. If a component's parity diff is consistently near threshold, document the cause (font fallback, antialiasing) in the harness PR description and consider raising `--threshold` for that component.

### `/figma-publish` fails with "Plugin API required"
Frame creation requires the Figma Plugin API. Install the figma plugin in Claude Code: `/plugin install figma`. The `use_figma` MCP tool handles the write in-session.

---

## Contributing

This harness is opinionated. PRs are welcome, but please read [`CLAUDE.md`](CLAUDE.md) and [`docs/outer-loop.md`](docs/outer-loop.md) before opening anything substantial — both encode operating rules that aren't obvious from the code.

### Common PR shapes

- **New aesthetic key** — add a manifest under `prompts/aesthetics/<key>.md` with all six sections (ambiance adjectives, mature-tool refs, color/material palette, typography, motion, anti-patterns). Generate a sample screen and commit a representative thumbnail under `docs/aesthetics-samples/`.
- **New screen template** — add `prompts/stitch/<screen-type>.md` with frontmatter `style_anchors`, a `## Layout` section, a `## Mock data` block, and a `{{BRIEF}}` placeholder.
- **New skill** — author under `.claude/skills/<skill-name>/SKILL.md` with `name`, `description`, `when_to_use` frontmatter. Update CLAUDE.md's skill priority list if it interacts with existing skills.
- **Pipeline script** — keep all glue in `scripts/`; share helpers via `scripts/_lib/`. Don't introduce new dependencies without a need-to-have justification.

### Local development

```bash
pnpm dev                          # Next.js workshop on :3000
pnpm storybook                    # Storybook on :6006
pnpm typecheck && pnpm lint       # Pre-PR checks
```

### Conventions

- TypeScript strict mode.
- No comments unless they explain *why*, not *what*. Identifiers and types should be self-documenting.
- Tests are veto signals — never silence axe / Lighthouse regressions to make a PR green.
- One change per Stitch edit. Always.

---

## License

MIT. See [LICENSE](LICENSE).

Vendored skills retain their upstream licenses:
- `frontend-design` — Anthropic (see upstream `LICENSE.txt`)
- `web-design-guidelines`, `react-best-practices`, `composition-patterns` — MIT (Vercel)
- `impeccable` — Apache 2.0 (Patrick Bakaus; based on Anthropic's frontend-design skill)

---

## Acknowledgments

- **Google** for the [Stitch SDK](https://github.com/google-labs-code/stitch-sdk) and the [Stitch Prompt Guide](https://discuss.ai.google.dev/t/stitch-prompt-guide/83844).
- **Anthropic** for [Claude Code](https://claude.com/claude-code) and the [skills library](https://github.com/anthropics/skills).
- **Vercel Labs** for the [agent-skills collection](https://github.com/vercel-labs/agent-skills).
- **Patrick Bakaus** for [impeccable](https://github.com/pbakaus/impeccable).
- **The TTRPG community** — D&D Beyond, Roll20, Foundry VTT, Pathfinder Nexus — whose mature UI conventions inform `game-ui-patterns`.
