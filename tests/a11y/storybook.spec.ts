/**
 * Smoke a11y test that opens Storybook's index and asserts no serious axe
 * violations on the welcome screen. Per-story a11y checks run via the Storybook
 * test-runner config (.storybook/test-runner.ts).
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("storybook index has no serious a11y violations", async ({ page }) => {
  await page.goto("/?path=/story/welcome--default");
  await page.waitForLoadState("networkidle");
  const results = await new AxeBuilder({ page })
    .options({ runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } })
    .analyze();
  const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious).toEqual([]);
});
