import { mkdir, writeFile, rename, readFile, stat } from "node:fs/promises";
import path from "node:path";

export async function ensureDir(p: string): Promise<void> {
  await mkdir(p, { recursive: true });
}

export async function writeJsonAtomic(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const tmp = `${filePath}.tmp-${Date.now()}`;
  await writeFile(tmp, JSON.stringify(data, null, 2) + "\n", "utf8");
  await rename(tmp, filePath);
}

export async function readJson<T = unknown>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function fileExists(p: string): Promise<boolean> {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

export async function fileAgeMs(p: string): Promise<number | null> {
  try {
    const s = await stat(p);
    return Date.now() - s.mtimeMs;
  } catch {
    return null;
  }
}

export async function appendJsonl(filePath: string, line: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  const { appendFile } = await import("node:fs/promises");
  await appendFile(filePath, JSON.stringify(line) + "\n", "utf8");
}
