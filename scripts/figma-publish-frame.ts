/**
 * Figma write orchestration helper. The actual frame-creation work happens in
 * the `/figma-publish` slash command body using the figma MCP plugin's
 * `use_figma` tool — Figma's REST API does NOT support frame creation, so the
 * write must run in a Claude Code session.
 *
 * This script has three subcommands:
 *
 *   prepare <storyId>
 *     Validates preconditions (env, screenshot exists, latest critic verdict
 *     is SHIP) and writes a manifest JSON to .harness/figma-publish-input.json
 *     for the slash command to consume.
 *
 *   update-mapping <storyId> <fileKey> <nodeId>
 *     Idempotently writes the mapping into scripts/figma-mapping.ts. Called by
 *     the slash command after a successful MCP write.
 *
 *   show <storyId>
 *     Prints the mapping (if any) and the latest verdict line for inspection.
 */
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { positional, requireArg, parseArgs, optionalArg } from "./_lib/args.js";
import { ensureDir, fileExists, writeJsonAtomic } from "./_lib/fs.js";
import { HARNESS_DIR, screenDir } from "./_lib/paths.js";
import { MAPPING, type FigmaMappingEntry } from "./figma-mapping.js";

interface PublishManifest {
  storyId: string;
  fileKey: string;
  screenshotPath: string;
  promptText: string;
  editHistoryTail: string[];
  existingNodeId: string | null;
  frameName: string;
  preferredScreenshotSource: "converged" | "stitch";
}

async function readLatestVerdict(storyId: string): Promise<string | null> {
  const editHistoryPath = path.join(screenDir(storyId), "edit-history.jsonl");
  if (!(await fileExists(editHistoryPath))) return null;
  const text = await readFile(editHistoryPath, "utf8");
  const lines = text.trim().split("\n").filter(Boolean);
  for (const line of lines.slice().reverse()) {
    if (!line.includes('"verdict"')) continue;
    try {
      const obj = JSON.parse(line) as { verdict?: string };
      if (obj.verdict) return obj.verdict;
    } catch {
      // not a verdict line
    }
  }
  return null;
}

async function pickScreenshot(storyId: string): Promise<{ path: string; source: "converged" | "stitch" }> {
  // Prefer converged React render at 1280; fall back to Stitch screenshot.
  const converged = path.resolve("./.lostpixel/current", `${storyId}--1280.png`);
  if (await fileExists(converged)) return { path: converged, source: "converged" };
  const stitch = path.join(screenDir(storyId), "screenshot.png");
  if (await fileExists(stitch)) return { path: stitch, source: "stitch" };
  throw new Error(`No screenshot found for story=${storyId}. Looked at ${converged} and ${stitch}.`);
}

async function prepare(storyId: string): Promise<void> {
  const fileKey = process.env.FIGMA_FILE_KEY;
  const writeToken = process.env.FIGMA_WRITE_TOKEN;
  if (!fileKey || !writeToken) {
    throw new Error("FIGMA_FILE_KEY and FIGMA_WRITE_TOKEN must be set for /figma-publish.");
  }

  const verdict = await readLatestVerdict(storyId);
  if (verdict !== "SHIP") {
    throw new Error(
      `Latest critic verdict for ${storyId} is ${verdict ?? "missing"}. Only SHIP screens publish. ` +
        `Re-comment with /design-feedback SHIP story:${storyId} override if a human is signing off.`,
    );
  }

  const screenshot = await pickScreenshot(storyId);
  const promptText = (await readFile(path.join(screenDir(storyId), "prompt.txt"), "utf8").catch(() => "(no prompt cached)")).trim();
  const editHistory = await readFile(path.join(screenDir(storyId), "edit-history.jsonl"), "utf8").catch(() => "");
  const tail = editHistory.trim().split("\n").filter(Boolean).slice(-20);

  const existing = MAPPING[storyId];
  const manifest: PublishManifest = {
    storyId,
    fileKey,
    screenshotPath: screenshot.path,
    promptText,
    editHistoryTail: tail,
    existingNodeId: existing?.nodeId ?? null,
    frameName: `Stitch Export — ${storyId}`,
    preferredScreenshotSource: screenshot.source,
  };

  await ensureDir(HARNESS_DIR);
  const manifestPath = path.join(HARNESS_DIR, "figma-publish-input.json");
  await writeJsonAtomic(manifestPath, manifest);

  console.log(`figma-publish prepare: manifest written to ${manifestPath}`);
  console.log(`Next: the /figma-publish slash command consumes this manifest and calls the figma MCP write tool.`);
}

async function updateMapping(storyId: string, fileKey: string, nodeId: string): Promise<void> {
  const mappingPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "figma-mapping.ts");
  const file = await readFile(mappingPath, "utf8");
  const entry: FigmaMappingEntry = {
    storyId,
    fileKey,
    nodeId,
    publishedAt: new Date().toISOString(),
  };
  const merged: Record<string, FigmaMappingEntry> = { ...MAPPING, [storyId]: entry };

  // Replace just the MAPPING object literal. Match from `export const MAPPING:` to the
  // closing `};` that ends the object.
  const re = /export const MAPPING:[^=]*=\s*\{[\s\S]*?\};/;
  const replacement = `export const MAPPING: Readonly<Record<string, FigmaMappingEntry>> = ${JSON.stringify(merged, null, 2)};`;
  if (!re.test(file)) {
    throw new Error(`Could not locate MAPPING declaration in ${mappingPath}`);
  }
  await writeFile(mappingPath, file.replace(re, replacement), "utf8");
  console.log(`figma-publish update-mapping: ${storyId} → ${nodeId} in ${fileKey}`);
}

async function show(storyId: string): Promise<void> {
  const verdict = await readLatestVerdict(storyId);
  const mapping = MAPPING[storyId];
  console.log(JSON.stringify({ storyId, latestVerdict: verdict, mapping: mapping ?? null }, null, 2));
}

async function main(): Promise<void> {
  const args = parseArgs();
  const sub = positional(args, 0);
  if (!sub) {
    throw new Error("Usage: figma-publish-frame.ts <prepare|update-mapping|show> ...");
  }
  if (sub === "prepare") {
    const storyId = positional(args, 1) ?? requireArg(args, "story");
    await prepare(storyId);
  } else if (sub === "update-mapping") {
    const storyId = positional(args, 1) ?? requireArg(args, "story");
    const fileKey = positional(args, 2) ?? requireArg(args, "file-key");
    const nodeId = positional(args, 3) ?? requireArg(args, "node-id");
    await updateMapping(storyId, fileKey, nodeId);
  } else if (sub === "show") {
    const storyId = positional(args, 1) ?? requireArg(args, "story");
    await show(storyId);
  } else {
    throw new Error(`Unknown subcommand: ${sub}`);
  }
  // Avoid "unused" warning on optionalArg.
  void optionalArg;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
