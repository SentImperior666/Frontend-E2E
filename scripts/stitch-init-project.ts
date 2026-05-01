/**
 * Idempotent: creates the Stitch project on first run via
 * stitch.callTool("create_project", { title }), loads the existing one
 * thereafter. Persists the project id to .stitch/projects.json.
 */
import path from "node:path";
import { STITCH_DIR } from "./_lib/paths.js";
import { ensureDir, readJson, writeJsonAtomic } from "./_lib/fs.js";
import { ensureProject, getStitchClient } from "./_lib/stitch.js";

const PROJECTS_FILE = path.join(STITCH_DIR, "projects.json");

interface ProjectsRecord {
  [purpose: string]: { id: string; createdAt: string };
}

async function main(): Promise<void> {
  await ensureDir(STITCH_DIR);
  const purpose = process.env.STITCH_PROJECT_PURPOSE ?? "rpg-site";
  const existing = (await readJson<ProjectsRecord>(PROJECTS_FILE)) ?? {};

  const { projectId, created } = await ensureProject({
    recorded: existing[purpose],
    envProjectId: process.env.STITCH_PROJECT_ID,
    purpose,
  });

  // Sanity: confirm the project is reachable.
  const client = await getStitchClient();
  client.project(projectId);

  if (created || !existing[purpose]) {
    existing[purpose] = { id: projectId, createdAt: new Date().toISOString() };
    await writeJsonAtomic(PROJECTS_FILE, existing);
  }
  console.log(`stitch-init: ${created ? "created" : "using existing"} project ${projectId} for purpose=${purpose}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
