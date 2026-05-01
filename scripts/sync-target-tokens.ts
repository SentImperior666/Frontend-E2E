/**
 * Mirror dist/tokens/{tokens.css,tailwind.preset.js} into the target repo at
 * $TARGET_REPO_PATH/$TARGET_TOKENS_PATH/. Idempotent. Refuses if the target
 * repo has uncommitted changes in the destination directory (so we don't
 * silently stomp local design work).
 */
import path from "node:path";
import { copyFile, readFile } from "node:fs/promises";
import { execSync } from "node:child_process";
import { DIST_TOKENS } from "./_lib/paths.js";
import { ensureDir, fileExists } from "./_lib/fs.js";
import { targetRepoPath, targetTokensPath } from "./_lib/paths.js";

function gitStatus(repoRoot: string, relativePath: string): string {
  try {
    return execSync(`git -C "${repoRoot}" status --porcelain "${relativePath}"`, { encoding: "utf8" });
  } catch (err) {
    console.warn(`git status check failed; proceeding without dirty-state guard. (${(err as Error).message})`);
    return "";
  }
}

async function main(): Promise<void> {
  const target = targetRepoPath();
  const tokensRel = targetTokensPath();
  const destDir = path.join(target, tokensRel);
  await ensureDir(destDir);

  const dirty = gitStatus(target, tokensRel);
  if (dirty.trim()) {
    throw new Error(
      `Refusing to sync: target repo has uncommitted changes in ${tokensRel}:\n${dirty}\nCommit or stash first.`,
    );
  }

  const srcCss = path.join(DIST_TOKENS, "tokens.css");
  const srcPreset = path.join(DIST_TOKENS, "tailwind.preset.js");
  if (!(await fileExists(srcCss)) || !(await fileExists(srcPreset))) {
    throw new Error(`Token artifacts missing under ${DIST_TOKENS}; run \`pnpm tokens:sync\` first.`);
  }

  await copyFile(srcCss, path.join(destDir, "tokens.css"));
  await copyFile(srcPreset, path.join(destDir, "tailwind.preset.js"));

  // Also copy the JSON snapshot — handy for the target's own tooling, e.g. a
  // Vite plugin that reads tokens at build time.
  const srcJson = path.join(DIST_TOKENS, "tokens.json");
  if (await fileExists(srcJson)) {
    await copyFile(srcJson, path.join(destDir, "tokens.json"));
  }

  // Confirm the target's tailwind config picks up the preset; surface a hint
  // if it doesn't reference the path.
  const targetTwConfig = path.join(target, "tailwind.config.js");
  const targetTwConfigTs = path.join(target, "tailwind.config.ts");
  for (const cfg of [targetTwConfig, targetTwConfigTs]) {
    if (await fileExists(cfg)) {
      const text = await readFile(cfg, "utf8");
      if (!text.includes(tokensRel)) {
        console.warn(
          `sync-target-tokens: ${path.basename(cfg)} doesn't reference "${tokensRel}/tailwind.preset" — consider adding it to \`presets\`.`,
        );
      }
    }
  }

  console.log(`sync-target-tokens: tokens.css + tailwind.preset.js → ${destDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
