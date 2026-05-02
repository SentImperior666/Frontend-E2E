/**
 * Walk $TARGET_REPO_PATH for *.svelte files. Parse imports / props. Resolve
 * aliases from tsconfig + svelte.config + vite.config. Build the import graph.
 * Emit .harness/target-graph.json atomically.
 *
 * Performance budget: under 5s on a 500-file target. Skip parsing files whose
 * mtime hasn't changed since the last scan.
 */
import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { HARNESS_DIR } from "./_lib/paths.js";
import { ensureDir, readJson, writeJsonAtomic } from "./_lib/fs.js";
import { targetRepoPath } from "./_lib/paths.js";

interface FileEntry {
  name: string;
  kind: "route" | "component";
  props: string[];
  imports: { from: string; names: string[]; resolvedPath: string | null }[];
  importedBy: string[];
  mtimeMs: number;
}

interface Graph {
  scannedAt: string;
  rootPath: string;
  svelteVersion: number | null;
  aliases: Record<string, string>;
  files: Record<string, FileEntry>;
}

const IGNORE = new Set(["node_modules", ".svelte-kit", "build", "dist", ".git", ".next", ".turbo"]);

async function lazyFastGlob(): Promise<typeof import("fast-glob")> {
  try {
    const mod = await import("fast-glob");
    return mod.default;
  } catch (err) {
    throw new Error(`fast-glob not installed. Run \`pnpm install\`. Underlying: ${(err as Error).message}`);
  }
}

async function detectSvelteVersion(target: string): Promise<number | null> {
  const pkgJson = await readJson<{ dependencies?: Record<string, string>; devDependencies?: Record<string, string> }>(
    path.join(target, "package.json"),
  );
  if (!pkgJson) return null;
  const v = pkgJson.dependencies?.svelte ?? pkgJson.devDependencies?.svelte;
  if (!v) return null;
  const m = /(\d+)/.exec(v);
  return m ? Number(m[1]) : null;
}

async function detectAliases(target: string): Promise<Record<string, string>> {
  const aliases: Record<string, string> = {};

  const ts = await readJson<{ compilerOptions?: { paths?: Record<string, string[]> } }>(
    path.join(target, "tsconfig.json"),
  );
  if (ts?.compilerOptions?.paths) {
    for (const [key, vals] of Object.entries(ts.compilerOptions.paths)) {
      const stripKey = key.replace(/\/\*$/, "");
      const v = vals[0];
      if (v) aliases[stripKey] = v.replace(/\/\*$/, "");
    }
  }

  for (const cfgName of ["svelte.config.js", "svelte.config.mjs", "svelte.config.cjs"]) {
    try {
      const text = await readFile(path.join(target, cfgName), "utf8");
      const aliasBlock = /alias\s*:\s*\{([\s\S]*?)\}/.exec(text);
      if (aliasBlock) {
        for (const m of aliasBlock[1]!.matchAll(/['"]?([\w$@./-]+)['"]?\s*:\s*['"]([^'"]+)['"]/g)) {
          aliases[m[1]!] = m[2]!;
        }
      }
    } catch {
      // missing config is fine
    }
  }

  for (const cfgName of ["vite.config.ts", "vite.config.js", "vite.config.mjs"]) {
    try {
      const text = await readFile(path.join(target, cfgName), "utf8");
      const m = /resolve\s*:\s*\{[\s\S]*?alias\s*:\s*\{([\s\S]*?)\}/.exec(text);
      if (m) {
        for (const am of m[1]!.matchAll(/['"]?([\w$@./-]+)['"]?\s*:\s*['"]([^'"]+)['"]/g)) {
          aliases[am[1]!] = am[2]!;
        }
      }
    } catch {
      // missing config is fine
    }
  }

  // SvelteKit defaults if not overridden.
  if (!aliases["$lib"]) aliases["$lib"] = "src/lib";
  return aliases;
}

function resolveImport(spec: string, fromFileAbs: string, target: string, aliases: Record<string, string>): string | null {
  // Sort aliases longest-first to avoid `$` matching before `$lib`.
  const sortedAliases = Object.entries(aliases).sort((a, b) => b[0].length - a[0].length);
  for (const [aliasKey, aliasVal] of sortedAliases) {
    if (spec === aliasKey || spec.startsWith(aliasKey + "/")) {
      const tail = spec.slice(aliasKey.length).replace(/^\//, "");
      const abs = path.resolve(target, aliasVal, tail);
      return path.relative(target, abs).replace(/\\/g, "/");
    }
  }
  if (spec.startsWith(".")) {
    const abs = path.resolve(path.dirname(fromFileAbs), spec);
    return path.relative(target, abs).replace(/\\/g, "/");
  }
  return null;
}

function extractScript(source: string): string {
  // Take the first <script>…</script> block (with or without lang=ts).
  const m = /<script\b[^>]*>([\s\S]*?)<\/script>/i.exec(source);
  return m ? m[1]! : "";
}

function extractImports(scriptBody: string): { from: string; names: string[] }[] {
  const out: { from: string; names: string[] }[] = [];
  const re = /import\s+(?:([\w$]+)\s*,?\s*)?(?:\{([^}]*)\})?\s*from\s*['"]([^'"]+)['"]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(scriptBody))) {
    const names: string[] = [];
    if (m[1]) names.push("default");
    if (m[2]) names.push(...m[2]!.split(",").map((s) => s.trim().split(/\s+as\s+/)[0]!).filter(Boolean));
    out.push({ from: m[3]!, names });
  }
  return out;
}

function extractProps(scriptBody: string, svelteVersion: number | null): string[] {
  const props: string[] = [];
  // Svelte 4: `export let foo` (also `export const foo`).
  const re4 = /export\s+(?:let|const|var)\s+([\w$]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re4.exec(scriptBody))) props.push(m[1]!);
  // Svelte 5: `let { a, b, c = ... } = $props()`.
  if (svelteVersion === 5 || true) {
    const re5 = /let\s*\{([^}]+)\}\s*=\s*\$props\s*\(/g;
    while ((m = re5.exec(scriptBody))) {
      const inner = m[1]!.split(",").map((s) => s.trim().split(/[:=]/)[0]!.trim()).filter(Boolean);
      props.push(...inner);
    }
  }
  return [...new Set(props)];
}

function classifyKind(rel: string): "route" | "component" {
  return rel.split("/").includes("routes") ? "route" : "component";
}

async function main(): Promise<void> {
  const target = targetRepoPath();
  await ensureDir(HARNESS_DIR);
  const graphPath = path.join(HARNESS_DIR, "target-graph.json");
  const previous = await readJson<Graph>(graphPath);

  const fg = await lazyFastGlob();
  const svelteVersion = await detectSvelteVersion(target);
  const aliases = await detectAliases(target);

  const ignorePatterns = [...IGNORE].map((d) => `**/${d}/**`);
  const matches = await fg("**/*.svelte", { cwd: target, ignore: ignorePatterns, absolute: false });

  const files: Record<string, FileEntry> = {};
  for (const rel of matches) {
    const abs = path.join(target, rel);
    const info = await stat(abs);
    const cached = previous?.files?.[rel];
    if (cached && cached.mtimeMs === info.mtimeMs) {
      // mtime unchanged — reuse parse but re-resolve imports against current aliases (cheap).
      files[rel] = { ...cached, importedBy: [] };
      continue;
    }
    const source = await readFile(abs, "utf8");
    const scriptBody = extractScript(source);
    const rawImports = extractImports(scriptBody);
    const props = extractProps(scriptBody, svelteVersion);
    const imports = rawImports.map((imp) => ({
      ...imp,
      resolvedPath: resolveImport(imp.from, abs, target, aliases),
    }));
    const baseName = path.basename(rel, ".svelte");
    files[rel] = {
      name: baseName,
      kind: classifyKind(rel),
      props,
      imports,
      importedBy: [],
      mtimeMs: info.mtimeMs,
    };
  }

  // Invert the graph — populate importedBy.
  for (const [rel, entry] of Object.entries(files)) {
    for (const imp of entry.imports) {
      if (!imp.resolvedPath) continue;
      const resolvedSvelte = imp.resolvedPath.endsWith(".svelte") ? imp.resolvedPath : null;
      if (!resolvedSvelte) continue;
      const importedEntry = files[resolvedSvelte];
      if (importedEntry) importedEntry.importedBy.push(rel);
    }
  }

  const graph: Graph = {
    scannedAt: new Date().toISOString(),
    rootPath: target,
    svelteVersion,
    aliases,
    files,
  };
  await writeJsonAtomic(graphPath, graph);

  // One-line summary.
  const routes = Object.values(files).filter((f) => f.kind === "route").length;
  const components = Object.values(files).filter((f) => f.kind === "component").length;
  const topImported = Object.entries(files)
    .map(([k, v]) => [k, v.importedBy.length] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([k]) => k);
  console.log(
    `target-graph @ ${target}: ${routes} routes, ${components} components, svelte v${svelteVersion ?? "?"}, aliases: ${JSON.stringify(aliases)}, top imports: ${topImported.join(", ")}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
