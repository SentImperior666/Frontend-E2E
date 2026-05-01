/**
 * Idempotent: creates the Stitch project on first run, loads the existing one
 * thereafter. Persists the project id to .stitch/projects.json.
 */
import path from "node:path";
import { STITCH_DIR } from "./_lib/paths.js";
import { ensureDir, readJson, writeJsonAtomic } from "./_lib/fs.js";
import { getStitchClient } from "./_lib/stitch.js";

const PROJECTS_FILE = path.join(STITCH_DIR, "projects.json");

interface ProjectsRecord {
  [purpose: string]: { id: string; createdAt: string };
}

async function main(): Promise<void> {
  await ensureDir(STITCH_DIR);
  const purpose = process.env.STITCH_PROJECT_PURPOSE ?? "rpg-site";
  const existing = (await readJson<ProjectsRecord>(PROJECTS_FILE)) ?? {};
  const envId = process.env.STITCH_PROJECT_ID;
  const recorded = existing[purpose];

  const client = await getStitchClient();

  if (envId) {
    await client.project(envId);
    existing[purpose] = { id: envId, createdAt: recorded?.createdAt ?? new Date().toISOString() };
    await writeJsonAtomic(PROJECTS_FILE, existing);
    console.log(`stitch-init: using STITCH_PROJECT_ID=${envId} for purpose=${purpose}`);
    return;
  }

  if (recorded?.id) {
    await client.project(recorded.id);
    console.log(`stitch-init: existing project ${recorded.id} for purpose=${purpose}`);
    return;
  }

  const project = await client.projects.create({ name: `rpg-site-${purpose}`, purpose });
  existing[purpose] = { id: project.id, createdAt: new Date().toISOString() };
  await writeJsonAtomic(PROJECTS_FILE, existing);
  console.log(`stitch-init: created project ${project.id} for purpose=${purpose}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
