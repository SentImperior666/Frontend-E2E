/**
 * Open .stitch/screens/<storyId>/html/index.html in headless Chromium at four
 * widths (375, 768, 1280, 1920) and screenshot into
 * .lostpixel/baseline/<storyId>/<viewport>.png. Disables animations.
 *
 * For MOBILE-device screens, the 375 baseline is the canonical mobile capture;
 * the 768/1280/1920 captures still run for cross-device parity but are flagged
 * as cross-device in the file's `_meta.json`.
 */
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { parseArgs, requireArg, optionalArg } from "./_lib/args.js";
import { ensureDir, writeJsonAtomic } from "./_lib/fs.js";
import { baselineDir, screenDir, VIEWPORTS } from "./_lib/paths.js";

async function main(): Promise<void> {
  const args = parseArgs();
  const storyId = requireArg(args, "story");
  const device = optionalArg(args, "device", "DESKTOP") ?? "DESKTOP";

  const htmlPath = path.join(screenDir(storyId), "html", "index.html");
  const outDir = baselineDir(storyId);
  await ensureDir(outDir);

  // Lazy-import playwright so the script can be authored before installation.
  let chromium: typeof import("playwright").chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch (err) {
    throw new Error(`playwright not installed. Run \`pnpm install\` and \`pnpm dlx playwright install chromium\`. Underlying: ${(err as Error).message}`);
  }

  const browser = await chromium.launch();
  try {
    for (const w of VIEWPORTS) {
      const ctx = await browser.newContext({
        viewport: { width: w, height: heightForWidth(w) },
        reducedMotion: "reduce",
        deviceScaleFactor: 1,
      });
      const page = await ctx.newPage();
      await page.addStyleTag({ content: `*,*::before,*::after{animation:none!important;transition:none!important}` });
      await page.goto(`file://${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });
      const png = await page.screenshot({ fullPage: true });
      await writeFile(path.join(outDir, `${w}.png`), png);
      await ctx.close();
    }
  } finally {
    await browser.close();
  }

  await writeJsonAtomic(path.join(outDir, "_meta.json"), {
    storyId,
    device,
    capturedAt: new Date().toISOString(),
    note: device === "MOBILE" ? "375 is canonical; 768/1280/1920 are cross-device captures" : "1280 is canonical",
  });

  console.log(`stitch-render-baseline: ${VIEWPORTS.length} baseline(s) → ${outDir}`);
}

function heightForWidth(w: number): number {
  if (w === 375) return 812;
  if (w === 768) return 1024;
  if (w === 1280) return 800;
  return 1080;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
