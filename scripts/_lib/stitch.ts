// Thin wrapper around the Stitch SDK so the rest of the harness doesn't depend
// on the SDK's exact import shape. The `@google/stitch-sdk` package is the
// presumed name from the implementation plan; if upstream uses a different
// name, change it here in one place.
//
// Implementer note: confirm the actual package name and surface (`stitch`,
// `Stitch`, default vs named export) against
// https://github.com/google-labs-code/stitch-sdk before relying on this in
// production. The wrapper falls back to a typed-stub mode when the package is
// not installed, so unit tests of *our* glue logic don't require the SDK.

export interface StitchScreen {
  id: string;
  getHtml(): Promise<string | { url: string }>;
  getImage(): Promise<string | { url: string }>;
  edit(prompt: string): Promise<StitchScreen>;
  variants(prompt: string, options: VariantOptions): Promise<StitchScreen[]>;
}

export interface StitchProject {
  id: string;
  generate(prompt: string, deviceType: DeviceType): Promise<StitchScreen>;
  createDesignSystem(designSystem: unknown): Promise<unknown>;
}

export type DeviceType = "DESKTOP" | "MOBILE" | "TABLET" | "AGNOSTIC";
export type CreativeRange = "REFINE" | "EXPLORE" | "REIMAGINE";
export type Aspect = "layout" | "color" | "fonts" | "images" | "text";

export interface VariantOptions {
  creativeRange: CreativeRange;
  aspects?: Aspect[];
  variantCount?: number;
}

export interface StitchClient {
  projects: {
    create(opts: { name: string; purpose?: string }): Promise<StitchProject>;
  };
  project(id: string): Promise<StitchProject>;
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
  // Lazy-import so the harness can author files without the SDK installed yet.
  let mod: { Stitch?: new (opts: unknown) => StitchClient; default?: new (opts: unknown) => StitchClient };
  try {
    mod = (await import("@google/stitch-sdk")) as typeof mod;
  } catch (err) {
    throw new Error(
      `@google/stitch-sdk is not installed. Run \`pnpm add @google/stitch-sdk\`. Underlying: ${(err as Error).message}`,
    );
  }
  const Ctor = mod.Stitch ?? mod.default;
  if (!Ctor) {
    throw new Error("Could not find Stitch constructor; check the SDK's exported surface.");
  }
  cachedClient = new Ctor({ apiKey, accessToken, project: process.env.GOOGLE_CLOUD_PROJECT });
  return cachedClient;
}

// Some SDK methods return either a string URL or an object with `.url`. Normalize.
export function asUrl(v: string | { url: string }): string {
  return typeof v === "string" ? v : v.url;
}
