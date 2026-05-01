/**
 * Parses Stitch-returned HTML, finds <img src> and CSS url(...) references
 * pointing at remote URLs, downloads each into public/assets/stitch/<storyId>/,
 * and rewrites the HTML to use local relative paths.
 *
 * Run by stitch-generate.ts and stitch-edit.ts.
 */
import path from "node:path";
import { readFile, writeFile } from "node:fs/promises";
import { parseArgs, requireArg } from "./_lib/args.js";
import { ensureDir } from "./_lib/fs.js";
import { publicAssetsDir, screenDir } from "./_lib/paths.js";

const REMOTE_PROTO = /^(https?:)?\/\//i;

async function downloadToFile(url: string, dest: string): Promise<void> {
  const res = await fetch(url);
  if (!res.ok) {
    console.warn(`asset fetch failed (${res.status}): ${url}`);
    return;
  }
  await ensureDir(path.dirname(dest));
  await writeFile(dest, Buffer.from(await res.arrayBuffer()));
}

function localFilenameForUrl(url: string, idx: number): string {
  try {
    const u = new URL(url);
    const base = path.basename(u.pathname);
    if (base && base.includes(".")) return base;
  } catch {
    // fall through
  }
  return `asset-${idx}.bin`;
}

async function main(): Promise<void> {
  const args = parseArgs();
  const storyId = requireArg(args, "story");
  const dir = screenDir(storyId);
  const htmlPath = path.join(dir, "html", "index.html");
  const localDir = publicAssetsDir(storyId);

  let html = await readFile(htmlPath, "utf8");
  await ensureDir(localDir);

  // Collect all remote URLs referenced as src= or url(...).
  const urls = new Set<string>();
  const srcRe = /src=["']([^"']+)["']/g;
  const cssUrlRe = /url\((['"]?)([^)'"]+)\1\)/g;
  let m: RegExpExecArray | null;
  while ((m = srcRe.exec(html))) {
    if (REMOTE_PROTO.test(m[1])) urls.add(m[1]);
  }
  while ((m = cssUrlRe.exec(html))) {
    if (REMOTE_PROTO.test(m[2])) urls.add(m[2]);
  }

  let idx = 0;
  for (const url of urls) {
    const filename = localFilenameForUrl(url, idx++);
    const dest = path.join(localDir, filename);
    await downloadToFile(url, dest);
    // Rewrite ALL occurrences. The relative path FROM the rendered HTML to the asset:
    //   .stitch/screens/<storyId>/html/index.html  →  public/assets/stitch/<storyId>/<filename>
    // The headless browser opens the HTML via file:// — we use an absolute-from-public
    // path that we'll also serve via Storybook static + Next.js static.
    const relFromHtml = path.relative(path.join(dir, "html"), dest).replace(/\\/g, "/");
    html = html.split(url).join(relFromHtml);
  }

  await writeFile(htmlPath, html, "utf8");
  console.log(`stitch-download-assets: localized ${urls.size} asset(s) for ${storyId}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
