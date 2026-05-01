---
name: stitch-prompting
description: How to write prompts for the Stitch SDK so generated screens land on-brand for the tabletop RPG site. Codifies the canonical Stitch Prompt Guide rules with attribution, plus our project-specific harness rules (one-aspect edits, single anchor per prompt, aesthetic continuity).
when_to_use: Whenever assembling a prompt for `stitch-generate`, `stitch-edit`, or `stitch-variants`. Triggered by `/design-loop`, `/design-edit`, `/design-variants`, `/design-from-feedback`, and the `feedback-translator` subagent.
source_canonical: https://discuss.ai.google.dev/t/stitch-prompt-guide/83844
---

# Stitch prompting

This skill codifies the canonical **Stitch Prompt Guide** (Google AI Developers Forum) plus the harness's project-specific rules layered on top.

## Part A — Canonical Stitch Prompt Guide rules

> Quoted/paraphrased from https://discuss.ai.google.dev/t/stitch-prompt-guide/83844 ("Stitch Prompt Guide"). Treat the upstream discussion as authoritative — re-read before any major prompt-engineering change. Phrases marked with quotation marks are direct quotes from the guide; the rest is faithful summary.

### Starting approach

> "Choose to start with a broad concept or specific details. For complex apps, start high-level and then drill down on details screen by screen."

- **High-level start.** "Start with a general idea." Example: `"An app for marathon runners."`
- **Detailed start.** "Describe core functionalities for a better starting point." Include the major capabilities (community engagement, training advice, race discovery, etc.) directly in the brief so Stitch builds the bones with structure that fits.

### Vibe setting

> "Use adjectives to define the app's feel (influences colors, fonts, imagery)."

Examples from the guide: `"vibrant and encouraging"`, `"minimalist and focused"`. Adjectives carry a lot — the model interprets them as joint hints across color, typography, and imagery.

### Incremental changes (the most load-bearing rule)

> "Stitch performs best with clear, specific instructions. Focus on one screen/component and make one or two adjustments per prompt."

> "Be Specific: Tell Stitch _what_ to change and _how_."

### Pro tips (verbatim)

- "Be Clear & Concise: Avoid ambiguity"
- "Iterate & Experiment: Refine designs with further prompts"
- "One Major Change at a Time: Easier to see impact and adjust"
- "Use UI/UX Keywords: (e.g., 'navigation bar,' 'call-to-action button,' 'card layout')"
- "Reference Elements Specifically"
- "Review & Refine: If a change isn't right, rephrase or be more targeted"

### Anti-patterns (from documented user experience in-thread, attributed to user `tempo`)

- "Do **not** mix layout changes and UI components in the same prompt."
- "Stitch **does not remember** your previous design unless you're extremely precise and incremental."
- Combining multiple changes in one prompt causes Stitch to "recreate the entire layout, breaking everything."
- Long prompts (over 5,000 characters) lead to "Stitch consistently **omits some components**."
- **Recommended approach:** "Use short, focused prompts — one change at a time. Do not combine features."

### Examples from the guide

**Color**:
- Specific: `"Change primary color to forest green."`
- Mood-based: `"Update theme to a warm, inviting color palette."`

**Typography**:
- `"Use a playful sans-serif font."`
- `"Change headings to a serif font."`

**Image modifications**:
- `"Change background of [all] [product] images on [landing page] to light taupe."`
- `"On 'Team' page, image of 'Dr. Carter (Lead Dentist)': update her lab coat to black."`

**Language**:
- `"Switch all product copy and button text to Spanish."`

**Multi-prompt workflow (factory dashboard example, from the guide):**
1. Create the table structure with two-row tasks.
2. Add filter dropdowns separately.
3. Align the title and add the icon separately.

The guide's discipline is to split. Always.

### Editing vs. generating

- Start with high-level concepts for initial generation.
- Use screen-by-screen iteration for refinement.
- "Save screenshots after each successful change to prevent unexpected resets."
- Begin with broad ideas, then "drill down on details screen by screen."

### Device-type guidance

The guide does not give explicit device-type guidance. The harness's project rule (Part B) fills that gap: re-prompt with `MOBILE` for companion screens; do not scale a desktop layout down.

---

## Part B — Harness rules (project-local, layered on top of the guide)

These rules are how the guide's principles become specifically actionable in this codebase.

### B.1 Three-layer prompt assembly

When the harness assembles a prompt for `stitch-generate`, it stacks three layers in order:

1. **Layout structure** (from `prompts/stitch/<template>.md`). Spatial bones in prose. Names regions ("left rail", "center column", "right rail"). Implements the guide's "use UI/UX keywords" rule.
2. **Vibe / ambiance adjectives** (from `prompts/aesthetics/<key>.md`). Implements the guide's "vibe setting" rule.
3. **Mock data** (from the template's `## Mock data` section). Realistic, sized content so the model sizes cells correctly. The guide implies this with its "Reference elements specifically" rule; we make it explicit.

Plus a single appended **mature-tool style anchor** drawn from the template's `style_anchors` frontmatter (e.g., `"character sheet density like D&D Beyond's full sheet"`). One anchor maximum per prompt — multiple anchors blur the model's target.

### B.2 One-aspect edits (enforced)

The `/design-edit` command refuses multi-aspect feedback. The guide's "one major change at a time" rule is enforced here as a hard refusal — not a request, not a preference. The aspects map onto the SDK's `Aspect` enum:

| Operator alias | SDK `Aspect` value |
|---|---|
| `layout` | `LAYOUT` |
| `color` | `COLOR_SCHEME` |
| `images` | `IMAGES` |
| `fonts` | `TEXT_FONT` |
| `text` | `TEXT_CONTENT` |

Translation happens at the SDK boundary in `scripts/_lib/stitch.ts`'s `toAspect()`. Operators always use the lowercase aliases.

When a user gives multi-aspect feedback ("darker AND wider AND switch the font"), queue the changes:

1. `/design-edit ... --aspect color`
2. `/redesign-iter` (re-converge code against new baseline)
3. `/design-edit ... --aspect layout`
4. `/redesign-iter`
5. `/design-edit ... --aspect fonts`
6. `/redesign-iter`

### B.3 Name the region

The guide says "Reference Elements Specifically." The `feedback-translator` subagent enforces this — it rewrites prose critique like "the spell list looks too modern" into "On the spell cards in the right rail, ...". A prompt without a named region is rejected.

### B.4 No pixel values

Stitch reasons about intent, not dimensions. `padding: 14px` in a prompt is noise; "comfortable padding, generous around headings" is signal. Pixel-level work is the inner code-iteration loop's job, where Lost Pixel measures it.

### B.5 Device-hint discipline

- `DESKTOP` for desk-bound screens (character sheet, world journal, combat tracker on a laptop).
- `MOBILE` for companion screens (initiative tracker on a phone at the table, dice roller used between turns at the table).
- `TABLET` for the rare middle case (battle map on iPad).
- **Do not** scale a desktop layout down to mobile — re-prompt with `MOBILE` device type. Single-source mobile is too low-fidelity (extends the canonical guide's silence on this).

### B.6 Aesthetic continuity

Re-using a screen's aesthetic key across screens is **mandatory**. Switching the key mid-edit produces incoherent output. To change the key, generate a new screen; do not edit across the boundary. The harness warns when a new screen specifies a different key from sibling screens (CLAUDE.md §13).

### B.7 5,000-character ceiling

The guide warns that prompts over ~5,000 characters cause Stitch to omit components. The prompt assembler in the harness should refuse (or warn) when the assembled prompt exceeds this length. Long mock-data blocks are the most common cause — trim aggressively rather than letting the assembler hit the ceiling.

### B.8 Contradiction guard

The assembler runs a regex check on the assembled prompt for known opposed-pair adjectives (e.g., "minimal" + "ornate", "maximalist" + "restrained"). On match, it refuses. The guide doesn't codify this, but our aesthetic manifests fail predictably when prompts contradict themselves.

### B.9 Compensating verbally for unmapped DesignSystem variables

The Stitch DesignSystem is coarser than Figma's variable graph. When `stitch-sync-design-system.ts` logs unmapped variables (e.g., shadows, radii), prompts must compensate verbally with hex codes or named values, e.g., `"use the muted parchment background #f3e9d2"` rather than `"use the parchment-100 surface"`. See `docs/stitch-playbook.md`.

---

## Part C — When invoked by `feedback-translator`

The translator receives prose critique and outputs a single-aspect Stitch edit prompt. It applies, in priority order:

1. **B.2** (one-aspect rule) — refuses multi-aspect critiques.
2. **B.3** (name the region) — rewrites vague references.
3. **A.4** ("Be Specific") — turns "it feels off" into "the spell cards in the right rail need illuminated drop-caps and a subtle aged-paper texture; keep the existing card layout."
4. **B.4** (no pixels) — strips any pixel values from the operator's input.

Output format is JSON conformant to the agent's `output` contract — see `.claude/agents/feedback-translator.md`.
