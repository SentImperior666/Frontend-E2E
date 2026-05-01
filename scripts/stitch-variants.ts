/**
 * Wrapper around screen.variants(prompt, options). Stores each variant under
 * .stitch/screens/<storyId>/variants/<idx>/ and emits an HTML gallery to
 * .stitch/galleries/<storyId>-<timestamp>.html.
 */
import path from "node:path";
import { writeFile } from "node:fs/promises";
import { parseArgs, requireArg, optionalArg } from "./_lib/args.js";
import { ensureDir, appendJsonl, readJson } from "./_lib/fs.js";
import { STITCH_DIR, screenDir } from "./_lib/paths.js";
import { getStitchClient, toAspects, type CreativeRange, type DeviceType } from "./_lib/stitch.js";

const VALID_RANGES: CreativeRange[] = ["REFINE", "EXPLORE", "REIMAGINE"];

async function downloadToFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  await ensureDir(path.dirname(dest));
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

async function main(): Promise<void> {
  const args = parseArgs();
  const storyId = requireArg(args, "story");
  const range = (optionalArg(args, "range", "EXPLORE") ?? "EXPLORE") as CreativeRange;
  if (!VALID_RANGES.includes(range)) throw new Error(`--range must be one of ${VALID_RANGES.join("|")}`);
  const aspects = toAspects(optionalArg(args, "aspects")); // operator passes lowercase aliases
  const variantCount = Math.max(1, Math.min(5, Number(optionalArg(args, "count", "3"))));
  const promptOverride = optionalArg(args, "prompt");

  const dir = screenDir(storyId);
  const screenJson = await readJson<{ id: string; device: DeviceType }>(path.join(dir, "screen.json"));
  if (!screenJson?.id) throw new Error(`No screen.json for story=${storyId}; run /design-new first.`);

  const projectsRecord = (await readJson<Record<string, { id: string }>>(path.join(STITCH_DIR, "projects.json"))) ?? {};
  const purpose = process.env.STITCH_PROJECT_PURPOSE ?? "rpg-site";
  const projectId = process.env.STITCH_PROJECT_ID ?? projectsRecord[purpose]?.id;
  if (!projectId) throw new Error("No Stitch project; run `pnpm stitch:init` first.");

  const client = await getStitchClient();
  const project = client.project(projectId);
  const screen = await project.getScreen(screenJson.id);

  const prompt = promptOverride ?? "";
  const variants = await screen.variants(
    prompt,
    { creativeRange: range, aspects, variantCount },
    screenJson.device,
  );

  const variantsDir = path.join(dir, "variants");
  await ensureDir(variantsDir);
  const tiles: { idx: number; screenshotRel: string; htmlRel: string }[] = [];
  for (let i = 0; i < variants.length; i++) {
    const v = variants[i]!;
    const vDir = path.join(variantsDir, String(i));
    await ensureDir(vDir);
    const htmlUrl = await v.getHtml();
    const imgUrl = await v.getImage();
    await downloadToFile(htmlUrl, path.join(vDir, "index.html"));
    await downloadToFile(imgUrl, path.join(vDir, "screenshot.png"));
    tiles.push({
      idx: i,
      screenshotRel: path.relative(STITCH_DIR, path.join(vDir, "screenshot.png")),
      htmlRel: path.relative(STITCH_DIR, path.join(vDir, "index.html")),
    });
  }

  const ts = new Date().toISOString().replace(/[:.]/g, "-");
  const galleryPath = path.join(STITCH_DIR, "galleries", `${storyId}-${ts}.html`);
  await ensureDir(path.dirname(galleryPath));
  await writeFile(galleryPath, renderGallery(storyId, range, aspects ?? [], tiles), "utf8");

  await appendJsonl(path.join(dir, "edit-history.jsonl"), {
    op: "variants",
    at: new Date().toISOString(),
    range,
    aspects,
    variantCount,
    galleryPath,
  });

  console.log(`stitch-variants: gallery → ${galleryPath}`);
  console.log(`Pick a variant by writing { storyId: "${storyId}", pickedIndex: <0..${variants.length - 1}> } to .stitch/pending-pick.json, then run /design-loop --story ${storyId} --resume.`);
}

function renderGallery(storyId: string, range: string, aspects: string[], tiles: { idx: number; screenshotRel: string; htmlRel: string }[]): string {
  const items = tiles
    .map(
      (t) => `
        <figure>
          <img src="${t.screenshotRel.replace(/\\/g, "/")}" alt="variant ${t.idx}" />
          <figcaption>variant ${t.idx} — <a href="${t.htmlRel.replace(/\\/g, "/")}">html</a></figcaption>
        </figure>`,
    )
    .join("\n");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Variants — ${storyId}</title>
<style>body{font-family:ui-sans-serif,system-ui;background:#181410;color:#f3e9d2;margin:24px}
h1{font-family:Cinzel,serif;font-weight:600}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(360px,1fr));gap:24px}
figure{margin:0;background:#1f1814;padding:12px;border:1px solid #5b3a1e}
img{max-width:100%;display:block;border:1px solid #3b2a1c}
figcaption{margin-top:8px;font-size:14px;opacity:.85}
a{color:#d8b56b}</style></head>
<body>
<h1>${storyId} — variants (${range}${aspects.length ? `, aspects: ${aspects.join(", ")}` : ""})</h1>
<div class="grid">${items}</div></body></html>`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
