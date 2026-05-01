# Aesthetics — catalog

Six aesthetic keys ship with the harness. The default for new screens is `high-fantasy-parchment`. Pick differently when the brief explicitly calls for it; otherwise inherit.

| Key | Era | Intent | Use for |
|---|---|---|---|
| `high-fantasy-parchment` | Medieval-romantic | Warm, scholarly, ornate-but-readable | Default. Character sheets, journals, world wikis, spell cards in classical fantasy systems. |
| `gritty-grimdark` | Late-medieval-gothic | Oppressive, blood-stained, ironworked | Mörk Borg, Warhammer Fantasy, Soulslike adaptations, dark-tone games. |
| `ethereal-arcane` | Timeless / between-worlds | Weightless, luminous, runic | Spell descriptions, lore, divinations, wizardly UIs in any system. |
| `steampunk` | Industrial-Victorian | Brass, walnut, ticking | Iron Kingdoms, Eberron, Dishonored-tone settings. |
| `scifi-rpg` | Near-future / corporate-dystopia | Technical, instrumented, cold | Lancer, Cyberpunk RED, Mothership, Stars Without Number. |
| `modern-vtt` | Contemporary-app | Clean, restrained, system-agnostic | Companion app, GM tools, scheduler, lobby — places where the rich aesthetic would be visual noise. |

## Picking a key

The brief usually decides. When unclear, pick the one that maps to the *system* the screen is in. A character sheet for D&D 5e is `high-fantasy-parchment` by default; a character sheet for Lancer is `scifi-rpg`. The system determines the aesthetic; the screen type doesn't.

## Mixing keys

Don't. Each screen has exactly one key. Mixing produces aesthetic drift across the site. If two screens *need* different keys (the GM's lobby screen vs the character sheet for the campaign they host), use them independently — but do not, under any circumstances, mix two keys within a single screen.

## Adding a new key

When the user genuinely needs an aesthetic the catalog doesn't cover (cosmic horror? folk horror? wuxia?), author a new manifest under `prompts/aesthetics/<key>.md` with the same six sections (ambiance adjectives, mature-tool refs, color/material, typographic intent, motion intent, anti-patterns). The most important section is **anti-patterns** — it's the fence that keeps Stitch from defaulting to its global UI prior.

After writing the manifest, generate a sample screen at `--aesthetic <new-key> --template character-sheet --brief "<brief>"` and inspect the result. Iterate the manifest until the sample feels right. Then commit the manifest and use it.

## Aesthetic regressions

When `pnpm scripts:audit-aesthetic` lands (TBD per implementation plan), it will diff converged renders against a representative gallery and flag outliers. Until then, the operator audits drift visually — periodically open Storybook and scroll through all stories.

## Sample renders

Once `/design-loop` produces converged screens, save representative thumbnails into `docs/aesthetics-samples/<key>-<screen>.png` and reference them inline above. Until samples exist, keys are documented by prose only.
