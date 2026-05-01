import { defineConfig, devices } from "@playwright/test";

const STORYBOOK_URL = process.env.STORYBOOK_URL ?? "http://127.0.0.1:6006";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: STORYBOOK_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "scenarios",
      testDir: "./tests/scenarios",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } },
    },
    {
      name: "axe",
      testDir: "./tests/a11y",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "visual",
      testDir: "./tests/visual",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "parity",
      testDir: "./tests/parity",
      use: { ...devices["Desktop Chrome"] },
      // Parity tests run against the target site, not Storybook.
      // Each parity spec sets its own baseURL via test.use({ baseURL: ... }).
    },
  ],
  webServer: process.env.CI
    ? undefined
    : {
        command: "pnpm storybook --quiet --ci",
        url: STORYBOOK_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
