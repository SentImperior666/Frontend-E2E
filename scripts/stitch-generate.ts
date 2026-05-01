/**
 * Generate a Stitch screen from a prompt + device hint. Caches HTML, screenshot,
 * and metadata under .stitch/screens/<storyId>/. Downloads CDN-hosted image
 * assets locally via stitch-download-assets.ts. Renders per-viewport baselines
 * via stitch-render-baseline.ts.
 *
 * Usage:
 *   pnpm stitch:generate -- --story <storyId> --device DESKTOP --prompt-file <path>
 *   pnpm stitch:generate -- --story <storyId> --device DESKTOP --prompt "<inline>"
 */
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { parseArgs, requireArg, optionalArg } from "./_lib/args.js";
import { ensureDir, appendJsonl, writeJsonAtomic, readJson } from "./_lib/fs.js";
import { STITCH_DIR, screenDir } from "./_lib/paths.js";
import { getStitchClient, asUrl, type DeviceType } from "./_lib/stitch.js";

async function downloadToFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await ensureDir(path.dirname(dest));
  await writeFile(dest, buf);
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
  const device = (optionalArg(args, "device", "DESKTOP") ?? "DESKTOP") as DeviceType;
  const promptFile = optionalArg(args, "prompt-file");
  const promptInline = optionalArg(args, "prompt");

  const prompt = promptFile ? await readFile(promptFile, "utf8") : promptInline;
  if (!prompt) throw new Error("Provide --prompt-file <path> or --prompt \"<inline>\".");

  const projectsRecord = (await readJson<Record<string, { id: string }>>(path.join(STITCH_DIR, "projects.json"))) ?? {};
  const purpose = process.env.STITCH_PROJECT_PURPOSE ?? "rpg-site";
  const projectId = process.env.STITCH_PROJECT_ID ?? projectsRecord[purpose]?.id;
  if (!projectId) throw new Error("No Stitch project initialized. Run `pnpm stitch:init` first.");

  const client = await getStitchClient();
  const project = await client.project(projectId);

  console.log(`stitch-generate: generating screen for story=${storyId} device=${device}...`);
  const screen = await project.generate(prompt, device);

  const dir = screenDir(storyId);
  await ensureDir(dir);
  await writeFile(path.join(dir, "prompt.txt"), prompt, "utf8");
  await writeJsonAtomic(path.join(dir, "screen.json"), { id: screen.id, device, generatedAt: new Date().toISOString() });

  const htmlUrl = asUrl(await screen.getHtml());
  const imgUrl = asUrl(await screen.getImage());

  await ensureDir(path.join(dir, "html"));
  await downloadToFile(htmlUrl, path.join(dir, "html", "index.html"));
  await downloadToFile(imgUrl, path.join(dir, "screenshot.png"));

  await appendJsonl(path.join(dir, "edit-history.jsonl"), {
    op: "generate",
    at: new Date().toISOString(),
    screenId: screen.id,
    device,
    promptHash: hashPrompt(prompt),
  });

  console.log(`stitch-generate: cached HTML + screenshot at ${dir}`);

  // Localize CDN assets, then render per-viewport baselines.
  await runScript("stitch-download-assets.ts", ["--story", storyId]);
  await runScript("stitch-render-baseline.ts", ["--story", storyId, "--device", device]);
}

function hashPrompt(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
