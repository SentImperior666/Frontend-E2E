/**
 * Advisory drift report. Reads the target's tokens.css (or its tailwind config
 * preset) and compares against dist/tokens/tokens.json. Surfaces:
 *   - tokens present in the target but not in Figma (drift away from canonical),
 *   - tokens present in Figma but not in the target (sync gap),
 *   - tokens whose value differs.
 *
 * No mutations. Run before first real component change to baseline drift.
 */
import path from "node:path";
import { readFile } from "node:fs/promises";
import { DIST_TOKENS } from "./_lib/paths.js";
import { fileExists } from "./_lib/fs.js";
import { targetRepoPath, targetTokensPath } from "./_lib/paths.js";

interface TokenTree {
  colors: Record<string, string>;
  spacing: Record<string, number>;
  radii: Record<string, number>;
  shadows: Record<string, string>;
  typography: Record<string, unknown>;
}

function parseCssVars(css: string, prefix: string): Record<string, string> {
  const out: Record<string, string> = {};
  const re = new RegExp(`--${prefix}-([\\w-]+)\\s*:\\s*([^;]+);`, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    out[m[1]!] = m[2]!.trim();
  }
  return out;
}

async function main(): Promise<void> {
  const target = targetRepoPath();
  const targetTokensCss = path.join(target, targetTokensPath(), "tokens.css");
  const figmaJson = path.join(DIST_TOKENS, "tokens.json");
  if (!(await fileExists(figmaJson))) {
    throw new Error(`Canonical tokens.json missing at ${figmaJson}. Run \`pnpm tokens:sync\` first.`);
  }
  const figma: TokenTree = JSON.parse(await readFile(figmaJson, "utf8"));

  if (!(await fileExists(targetTokensCss))) {
    console.log(`extract-target-theme: target has no tokens.css yet (${targetTokensCss}).`);
    console.log(`This is expected on first run; \`pnpm sync:target-tokens\` will create it.`);
    return;
  }

  const targetCss = await readFile(targetTokensCss, "utf8");
  const targetColors = parseCssVars(targetCss, "color");

  const onlyInFigma: string[] = [];
  const onlyInTarget: string[] = [];
  const valueDrift: string[] = [];

  for (const [k, v] of Object.entries(figma.colors)) {
    if (!(k in targetColors)) onlyInFigma.push(k);
    else if (targetColors[k]!.toLowerCase() !== v.toLowerCase()) valueDrift.push(`${k}: figma=${v} target=${targetColors[k]}`);
  }
  for (const k of Object.keys(targetColors)) {
    if (!(k in figma.colors)) onlyInTarget.push(k);
  }

  console.log(`drift report (colors):`);
  console.log(`  in Figma, missing in target: ${onlyInFigma.length}`);
  for (const k of onlyInFigma) console.log(`    + ${k}`);
  console.log(`  in target, missing in Figma: ${onlyInTarget.length}`);
  for (const k of onlyInTarget) console.log(`    - ${k}`);
  console.log(`  value drift: ${valueDrift.length}`);
  for (const line of valueDrift) console.log(`    ! ${line}`);
  console.log(`(spacing, radii, shadows, typography drift not yet reported — extend this script as needed)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
