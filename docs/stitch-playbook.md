# Stitch playbook

This doc is for the operator. The mechanical rules live in `.claude/skills/stitch-prompting/SKILL.md`. Here we explain how to think about Stitch in the harness — when to use it, when to push back on it, when to bypass it.

## What Stitch is

The Stitch SDK (https://github.com/google-labs-code/stitch-sdk) generates HTML + screenshots from a natural-language prompt under a configured DesignSystem. We use it as a **baseline generator** for the inner code-iteration loop. Critically, Stitch HTML is **not** transpiled to React — the inner loop hand-writes React that *looks like* the Stitch HTML.

If you expected "Stitch → React component" automatically, you'll be surprised. That's deliberate. The HTML is too coarse for production component code; treating it as a baseline lets the React component carry production-grade structure (composition, context, state) while honoring the visual target.

## When to use Stitch

- **New screen.** Brief in hand, aesthetic key chosen, no prior design. Use `/design-loop`.
- **Major redesign.** A converged screen needs a fundamentally different look. Use `/design-loop` again with a new aesthetic or new template — don't try to evolve via `/design-edit`.
- **Aesthetic exploration.** Three concrete riffs on the same brief. Use `/design-variants`.

## When NOT to use Stitch

- **Tiny components** (a button, a chip). The DesignSystem already determines how these look; generating from a brief is wasted effort. Hand-author them in the workshop.
- **Pure logic components** (data fetchers, providers). Nothing visual to generate.
- **A small change** ("the spacing in the header is off"). That's a code-loop fix, not a Stitch edit. Don't bounce.

## The DesignSystem

Stitch's DesignSystem is a coarser schema than Figma's variable graph. `pnpm stitch:sync-ds` mirrors what fits and **logs** what doesn't. Read those logs after every sync. For each unmapped variable, you have two options:

1. **Compensate verbally in prompts.** Instead of "use the parchment background", write "use the muted parchment background `#f3e9d2`". Hex codes work; named tokens that Stitch doesn't have do not.
2. **Restructure the Figma variables** so they fit Stitch's schema (rare, but sometimes the right move when the Figma side has accumulated unnecessary depth).

## One change per edit (and what to do when you have many changes)

The single hardest discipline is `/design-edit` refusing multi-aspect feedback. It's friction by design. Multi-aspect edits collapse into incoherent renders.

When the user gives you "darker AND wider AND switch the font," you queue:

1. `/design-edit <storyId> --feedback "darken the dice tray surface to oxblood" --aspect color`
2. `/redesign-iter` (re-converge code against the new baseline)
3. `/design-edit <storyId> --feedback "widen the tray to span the full width of the right rail" --aspect layout`
4. `/redesign-iter`
5. `/design-edit <storyId> --feedback "use the display face for the dice values" --aspect fonts`
6. `/redesign-iter`

This is slower than one mega-edit, but the result is coherent and each step is revertible. A single chaotic edit that produces something nobody asked for costs more time to recover from than three patient edits.

## Working with the prompt templates

Templates live under `prompts/stitch/`. Each template has:

- `style_anchors` (in frontmatter) — mature-tool references the prompt assembler can pick from. **One** anchor is appended to the assembled prompt; do not pile on.
- A `## Layout` section — spatial bones in prose.
- A `## Mock data` section — realistic, sized content. **Do not replace mock data with `Lorem ipsum`** — Stitch reasons about cell sizes from the data, and lorem ipsum collapses cells.
- A `## Brief slot` with `{{BRIEF}}` placeholder.

The assembler adds the chosen aesthetic manifest's ambiance line and style anchor on top. To customize a template for a specific brief, edit the `## Brief slot` text inline (`--brief "..."` substitutes); don't rewrite the layout section unless you're changing the structural pattern.

## Working with aesthetic manifests

Manifests live under `prompts/aesthetics/`. Each manifest covers:

- ambiance adjective list (used to seed the prompt's mood line)
- mature-tool style refs (used to seed the anchor)
- color/material palette in prose (used when the DesignSystem can't carry a token)
- typographic intent
- motion intent
- **anti-patterns**

The anti-pattern lists are load-bearing. The Stitch model has internalized many UI clichés that don't belong in a tabletop-RPG aesthetic; the manifest's anti-patterns are a guard against them. Read them before adding a new manifest.

## Aesthetic continuity

Re-using an aesthetic key across screens is **mandatory** unless the brief explicitly calls for a switch. Re-running `/design-loop --aesthetic <different-key>` for a screen that already shipped under a different key produces a Frankenstein site. The harness warns when a new screen specifies a different key from sibling screens. Heed the warning.

## Image assets

Stitch returns HTML that references CDN-hosted images. `stitch-download-assets.ts` localizes these into `public/assets/stitch/<storyId>/` and rewrites the HTML. **Never rely on remote Stitch URLs in production.** They have unknown longevity. The local copies are committed alongside the harness PR.

Synced into the target via `pnpm sync:target-assets` → `$TARGET_ASSETS_PATH/<storyId>/`.

## Reviewing Stitch output

Before entering the inner loop, eyeball the Stitch screenshot. Common failures worth catching early (before code converges):

- **Wrong aesthetic key applied.** The render looks too modern, too dark, etc. — tell the orchestrator to bail and re-prompt with the correct key.
- **Mock data ignored.** The render shows generic placeholders instead of the supplied data. Re-generate; sometimes the data block is too long and gets ignored.
- **Layout pattern not honored.** The "left rail / center / right rail" structure devolved into a single column. Re-prompt with more explicit region naming.
- **Anti-pattern triggered** ("minimal yet ornate" produced minimalism). Re-read the anti-pattern list, fix the manifest if needed, re-prompt.

It's faster to throw away a wrong-from-the-start Stitch render than to try to converge code against it.
