import type { CustomProjectConfig } from "lost-pixel";

const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: "./storybook-static",
  },
  imagePathBaseline: ".lostpixel/baseline",
  imagePathCurrent: ".lostpixel/current",
  imagePathDifference: ".lostpixel/diff",
  threshold: 0.005,
  lostPixelProjectId: process.env.LOST_PIXEL_PROJECT_ID,
  apiKey: process.env.LOST_PIXEL_API_KEY,
  shotConcurrency: 4,
  timeouts: {
    fetchStories: 60_000,
    loadState: 60_000,
    networkRequests: 60_000,
  },
  // Per-viewport: Stitch generates DESKTOP and MOBILE separately; baselines are stored
  // under .lostpixel/baseline/<storyId>/<viewport>.png by stitch-render-baseline.ts.
  // The default Storybook capture matches DESKTOP@1280; per-viewport captures are
  // produced by tests/visual/*.spec.ts using Playwright directly.
};

export default config;
