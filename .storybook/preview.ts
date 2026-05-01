import type { Preview } from "@storybook/react";
import "../src/app/globals.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: { color: /(background|color)$/i, date: /Date$/ },
    },
    backgrounds: {
      default: "parchment",
      values: [
        { name: "parchment", value: "#f3e9d2" },
        { name: "candlelight", value: "#1c140d" },
        { name: "white", value: "#ffffff" },
      ],
    },
    viewport: {
      viewports: {
        mobile: { name: "Mobile (375)", styles: { width: "375px", height: "667px" } },
        tablet: { name: "Tablet (768)", styles: { width: "768px", height: "1024px" } },
        desktop: { name: "Desktop (1280)", styles: { width: "1280px", height: "800px" } },
        wide: { name: "Wide (1920)", styles: { width: "1920px", height: "1080px" } },
      },
      defaultViewport: "desktop",
    },
    a11y: {
      // axe-core options forwarded by addon-a11y (test-runner uses the same).
      config: { rules: [{ id: "color-contrast", enabled: true }] },
    },
  },
};

export default preview;
