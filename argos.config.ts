// Argos config — visual review surface that ingests Storybook screenshots.
// The actual upload happens via `argos upload .lostpixel/current` in CI.
// This file documents the expected naming convention so that diffs in Argos UI
// match the storyId convention used everywhere else in the harness.
export default {
  token: process.env.ARGOS_TOKEN,
  // Map our per-viewport screenshots into Argos "name" prefixes.
  // .lostpixel/current/<storyId>--<viewport>.png → Argos name "<storyId>/<viewport>".
  buildName: process.env.GITHUB_RUN_ID ?? "local",
  parallel: false,
};
