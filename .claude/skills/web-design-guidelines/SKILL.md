---
name: web-design-guidelines
description: Review UI code for Web Interface Guidelines compliance. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".
source: https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines (vendored verbatim)
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <file-or-pattern>
---

# Web Interface Guidelines

Review files for compliance with Web Interface Guidelines.

## How It Works

1. Fetch the latest guidelines from the source URL below
2. Read the specified files (or prompt user for files/pattern)
3. Check against all rules in the fetched guidelines
4. Output findings in the terse `file:line` format

## Guidelines Source

Fetch fresh guidelines before each review:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

Use WebFetch to retrieve the latest rules. The fetched content contains all the rules and output format instructions.

## Usage

When a user provides a file or pattern argument:
1. Fetch guidelines from the source URL above
2. Read the specified files
3. Apply all rules from the fetched guidelines
4. Output findings using the format specified in the guidelines

If no files specified, ask the user which files to review.

---

## Tabletop-RPG application (project addendum)

The Web Interface Guidelines pull from a separate Vercel-Labs repo and refresh
each invocation. They cover the standard contemporary web-quality bar — focus
states, contrast, semantic HTML, responsive behavior, reduced-motion support.

For our project:

- **AA contrast is veto-grade**, per CLAUDE.md item 7. The `design-critic`
  subagent must downgrade `SHIP` to `REVISE_DESIGN` when contrast fails on a
  parchment-on-cream surface, regardless of how on-brand the render looks.
- **Focus rings are not optional** in any aesthetic. The grimdark and arcane
  manifests describe their focus-ring styling (an ink-blot expansion vs a
  prismatic ripple) — don't drop the affordance to honor mood.
- **Reduced motion** is non-negotiable. Each aesthetic manifest specifies a
  reduced-motion fallback (e.g., parchment's ink-bleed crossfade falls back to
  a simple opacity fade). Implement both branches.
- **Semantic HTML** for game UI: `<button>` for actions ("Roll", "End turn",
  "Edit character"), `<a>` for navigation between sheet sections, `<dialog>`
  for spell card detail modals when used (or, per `impeccable`'s advice,
  exhaust inline alternatives first).

When this skill conflicts with `frontend-design`, this skill (and the upstream
Web Interface Guidelines) wins on accessibility and semantics; `frontend-design`
wins on aesthetic and typographic decisions.
