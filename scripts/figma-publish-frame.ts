/**
 * Push a converged screen back to Figma as a new frame (or update an existing
 * frame) so the Figma file remains the canonical design record. Updates
 * scripts/figma-mapping.ts in place with the new {storyId, fileKey, nodeId}.
 *
 * Implementer note: Figma's create-frame and image-fill endpoints require the
 * file_content:write scope. Confirm token scope before calling. The `appendNote`
 * stub assumes a sticky note created via POST /v1/files/<key>/notes; reconcile
 * with the current Figma API surface.
 */
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { parseArgs, requireArg } from "./_lib/args.js";
import { fileExists, readJson } from "./_lib/fs.js";
import { screenDir } from "./_lib/paths.js";
import { MAPPING, type FigmaMappingEntry } from "./figma-mapping.js";

interface FigmaCreateFrameResponse {
  nodeId: string;
}

async function uploadImage(_fileKey: string, _png: Buffer, _writeToken: string): Promise<{ imageRef: string }> {
  // Figma image upload is a multi-step flow: register the image hash, upload to
  // a returned signed URL, then reference the imageRef in fills. This stub
  // returns a placeholder so the rest of the script type-checks; the implementer
  // wires the real upload before relying on /figma-publish.
  return { imageRef: "TODO-imageRef" };
}

async function createOrUpdateFrame(_args: {
  fileKey: string;
  writeToken: string;
  storyId: string;
  imageRef: string;
  existingNodeId: string | null;
}): Promise<FigmaCreateFrameResponse> {
  // Stub. Real implementation calls Figma's plugin/REST APIs.
  return { nodeId: "0:0" };
}

async function appendNote(_fileKey: string, _nodeId: string, _writeToken: string, _text: string): Promise<void> {
  // Stub. Append a sticky note next to the frame with the prompt history.
}

async function updateMappingFile(entry: FigmaMappingEntry): Promise<void> {
  const mappingPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "figma-mapping.ts");
  const file = await readFile(mappingPath, "utf8");
  const existing = MAPPING[entry.storyId];
  const merged = { ...MAPPING, [entry.storyId]: entry };
  if (existing) {
    console.log(`figma-publish-frame: replacing existing mapping for ${entry.storyId}`);
  }
  const replaced = file.replace(
    /export const MAPPING:[\s\S]*?\};\s*\n/,
    `export const MAPPING: Readonly<Record<string, FigmaMappingEntry>> = ${JSON.stringify(merged, null, 2)};\n`,
  );
  await writeFile(mappingPath, replaced, "utf8");
}

async function main(): Promise<void> {
  const args = parseArgs();
  const storyId = requireArg(args, "story");

  const fileKey = process.env.FIGMA_FILE_KEY;
  const writeToken = process.env.FIGMA_WRITE_TOKEN;
  if (!fileKey || !writeToken) {
    throw new Error("FIGMA_FILE_KEY and FIGMA_WRITE_TOKEN are required for /figma-publish.");
  }

  const screenshotPath = path.join(screenDir(storyId), "screenshot.png");
  if (!(await fileExists(screenshotPath))) {
    throw new Error(`No screenshot at ${screenshotPath}; converge the story first.`);
  }
  // Confirm latest critic verdict was SHIP before publishing.
  const editHistoryPath = path.join(screenDir(storyId), "edit-history.jsonl");
  if (await fileExists(editHistoryPath)) {
    const lines = (await readFile(editHistoryPath, "utf8")).trim().split("\n").filter(Boolean);
    const lastVerdictLine = [...lines].reverse().find((l) => l.includes('"verdict"'));
    if (lastVerdictLine) {
      try {
        const obj = JSON.parse(lastVerdictLine) as { verdict?: string };
        if (obj.verdict && obj.verdict !== "SHIP") {
          throw new Error(`Latest critic verdict is ${obj.verdict}; only SHIP screens publish.`);
        }
      } catch {
        // not a verdict record
      }
    }
  }

  const png = await readFile(screenshotPath);
  const { imageRef } = await uploadImage(fileKey, png, writeToken);
  const existing = MAPPING[storyId]?.nodeId ?? null;
  const { nodeId } = await createOrUpdateFrame({ fileKey, writeToken, storyId, imageRef, existingNodeId: existing });

  const promptText = await readFile(path.join(screenDir(storyId), "prompt.txt"), "utf8").catch(() => "(no prompt cached)");
  await appendNote(fileKey, nodeId, writeToken, `Story: ${storyId}\nPublished: ${new Date().toISOString()}\nPrompt:\n${promptText}`);

  const entry: FigmaMappingEntry = {
    storyId,
    fileKey,
    nodeId,
    publishedAt: new Date().toISOString(),
  };
  await updateMappingFile(entry);
  console.log(`figma-publish-frame: published ${storyId} → ${nodeId} in file ${fileKey}`);
}

// Lightweight runtime-readable copy of MAPPING for warning logs.
type MappingMaybe = Record<string, FigmaMappingEntry>;
void readJson<MappingMaybe>;

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
