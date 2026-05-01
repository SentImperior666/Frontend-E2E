/**
 * Read .harness/target-graph.json and recommend a destination directory for a
 * new Svelte component. Scoring (per the plan):
 *   score = 0.5 * nameTokenOverlap + 0.3 * familyMatch + 0.2 * folderConcentration
 *
 * If the max score is below 0.2, return TARGET_DEFAULT_COMPONENT_PATH with
 * rationale "no clear convention; using fallback".
 *
 * Usage:
 *   tsx scripts/find-component-placement.ts --name DiceTray --family combat --similar-to-react src/components/DiceTray.tsx
 */
import path from "node:path";
import { HARNESS_DIR } from "./_lib/paths.js";
import { readJson } from "./_lib/fs.js";
import { parseArgs, requireArg, optionalArg } from "./_lib/args.js";
import { targetDefaultComponentPath } from "./_lib/paths.js";

interface FileEntry {
  name: string;
  kind: "route" | "component";
  importedBy: string[];
}

interface Graph {
  rootPath: string;
  files: Record<string, FileEntry>;
}

function tokenize(name: string): string[] {
  return name
    .replace(/\.svelte$/, "")
    .split(/(?=[A-Z])|[-_/.]/)
    .map((s) => s.toLowerCase())
    .filter(Boolean);
}

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const sa = new Set(a);
  const sb = new Set(b);
  let inter = 0;
  for (const v of sa) if (sb.has(v)) inter++;
  return inter / (sa.size + sb.size - inter);
}

interface PlacementResult {
  suggestedPath: string;
  rationale: string;
  neighbors: { path: string; score: number; reason: string }[];
}

function scorePlacement(
  newName: string,
  family: string | null,
  graph: Graph,
): PlacementResult {
  const newTokens = tokenize(newName);
  const components = Object.entries(graph.files).filter(([, v]) => v.kind === "component");

  // First-segment frequency for folder concentration.
  const firstSegCounts = new Map<string, number>();
  for (const [rel] of components) {
    const seg = rel.split("/")[0]!;
    firstSegCounts.set(seg, (firstSegCounts.get(seg) ?? 0) + 1);
  }
  const totalComps = components.length;

  const scored = components.map(([rel, entry]) => {
    const dir = path.posix.dirname(rel);
    const segments = dir.split("/");
    const otherTokens = tokenize(entry.name);
    const nameOverlap = jaccard(newTokens, otherTokens);
    const familyMatch = family && segments.some((s) => s.toLowerCase() === family.toLowerCase()) ? 1 : 0;
    const firstSeg = segments[0]!;
    const concentration = totalComps > 0 ? (firstSegCounts.get(firstSeg) ?? 0) / totalComps : 0;
    const score = 0.5 * nameOverlap + 0.3 * familyMatch + 0.2 * concentration;
    const reasonParts: string[] = [];
    if (nameOverlap > 0) reasonParts.push(`name-overlap ${nameOverlap.toFixed(2)}`);
    if (familyMatch) reasonParts.push(`family-match`);
    if (concentration > 0.1) reasonParts.push(`folder-concentration ${(concentration * 100).toFixed(0)}%`);
    return { path: rel, dir, score, reason: reasonParts.join(", ") || "weak signal" };
  });

  scored.sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));
  const top = scored[0];

  if (!top || top.score < 0.2) {
    return {
      suggestedPath: targetDefaultComponentPath(),
      rationale: "no clear convention; using fallback",
      neighbors: scored.slice(0, 5).map(({ path: p, score, reason }) => ({ path: p, score, reason })),
    };
  }

  const ext = ".svelte";
  // Match neighbor's case convention for the new file.
  const newFileName = matchCaseConvention(newName, scored.slice(0, 5).map((s) => path.basename(s.path, ext))) + ext;
  const suggestedPath = path.posix.join(top.dir, newFileName);

  return {
    suggestedPath,
    rationale: `placed near ${top.path} (score ${top.score.toFixed(2)}: ${top.reason})`,
    neighbors: scored.slice(0, 5).map(({ path: p, score, reason }) => ({ path: p, score, reason })),
  };
}

function matchCaseConvention(input: string, neighborBases: string[]): string {
  const isPascal = (s: string): boolean => /^[A-Z][A-Za-z0-9]*$/.test(s);
  const isKebab = (s: string): boolean => /^[a-z][a-z0-9-]*$/.test(s);
  const pascalCount = neighborBases.filter(isPascal).length;
  const kebabCount = neighborBases.filter(isKebab).length;

  if (kebabCount > pascalCount) {
    return input.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  }
  // Default to PascalCase.
  if (isPascal(input)) return input;
  return input
    .split(/[-_\s]/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join("");
}

async function main(): Promise<void> {
  const args = parseArgs();
  const name = requireArg(args, "name");
  const family = optionalArg(args, "family") ?? null;
  // similarToReact is reserved for future use (token overlap with the React file's imports).
  optionalArg(args, "similar-to-react");

  const graph = await readJson<Graph>(path.join(HARNESS_DIR, "target-graph.json"));
  if (!graph) {
    throw new Error(
      `No .harness/target-graph.json. Run \`pnpm scan:target\` first.`,
    );
  }

  const result = scorePlacement(name, family, graph);
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
