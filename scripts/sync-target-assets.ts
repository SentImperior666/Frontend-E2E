/**
 * Mirror public/assets/stitch/<storyId>/* into the target repo at
 * $TARGET_REPO_PATH/$TARGET_ASSETS_PATH/<storyId>/. Idempotent.
 */
import path from "node:path";
import { readdir, copyFile, stat } from "node:fs/promises";
import { execSync } from "node:child_process";
import { PUBLIC_ASSETS } from "./_lib/paths.js";
import { ensureDir, fileExists } from "./_lib/fs.js";
import { targetRepoPath, targetAssetsPath } from "./_lib/paths.js";

async function copyDir(src: string, dest: string): Promise<number> {
  if (!(await fileExists(src))) return 0;
  await ensureDir(dest);
  const entries = await readdir(src);
  let count = 0;
  for (const name of entries) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    const info = await stat(s);
    if (info.isDirectory()) {
      count += await copyDir(s, d);
    } else {
      await copyFile(s, d);
      count++;
    }
  }
  return count;
}

async function main(): Promise<void> {
  const target = targetRepoPath();
  const assetsRel = targetAssetsPath();
  const dest = path.join(target, assetsRel);
  await ensureDir(dest);

  try {
    const dirty = execSync(`git -C "${target}" status --porcelain "${assetsRel}"`, { encoding: "utf8" });
    if (dirty.trim()) {
      throw new Error(`Refusing to sync: target has uncommitted changes in ${assetsRel}:\n${dirty}`);
    }
  } catch (err) {
    if ((err as Error).message.startsWith("Refusing")) throw err;
    console.warn(`git status check failed; proceeding without guard.`);
  }

  const count = await copyDir(PUBLIC_ASSETS, dest);
  console.log(`sync-target-assets: copied ${count} file(s) → ${dest}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
