/**
 * Alternate baseline source: when starting from an existing Figma frame
 * (designer-led work) rather than a Stitch generation, this script renders the
 * frame at four widths into .lostpixel/baseline/<storyId>/. The inner loop
 * doesn't care which produced the baseline.
 *
 * Implementer note: Figma's image export endpoint returns a single PNG per
 * node; "viewport widths" are simulated by re-requesting at varying scales OR
 * (preferred) by exporting once at high resolution and downsizing locally.
 */
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { parseArgs, requireArg } from "./_lib/args.js";
import { ensureDir } from "./_lib/fs.js";
import { baselineDir, VIEWPORTS } from "./_lib/paths.js";
import { lookup } from "./figma-mapping.js";

async function fetchFigmaImage(fileKey: string, nodeId: string, scale: number): Promise<Buffer> {
  const token = process.env.FIGMA_API_TOKEN;
  if (!token) throw new Error("FIGMA_API_TOKEN missing.");
  const params = new URLSearchParams({ ids: nodeId, format: "png", scale: String(scale) });
  const res = await fetch(`https://api.figma.com/v1/images/${fileKey}?${params}`, {
    headers: { "X-Figma-Token": token },
  });
  if (!res.ok) throw new Error(`Figma image API failed: ${res.status} ${res.statusText}`);
  const json = (await res.json()) as { images: Record<string, string> };
  const url = json.images[nodeId];
  if (!url) throw new Error(`Figma did not return an image for node ${nodeId}`);
  const img = await fetch(url);
  if (!img.ok) throw new Error(`Figma image download failed: ${img.status}`);
  return Buffer.from(await img.arrayBuffer());
}

async function main(): Promise<void> {
  const args = parseArgs();
  const storyId = requireArg(args, "story");
  const mapping = lookup(storyId);
  if (!mapping) {
    throw new Error(
      `No figma-mapping entry for story=${storyId}. Either map it manually in scripts/figma-mapping.ts or use Stitch as the baseline source.`,
    );
  }

  const outDir = baselineDir(storyId);
  await ensureDir(outDir);
  for (const w of VIEWPORTS) {
    // Figma doesn't honor "viewport width" directly; we approximate by varying
    // the export scale. For pixel-accurate per-viewport renders, prefer Stitch.
    const scale = Math.max(1, Math.round(w / 720));
    const png = await fetchFigmaImage(mapping.fileKey, mapping.nodeId, scale);
    await writeFile(path.join(outDir, `${w}.png`), png);
  }
  console.log(`figma-export-baselines: ${VIEWPORTS.length} baselines → ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
