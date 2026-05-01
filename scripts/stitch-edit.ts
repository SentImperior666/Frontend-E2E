/**
 * Apply a single-aspect edit to an existing Stitch screen. Replaces local
 * HTML / screenshot / baselines and appends a record to edit-history.jsonl.
 *
 * Usage:
 *   pnpm stitch:edit -- --story <storyId> --feedback "<editPrompt>" --aspect color
 *
 * `--aspect` accepts the operator-friendly aliases (color, layout, fonts,
 * images, text). The wrapper translates to the SDK's UPPERCASE_SNAKE values.
 */
import path from "node:path";
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import { parseArgs, requireArg } from "./_lib/args.js";
import { appendJsonl, readJson, ensureDir } from "./_lib/fs.js";
import { STITCH_DIR, screenDir } from "./_lib/paths.js";
import { getStitchClient, toAspect, type DeviceType, ASPECT_ALIASES } from "./_lib/stitch.js";

async function downloadToFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  await ensureDir(path.dirname(dest));
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

function runScript(scriptName: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn("tsx", [`scripts/${scriptName}`, ...args], { stdio: "inherit", shell: process.platform === "win32" });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${scriptName} exited ${code}`))));
  });
}

async function main(): Promise<void> {
  const args = parseArgs();
  const storyId = requireArg(args, "story");
  const feedback = requireArg(args, "feedback");
  const aspectAlias = requireArg(args, "aspect");
  const aspect = toAspect(aspectAlias); // throws on unknown alias.

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

  console.log(`stitch-edit: aspect=${aspect} (alias=${aspectAlias}), story=${storyId}, applying edit...`);
  const edited = await screen.edit(feedback, screenJson.device);

  const htmlUrl = await edited.getHtml();
  const imgUrl = await edited.getImage();

  await downloadToFile(htmlUrl, path.join(dir, "html", "index.html"));
  await downloadToFile(imgUrl, path.join(dir, "screenshot.png"));

  await appendJsonl(path.join(dir, "edit-history.jsonl"), {
    op: "edit",
    at: new Date().toISOString(),
    aspect,
    aspectAlias,
    feedback,
    newScreenId: edited.id,
  });

  await runScript("stitch-download-assets.ts", ["--story", storyId]);
  await runScript("stitch-render-baseline.ts", ["--story", storyId, "--device", screenJson.device ?? "DESKTOP"]);

  console.log(`stitch-edit: edit applied; baselines refreshed.`);
}

// Surface the aliases on import side for help-style callers.
void ASPECT_ALIASES;

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
