// Thin wrapper around the Stitch SDK.
//
// Verified against https://github.com/google-labs-code/stitch-sdk:
//   - Package: `@google/stitch-sdk`
//   - Named exports: `stitch` (singleton), `Stitch`, `StitchToolClient`, `StitchError`
//   - The `stitch` singleton is pre-configured from STITCH_API_KEY (or
//     STITCH_ACCESS_TOKEN + GOOGLE_CLOUD_PROJECT). Optional STITCH_HOST.
//   - Project creation: stitch.callTool("create_project", { title }) → { projectId, ... }
//   - stitch.project(id) returns a Project (synchronous, not Promise).
//   - project.generate(prompt, deviceType?) → Promise<Screen>.
//   - project.createDesignSystem(designSystem) → Promise<DesignSystem>.
//   - project.getScreen(screenId) → Promise<Screen>.
//   - screen.edit(prompt, deviceType?, modelId?) → Promise<Screen>.
//   - screen.variants(prompt, variantOptions, deviceType?, modelId?) → Promise<Screen[]>.
//   - screen.getHtml() → Promise<string> (download URL).
//   - screen.getImage() → Promise<string> (screenshot URL).
//
// Aspect enum is UPPERCASE_SNAKE: "LAYOUT" | "COLOR_SCHEME" | "IMAGES" |
// "TEXT_FONT" | "TEXT_CONTENT". Operator-facing flags use lowercase aliases
// (color, layout, fonts, images, text) for ergonomics; the wrapper translates.

export type DeviceType = "MOBILE" | "DESKTOP" | "TABLET" | "AGNOSTIC";
export type CreativeRange = "REFINE" | "EXPLORE" | "REIMAGINE";
export type Aspect = "LAYOUT" | "COLOR_SCHEME" | "IMAGES" | "TEXT_FONT" | "TEXT_CONTENT";
export type ModelId = "GEMINI_3_PRO" | "GEMINI_3_FLASH";

export interface VariantOptions {
  variantCount?: number;       // 1..5, default 3
  creativeRange?: CreativeRange; // default "EXPLORE"
  aspects?: Aspect[];          // default: all five
}

export interface StitchScreen {
  id: string;
  getHtml(): Promise<string>;
  getImage(): Promise<string>;
  edit(prompt: string, deviceType?: DeviceType, modelId?: ModelId): Promise<StitchScreen>;
  variants(prompt: string, variantOptions: VariantOptions, deviceType?: DeviceType, modelId?: ModelId): Promise<StitchScreen[]>;
}

export interface StitchProject {
  id: string;
  generate(prompt: string, deviceType?: DeviceType): Promise<StitchScreen>;
  screens(): Promise<StitchScreen[]>;
  getScreen(screenId: string): Promise<StitchScreen>;
  createDesignSystem(designSystem: unknown): Promise<unknown>;
  listDesignSystems(): Promise<unknown[]>;
  designSystem(id: string): unknown;
}

export interface StitchClient {
  projects(): Promise<StitchProject[]>;
  project(id: string): StitchProject;
  callTool<T = unknown>(name: string, args: Record<string, unknown>): Promise<T>;
  listTools(): Promise<{ tools: unknown }>;
}

let cachedClient: StitchClient | null = null;

export async function getStitchClient(): Promise<StitchClient> {
  if (cachedClient) return cachedClient;
  const apiKey = process.env.STITCH_API_KEY;
  const accessToken = process.env.STITCH_ACCESS_TOKEN;
  if (!apiKey && !accessToken) {
    throw new Error(
      "Stitch credentials missing: set STITCH_API_KEY (preferred) or STITCH_ACCESS_TOKEN + GOOGLE_CLOUD_PROJECT.",
    );
  }
  let mod: { stitch?: StitchClient; Stitch?: new (opts?: unknown) => StitchClient };
  try {
    mod = (await import("@google/stitch-sdk")) as typeof mod;
  } catch (err) {
    throw new Error(
      `@google/stitch-sdk is not installed. Run \`pnpm add @google/stitch-sdk\`. Underlying: ${(err as Error).message}`,
    );
  }
  // The pre-configured singleton picks up env vars itself; prefer it.
  if (mod.stitch) {
    cachedClient = mod.stitch;
    return cachedClient;
  }
  if (mod.Stitch) {
    cachedClient = new mod.Stitch();
    return cachedClient;
  }
  throw new Error("@google/stitch-sdk did not export `stitch` singleton or `Stitch` constructor.");
}

// --- Aspect translation -----------------------------------------------------
// Operators (and `/design-edit --aspect ...`) use lowercase ergonomic names.
// The SDK uses UPPERCASE_SNAKE. Translate at the wrapper boundary.

export const ASPECT_ALIASES = {
  layout: "LAYOUT",
  color: "COLOR_SCHEME",
  images: "IMAGES",
  fonts: "TEXT_FONT",
  text: "TEXT_CONTENT",
} as const satisfies Record<string, Aspect>;

export type AspectAlias = keyof typeof ASPECT_ALIASES;

export function toAspect(alias: string): Aspect {
  const normalized = alias.toLowerCase() as AspectAlias;
  const a = ASPECT_ALIASES[normalized];
  if (!a) {
    throw new Error(
      `Unknown aspect "${alias}". Valid aliases: ${Object.keys(ASPECT_ALIASES).join(", ")}.`,
    );
  }
  return a;
}

export function toAspects(csv: string | undefined): Aspect[] | undefined {
  if (!csv) return undefined;
  return csv.split(",").map((s) => toAspect(s.trim()));
}

// --- Project bootstrap -------------------------------------------------------

/**
 * Idempotent: returns an existing project id if one is recorded for `purpose`,
 * otherwise creates a project via `stitch.callTool("create_project", {...})`
 * and returns its id. Caller persists the id.
 */
export async function ensureProject(opts: {
  recorded: { id: string } | undefined;
  envProjectId: string | undefined;
  purpose: string;
  title?: string;
}): Promise<{ projectId: string; created: boolean }> {
  if (opts.envProjectId) {
    return { projectId: opts.envProjectId, created: false };
  }
  if (opts.recorded?.id) {
    return { projectId: opts.recorded.id, created: false };
  }
  const client = await getStitchClient();
  const result = await client.callTool<{ projectId?: string; id?: string }>("create_project", {
    title: opts.title ?? `rpg-site-${opts.purpose}`,
  });
  const id = result.projectId ?? result.id;
  if (!id) {
    throw new Error(`stitch.callTool("create_project") did not return projectId. Got: ${JSON.stringify(result)}`);
  }
  return { projectId: id, created: true };
}
