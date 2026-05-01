import path from "node:path";
import { fileURLToPath } from "node:url";

export const REPO_ROOT = path.resolve(fileURLToPath(import.meta.url), "..", "..", "..");

export const STITCH_DIR = path.join(REPO_ROOT, ".stitch");
export const HARNESS_DIR = path.join(REPO_ROOT, ".harness");
export const LP_BASELINE = path.join(REPO_ROOT, ".lostpixel", "baseline");
export const LP_CURRENT = path.join(REPO_ROOT, ".lostpixel", "current");
export const LP_DIFF = path.join(REPO_ROOT, ".lostpixel", "diff");
export const PUBLIC_ASSETS = path.join(REPO_ROOT, "public", "assets", "stitch");
export const DIST_TOKENS = path.join(REPO_ROOT, "dist", "tokens");

export function screenDir(storyId: string): string {
  return path.join(STITCH_DIR, "screens", storyId);
}

export function baselineDir(storyId: string): string {
  return path.join(LP_BASELINE, storyId);
}

export function publicAssetsDir(storyId: string): string {
  return path.join(PUBLIC_ASSETS, storyId);
}

export const VIEWPORTS = [375, 768, 1280, 1920] as const;
export type Viewport = (typeof VIEWPORTS)[number];

export function targetRepoPath(): string {
  const p = process.env.TARGET_REPO_PATH;
  if (!p) throw new Error("TARGET_REPO_PATH is not set; copy .env.example to .env and set it.");
  return p;
}

export function targetTokensPath(): string {
  return process.env.TARGET_TOKENS_PATH ?? "src/lib/tokens";
}

export function targetParityPath(): string {
  return process.env.TARGET_PARITY_PATH ?? "tests/parity";
}

export function targetAssetsPath(): string {
  return process.env.TARGET_ASSETS_PATH ?? "static/assets/stitch";
}

export function targetDefaultComponentPath(): string {
  return process.env.TARGET_DEFAULT_COMPONENT_PATH ?? "src/lib/components";
}

export function targetGraphTtlMs(): number {
  const m = Number(process.env.TARGET_GRAPH_TTL_MINUTES ?? 60);
  return m * 60 * 1000;
}
